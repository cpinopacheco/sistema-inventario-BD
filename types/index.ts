// Tipo para categorías
export interface Categoria {
  id: number
  nombre: string
}

// Tipo para productos
export interface Producto {
  id: string
  nombre: string
  cantidad: number
  descripcion: string | null
  categoria_id: number
  categoria?: string // Para uso en el frontend
  fecha_creacion?: Date
}

// Tipo para productos con nombre de categoría incluido
export interface ProductoConCategoria extends Producto {
  categoria: string
}

