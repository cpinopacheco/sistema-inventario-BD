"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Save, Package2 } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { TooltipSimple } from "@/components/ui/tooltip-simple";
import { TooltipProvider } from "@/components/ui/tooltip";

// ProductList component displays all products in a table format
export default function ProductList({
  products,
  onSelectProduct,
  selectedProductId,
  onUpdateQuantity,
  onRequestSort,
  sortConfig,
  isLowStockTab = false,
  loading = false,
}) {
  // Estado para manejar cambios en lote
  const [editedProducts, setEditedProducts] = useState({});

  // Resetear el estado cuando cambian los productos
  useEffect(() => {
    setEditedProducts({});
  }, [products]);

  // Función para determinar la dirección de ordenamiento
  const getSortDirection = (key) => {
    if (!sortConfig) {
      return null;
    }
    return sortConfig.key === key ? sortConfig.direction : null;
  };

  // Función para mostrar el indicador de ordenamiento
  const getSortIndicator = (key) => {
    const direction = getSortDirection(key);
    if (!direction) return null;
    return direction === "ascending" ? " ↑" : " ↓";
  };

  // Función para manejar cambios locales de cantidad
  const handleQuantityChange = (id, change) => {
    setEditedProducts((prev) => {
      const currentProduct = products.find((p) => p.id === id);
      const currentEdit = prev[id] || {
        original: currentProduct.cantidad,
        current: currentProduct.cantidad,
      };

      // Calcular nueva cantidad (no permitir valores negativos)
      const newQuantity = Math.max(0, currentEdit.current + change);

      return {
        ...prev,
        [id]: {
          original: currentEdit.original,
          current: newQuantity,
        },
      };
    });
  };

  // Función para guardar cambios de un producto
  const handleSaveChanges = (id) => {
    if (editedProducts[id]) {
      const change = editedProducts[id].current - editedProducts[id].original;
      if (change !== 0) {
        onUpdateQuantity(id, change);
      }

      // Eliminar el producto del estado de edición
      const newEditedProducts = { ...editedProducts };
      delete newEditedProducts[id];
      setEditedProducts(newEditedProducts);
    }
  };

  // Obtener la cantidad actual (editada o original)
  const getCurrentQuantity = (product) => {
    return editedProducts[product.id]
      ? editedProducts[product.id].current
      : product.cantidad;
  };

  // Verificar si un producto ha sido editado
  const isProductEdited = (id) => {
    return (
      editedProducts[id] &&
      editedProducts[id].current !== editedProducts[id].original
    );
  };

  // Manejar la selección de producto sin propagar el evento
  const handleSelectProduct = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectProduct(product);
  };

  return (
    <TooltipProvider>
      <div className="bg-card rounded-lg shadow-md overflow-hidden flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium text-[#013612] dark:text-[#BFD189]">
            {isLowStockTab
              ? "Productos con Stock Bajo"
              : "Productos en Inventario"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {products.length} productos{" "}
            {isLowStockTab ? "con stock bajo" : "en inventario"}
          </p>
        </div>

        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-[80px]">#</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => onRequestSort("nombre")}
                >
                  Nombre {getSortIndicator("nombre")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => onRequestSort("categoria")}
                >
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Loader />
                      <span>Cargando productos...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                  >
                    No se encontraron productos
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.03,
                      ease: [0.25, 0.1, 0.25, 1.0],
                    }}
                    className={`cursor-pointer transition-colors ${
                      selectedProductId === product.id
                        ? "bg-gray-100 dark:bg-gray-700/60"
                        : ""
                    } hover:bg-gray-100 dark:hover:bg-gray-700/40`}
                    onClick={(e) => handleSelectProduct(e, product)}
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
                          getCurrentQuantity(product) > 10
                            ? "bg-[#BFD189] hover:bg-[#a9bd77] text-[#013612] dark:bg-[#2a3b1e] dark:text-[#BFD189]"
                            : "bg-red-600 hover:bg-red-700 text-white"
                        }
                      >
                        {getCurrentQuantity(product)}
                        {isProductEdited(product.id) && "*"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className="flex justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TooltipSimple text="Aumentar cantidad">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-900 dark:hover:bg-green-950"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(product.id, 1);
                            }}
                          >
                            <Plus size={14} />
                          </Button>
                        </TooltipSimple>

                        <TooltipSimple text="Disminuir cantidad">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-gray-600 border-gray-200 hover:bg-gray-50 dark:text-gray-400 dark:border-gray-800 dark:hover:bg-gray-900"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(product.id, -1);
                            }}
                            disabled={getCurrentQuantity(product) <= 0}
                          >
                            <Minus size={14} />
                          </Button>
                        </TooltipSimple>

                        <TooltipSimple
                          text={
                            isProductEdited(product.id)
                              ? "Guardar cambios"
                              : "Sin cambios"
                          }
                        >
                          <Button
                            variant="outline"
                            size="icon"
                            className={`h-8 w-8 ${
                              isProductEdited(product.id)
                                ? "text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-900 dark:hover:bg-blue-950"
                                : "text-gray-400 border-gray-200 cursor-not-allowed"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveChanges(product.id);
                            }}
                            disabled={!isProductEdited(product.id)}
                          >
                            <Save size={14} />
                          </Button>
                        </TooltipSimple>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  );
}
