import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// PATCH /api/productos/[id]/cantidad - Actualizar cantidad de un producto
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { cambio } = await request.json();

    if (cambio === undefined) {
      return NextResponse.json(
        { error: "El cambio de cantidad es obligatorio" },
        { status: 400 }
      );
    }

    // Obtener cantidad actual
    const currentResult = await query(
      "SELECT cantidad FROM productos WHERE id = $1",
      [id]
    );

    if (currentResult.rowCount === 0) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const cantidadActual = currentResult.rows[0].cantidad;
    const nuevaCantidad = Math.max(0, cantidadActual + cambio);

    const result = await query(
      `UPDATE productos 
       SET cantidad = $1
       WHERE id = $2
       RETURNING *`,
      [nuevaCantidad, id]
    );

    // Obtener el nombre de la categoría para la respuesta
    const productoResult = await query(
      `SELECT p.*, c.nombre as categoria
       FROM productos p
       JOIN categorias c ON p.categoria_id = c.id
       WHERE p.id = $1`,
      [id]
    );

    return NextResponse.json(productoResult.rows[0]);
  } catch (error) {
    console.error("Error al actualizar cantidad:", error);
    return NextResponse.json(
      { error: "Error al actualizar cantidad" },
      { status: 500 }
    );
  }
}
