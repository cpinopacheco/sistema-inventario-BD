"use client";

import type React from "react";

import { useState } from "react";
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
import { Plus, Minus, Package2 } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { TooltipSimple } from "@/components/ui/tooltip-simple";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StockAdjustmentModal } from "./stock-adjustment-modal";
import type { ProductListProps, ProductoConCategoria } from "@/types";

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
}: ProductListProps) {
  // Estado para el modal de ajuste de stock
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [selectedProductForAdjustment, setSelectedProductForAdjustment] =
    useState<ProductoConCategoria | null>(null);
  const [isIncrement, setIsIncrement] = useState(true);

  // Función para determinar la dirección de ordenamiento
  const getSortDirection = (key: string): string | null => {
    if (!sortConfig) {
      return null;
    }
    return sortConfig.key === key ? sortConfig.direction : null;
  };

  // Función para mostrar el indicador de ordenamiento
  const getSortIndicator = (key: string): string => {
    const direction = getSortDirection(key);
    if (!direction) return "";
    return direction === "ascending" ? " ↑" : " ↓";
  };

  // Función para abrir el modal de ajuste de stock
  const handleOpenAdjustmentModal = (
    product: ProductoConCategoria,
    increment: boolean
  ) => {
    setSelectedProductForAdjustment(product);
    setIsIncrement(increment);
    setIsAdjustmentModalOpen(true);
  };

  // Función para confirmar el ajuste de stock
  const handleConfirmAdjustment = (cantidad: number) => {
    if (selectedProductForAdjustment) {
      onUpdateQuantity(selectedProductForAdjustment.id, cantidad);
      setIsAdjustmentModalOpen(false);
      setSelectedProductForAdjustment(null);
    }
  };

  // Manejar la selección de producto sin propagar el evento
  const handleSelectProduct = (
    e: React.MouseEvent,
    product: ProductoConCategoria
  ) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectProduct(product);
  };

  // Truncar texto largo
  const truncateText = (text: string | null, maxLength = 50): string => {
    if (!text) return "Sin descripción";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  return (
    <TooltipProvider>
      <div className="bg-card rounded-lg shadow-md dark:border dark:border-gray-700 dark:shadow-md dark:shadow-black/30">
        <div className="p-4 border-b dark:border-gray-600">
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

        <div>
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow className="dark:border-gray-600">
                <TableHead className="w-[80px] dark:border-gray-600">
                  #
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted dark:border-gray-600"
                  onClick={() => onRequestSort("nombre")}
                >
                  Nombre {getSortIndicator("nombre")}
                </TableHead>
                <TableHead className="dark:border-gray-600">
                  Descripción
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted dark:border-gray-600"
                  onClick={() => onRequestSort("categoria")}
                >
                  Categoría {getSortIndicator("categoria")}
                </TableHead>
                <TableHead
                  className="text-center cursor-pointer hover:bg-muted dark:border-gray-600"
                  onClick={() => onRequestSort("cantidad")}
                >
                  Stock {getSortIndicator("cantidad")}
                </TableHead>
                <TableHead className="text-right dark:border-gray-600">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="dark:border-gray-600">
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Loader />
                      <span>Cargando productos...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow className="dark:border-gray-600">
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500 dark:text-gray-400 dark:border-gray-600"
                  >
                    No se encontraron productos
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product: ProductoConCategoria, index: number) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.03,
                      ease: [0.25, 0.1, 0.25, 1.0],
                    }}
                    className={`cursor-pointer transition-colors dark:border-gray-600 ${
                      selectedProductId === product.id
                        ? "bg-gray-100/80 dark:bg-gray-700/40"
                        : ""
                    } hover:bg-gray-100/50 dark:hover:bg-gray-700/25`}
                    onClick={(e) => handleSelectProduct(e, product)}
                  >
                    <TableCell className="font-medium dark:border-gray-600">
                      {product.id}
                    </TableCell>
                    <TableCell className="dark:border-gray-600">
                      <div className="flex items-center gap-2">
                        <Package2 size={16} className="text-gray-400" />
                        {product.nombre}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate dark:border-gray-600">
                      <TooltipSimple
                        text={product.descripcion || "Sin descripción"}
                      >
                        <span>{truncateText(product.descripcion)}</span>
                      </TooltipSimple>
                    </TableCell>
                    <TableCell className="dark:border-gray-600">
                      {product.categoria}
                    </TableCell>
                    <TableCell className="text-center dark:border-gray-600">
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
                    <TableCell className="text-right dark:border-gray-600">
                      <div
                        className="flex justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TooltipSimple text="Aumentar cantidad">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-green-600 border-green-500 hover:bg-green-100 dark:text-green-400 dark:border-green-500 dark:hover:bg-green-900 border"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAdjustmentModal(product, true);
                            }}
                          >
                            <Plus size={14} />
                          </Button>
                        </TooltipSimple>

                        <TooltipSimple text="Disminuir cantidad">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-gray-600 border-gray-400 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-800 border"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAdjustmentModal(product, false);
                            }}
                            disabled={product.cantidad <= 0}
                          >
                            <Minus size={14} />
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

        {/* Modal para ajustar stock */}
        {selectedProductForAdjustment && (
          <StockAdjustmentModal
            isOpen={isAdjustmentModalOpen}
            onClose={() => setIsAdjustmentModalOpen(false)}
            onConfirm={handleConfirmAdjustment}
            productName={selectedProductForAdjustment.nombre}
            currentStock={selectedProductForAdjustment.cantidad}
            isIncrement={isIncrement}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
