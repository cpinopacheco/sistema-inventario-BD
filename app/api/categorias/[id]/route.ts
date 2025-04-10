import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/categorias/[id] - Obtener una categoría por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const result = await query("SELECT * FROM categorias WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener categoría:", error);
    return NextResponse.json(
      { error: "Error al obtener categoría" },
      { status: 500 }
    );
  }
}

// PUT /api/categorias/[id] - Actualizar una categoría
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { nombre } = await request.json();

    if (!nombre || nombre.trim() === "") {
      return NextResponse.json(
        { error: "El nombre de la categoría es obligatorio" },
        { status: 400 }
      );
    }

    // Verificar si la categoría existe
    const categoryCheck = await query(
      "SELECT * FROM categorias WHERE id = $1",
      [id]
    );

    if (!categoryCheck || categoryCheck.rowCount === 0) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    // Verificar si el nuevo nombre ya existe en otra categoría
    const nameCheck = await query(
      "SELECT * FROM categorias WHERE nombre = $1 AND id != $2",
      [nombre, id]
    );

    // Verificar que nameCheck no sea null y luego verificar rowCount
    if (nameCheck && nameCheck.rowCount && nameCheck.rowCount > 0) {
      return NextResponse.json(
        { error: "Ya existe otra categoría con ese nombre" },
        { status: 409 }
      );
    }

    const result = await query(
      "UPDATE categorias SET nombre = $1 WHERE id = $2 RETURNING *",
      [nombre, id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    return NextResponse.json(
      { error: "Error al actualizar categoría" },
      { status: 500 }
    );
  }
}

// DELETE /api/categorias/[id] - Eliminar una categoría
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Verificar si hay productos usando esta categoría
    const productsCheck = await query(
      "SELECT COUNT(*) FROM productos WHERE categoria_id = $1",
      [id]
    );

    // Verificar que productsCheck no sea null antes de acceder a sus propiedades
    if (
      productsCheck &&
      productsCheck.rows &&
      productsCheck.rows[0] &&
      Number.parseInt(productsCheck.rows[0].count) > 0
    ) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar la categoría porque tiene productos asociados",
        },
        { status: 400 }
      );
    }

    const result = await query(
      "DELETE FROM categorias WHERE id = $1 RETURNING *",
      [id]
    );

    if (!result || result.rowCount === 0) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Categoría eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    return NextResponse.json(
      { error: "Error al eliminar categoría" },
      { status: 500 }
    );
  }
}
