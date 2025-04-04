import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET /api/estadisticas - Obtener estadísticas del inventario
export async function GET() {
  try {
    // Total de productos
    const totalProductosResult = await query("SELECT COUNT(*) FROM productos")
    const totalProductos = Number.parseInt(totalProductosResult.rows[0].count)

    // Total de stock
    const totalStockResult = await query("SELECT SUM(cantidad) FROM productos")
    const totalStock = Number.parseInt(totalStockResult.rows[0].sum || "0")

    // Productos con stock bajo
    const stockBajoResult = await query("SELECT COUNT(*) FROM productos WHERE cantidad <= 10")
    const stockBajo = Number.parseInt(stockBajoResult.rows[0].count)

    // Productos por categoría
    const porCategoriaResult = await query(`
      SELECT c.nombre, COUNT(p.id) as cantidad
      FROM categorias c
      LEFT JOIN productos p ON c.id = p.categoria_id
      GROUP BY c.nombre
      ORDER BY cantidad DESC
    `)

    return NextResponse.json({
      totalProductos,
      totalStock,
      stockBajo,
      porCategoria: porCategoriaResult.rows,
    })
  } catch (error) {
    console.error("Error al obtener estadísticas:", error)
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 })
  }
}

