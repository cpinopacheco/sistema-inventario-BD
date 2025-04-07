import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/productos - Obtener todos los productos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get("categoria");
    const busqueda = searchParams.get("busqueda");
    const stockBajo = searchParams.get("stockBajo");

    let sql = `
      SELECT p.*, c.nombre as categoria
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (categoria) {
      sql += ` AND c.id = $${paramIndex}`;
      params.push(categoria);
      paramIndex++;
    }

    if (busqueda) {
      sql += ` AND (p.nombre ILIKE $${paramIndex} OR p.id ILIKE $${paramIndex} OR c.nombre ILIKE $${paramIndex})`;
      params.push(`%${busqueda}%`);
      paramIndex++;
    }

    if (stockBajo === "true") {
      sql += ` AND p.cantidad <= 10`;
    }

    sql += " ORDER BY p.id";

    const result = await query(sql, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json(
      { error: "Error al obtener productos" },
      { status: 500 }
    );
  }
}

// POST /api/productos - Crear un nuevo producto
export async function POST(request: Request) {
  try {
    const producto = await request.json();

    // Validaciones básicas
    if (!producto.nombre || producto.nombre.trim() === "") {
      return NextResponse.json(
        { error: "El nombre del producto es obligatorio" },
        { status: 400 }
      );
    }

    if (producto.cantidad < 0) {
      return NextResponse.json(
        { error: "La cantidad no puede ser negativa" },
        { status: 400 }
      );
    }

    if (!producto.categoria_id) {
      return NextResponse.json(
        { error: "La categoría es obligatoria" },
        { status: 400 }
      );
    }

    // Generar ID del producto - SOLUCIÓN MEJORADA
    // En lugar de contar todos los productos, buscamos el ID numérico más alto
    const maxIdResult = await query(`
      SELECT MAX(SUBSTRING(id, 2)::integer) as max_id 
      FROM productos 
      WHERE id LIKE 'P%'
    `);

    // Si no hay productos o hay un error al obtener el máximo, comenzamos desde 1
    const maxId = maxIdResult.rows[0].max_id || 0;
    const nextId = maxId + 1;
    const id = `P${String(nextId).padStart(3, "0")}`;

    // Verificar que el ID no exista (doble verificación)
    const existingProduct = await query(
      "SELECT id FROM productos WHERE id = $1",
      [id]
    );
    if (existingProduct.rowCount > 0) {
      // Si por alguna razón el ID ya existe, generamos uno con un número más alto
      const safeId = `P${String(nextId + 1).padStart(3, "0")}`;
      console.log(`ID ${id} ya existe, usando ${safeId} en su lugar`);

      const result = await query(
        `INSERT INTO productos (id, nombre, cantidad, descripcion, categoria_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          safeId,
          producto.nombre,
          producto.cantidad,
          producto.descripcion,
          producto.categoria_id,
        ]
      );

      // Obtener el nombre de la categoría para la respuesta
      const categoriaResult = await query(
        "SELECT nombre FROM categorias WHERE id = $1",
        [producto.categoria_id]
      );

      const productoCreado = {
        ...result.rows[0],
        categoria: categoriaResult.rows[0].nombre,
      };

      return NextResponse.json(productoCreado, { status: 201 });
    }

    // Si el ID no existe, procedemos normalmente
    const result = await query(
      `INSERT INTO productos (id, nombre, cantidad, descripcion, categoria_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        id,
        producto.nombre,
        producto.cantidad,
        producto.descripcion,
        producto.categoria_id,
      ]
    );

    // Obtener el nombre de la categoría para la respuesta
    const categoriaResult = await query(
      "SELECT nombre FROM categorias WHERE id = $1",
      [producto.categoria_id]
    );

    const productoCreado = {
      ...result.rows[0],
      categoria: categoriaResult.rows[0].nombre,
    };

    return NextResponse.json(productoCreado, { status: 201 });
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json(
      { error: "Error al crear producto" },
      { status: 500 }
    );
  }
}
