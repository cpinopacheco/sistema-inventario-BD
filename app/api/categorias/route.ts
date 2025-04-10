import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/categorias - Obtener todas las categorías
export async function GET() {
  try {
    // Verificar conexión a la base de datos primero
    try {
      const testConnection = await query("SELECT 1");
      console.log("Conexión a la base de datos verificada");
    } catch (dbError) {
      console.error("Error de conexión a la base de datos:", dbError);
      return NextResponse.json(
        { error: "Error de conexión a la base de datos" },
        { status: 500 }
      );
    }

    const result = await query("SELECT * FROM categorias ORDER BY nombre");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return NextResponse.json(
      {
        error:
          "Error al obtener categorías: " +
          (error instanceof Error ? error.message : "Error desconocido"),
      },
      { status: 500 }
    );
  }
}

// POST /api/categorias - Crear una nueva categoría
export async function POST(request: Request) {
  try {
    const { nombre } = await request.json();

    if (!nombre || nombre.trim() === "") {
      return NextResponse.json(
        { error: "El nombre de la categoría es obligatorio" },
        { status: 400 }
      );
    }

    // Verificar si la categoría ya existe
    const existingCategory = await query(
      "SELECT * FROM categorias WHERE nombre = $1",
      [nombre]
    );

    if (
      existingCategory &&
      existingCategory.rowCount &&
      existingCategory.rowCount > 0
    ) {
      return NextResponse.json(
        { error: "Ya existe una categoría con ese nombre" },
        { status: 409 }
      );
    }

    const result = await query(
      "INSERT INTO categorias (nombre) VALUES ($1) RETURNING *",
      [nombre]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error al crear categoría:", error);
    return NextResponse.json(
      {
        error:
          "Error al crear categoría: " +
          (error instanceof Error ? error.message : "Error desconocido"),
      },
      { status: 500 }
    );
  }
}
