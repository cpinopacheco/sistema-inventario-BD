"use client"

import { motion } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Minus, Trash2, Package2 } from "lucide-react"

// ProductList component displays all products in a table format
export default function ProductList({
  products,
  onSelectProduct,
  selectedProductId,
  onUpdateQuantity,
  onRequestSort,
  sortConfig,
  isLowStockTab = false,
}) {
  // Función para determinar la dirección de ordenamiento
  const getSortDirection = (key) => {
    if (!sortConfig) {
      return null
    }
    return sortConfig.key === key ? sortConfig.direction : null
  }

  // Función para mostrar el indicador de ordenamiento
  const getSortIndicator = (key) => {
    const direction = getSortDirection(key)
    if (!direction) return null
    return direction === "ascending" ? " ↑" : " ↓"
  }

  return (
    <div className="bg-card rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium text-[#013612] dark:text-[#BFD189]">
          {isLowStockTab ? "Productos con Stock Bajo" : "Productos en Inventario"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {products.length} productos {isLowStockTab ? "con stock bajo" : "en inventario"}
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">#</TableHead>
              <TableHead className="cursor-pointer hover:bg-muted" onClick={() => onRequestSort("nombre")}>
                Nombre {getSortIndicator("nombre")}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted" onClick={() => onRequestSort("categoria")}>
                Categoría {getSortIndicator("categoria")}
              </TableHead>
              <TableHead
                className="text-center cursor-pointer hover:bg-muted"
                onClick={() => onRequestSort("cantidad")}
              >
                Stock {getSortIndicator("cantidad")}
              </TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            ) : (
              products.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`cursor-pointer hover:bg-muted transition-colors ${
                    selectedProductId === product.id ? "bg-muted/50" : ""
                  }`}
                  onClick={() => onSelectProduct(product)}
                >
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package2 size={16} className="text-gray-400" />
                      {product.nombre}
                    </div>
                  </TableCell>
                  <TableCell>{product.categoria}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className={
                        product.cantidad > 10
                          ? "bg-[#BFD189] hover:bg-[#a9bd77] text-[#013612] dark:bg-[#2a3b1e] dark:text-[#BFD189]"
                          : "bg-red-600 hover:bg-red-700 text-white"
                      }
                    >
                      {product.cantidad}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-900 dark:hover:bg-green-950"
                        onClick={() => onUpdateQuantity(product.id, 1)}
                      >
                        <Plus size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-gray-600 border-gray-200 hover:bg-gray-50 dark:text-gray-400 dark:border-gray-800 dark:hover:bg-gray-900"
                        onClick={() => onUpdateQuantity(product.id, -1)}
                        disabled={product.cantidad <= 0}
                      >
                        <Minus size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950"
                        onClick={() => onUpdateQuantity(product.id, -product.cantidad)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

