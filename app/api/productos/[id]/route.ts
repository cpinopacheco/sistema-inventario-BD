import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET /api/productos/[id] - Obtener un producto por ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const result = await query(
      `SELECT p.*, c.nombre as categoria
       FROM productos p
       JOIN categorias c ON p.categoria_id = c.id
       WHERE p.id = $1`,
      [id],
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error al obtener producto:", error)
    return NextResponse.json({ error: "Error al obtener producto" }, { status: 500 })
  }
}

// PUT /api/productos/[id] - Actualizar un producto
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const producto = await request.json()

    // Validaciones básicas
    if (!producto.nombre || producto.nombre.trim() === "") {
      return NextResponse.json({ error: "El nombre del producto es obligatorio" }, { status: 400 })
    }

    if (producto.cantidad < 0) {
      return NextResponse.json({ error: "La cantidad no puede ser negativa" }, { status: 400 })
    }

    if (!producto.categoria_id) {
      return NextResponse.json({ error: "La categoría es obligatoria" }, { status: 400 })
    }

    // Verificar si el producto existe
    const productCheck = await query("SELECT * FROM productos WHERE id = $1", [id])

    if (productCheck.rowCount === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    const result = await query(
      `UPDATE productos 
       SET nombre = $1, cantidad = $2, descripcion = $3, categoria_id = $4
       WHERE id = $5
       RETURNING *`,
      [producto.nombre, producto.cantidad, producto.descripcion, producto.categoria_id, id],
    )

    // Obtener el nombre de la categoría para la respuesta
    const categoriaResult = await query("SELECT nombre FROM categorias WHERE id = $1", [producto.categoria_id])

    const productoActualizado = {
      ...result.rows[0],
      categoria: categoriaResult.rows[0].nombre,
    }

    return NextResponse.json(productoActualizado)
  } catch (error) {
    console.error("Error al actualizar producto:", error)
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 })
  }
}

// DELETE /api/productos/[id] - Eliminar un producto
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const result = await query("DELETE FROM productos WHERE id = $1 RETURNING *", [id])

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ message: "Producto eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar producto:", error)
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 })
  }
}

