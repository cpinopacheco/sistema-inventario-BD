"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (cantidad: number) => void;
  productName: string;
  currentStock: number;
  isIncrement: boolean;
}

export function StockAdjustmentModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
  currentStock,
  isIncrement,
}: StockAdjustmentModalProps) {
  const [cantidad, setCantidad] = useState<string>("1");
  const [error, setError] = useState<string | null>(null);

  // Resetear el estado cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setCantidad("1");
      setError(null);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Permitir solo números
    if (value === "" || /^\d+$/.test(value)) {
      setCantidad(value);
      setError(null);
    }
  };

  const handleConfirm = () => {
    // Validar que no esté vacío
    if (!cantidad.trim()) {
      setError("La cantidad es obligatoria");
      return;
    }

    const cantidadNum = Number.parseInt(cantidad, 10);

    // Validar que sea un número positivo
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      setError("La cantidad debe ser un número positivo");
      return;
    }

    // Si es decremento, validar que no sea mayor al stock actual
    if (!isIncrement && cantidadNum > currentStock) {
      setError(`No puede restar más de ${currentStock} unidades`);
      return;
    }

    // Llamar a la función de confirmación con el valor
    if (typeof onConfirm === "function") {
      onConfirm(isIncrement ? cantidadNum : -cantidadNum);
    } else {
      console.error("La función onConfirm no está definida");
    }
  };

  // Función para determinar el estilo del badge según la cantidad
  const getStockBadgeStyle = (quantity: number) => {
    if (quantity > 10) {
      return "bg-[#BFD189] hover:bg-[#a9bd77] text-[#013612] dark:bg-[#3a5129] dark:hover:bg-[#456231] dark:text-[#d9f0a3] font-semibold text-sm px-3 py-0 flex items-center justify-center h-6";
    } else {
      return "bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600 dark:text-white font-semibold text-sm px-3 py-0 flex items-center justify-center h-6";
    }
  };

  if (!isOpen) return null;

  return (
    <TooltipProvider>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 400,
            mass: 1,
          }}
          className="w-full max-w-[500px] rounded-xl overflow-hidden bg-background border-2 border-[#BFD189] shadow-lg dark:border-gray-600"
        >
          <div className="bg-[#f5f9e8] dark:bg-[#1a2e22] py-4 px-6 relative flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#013612] dark:text-[#BFD189]">
              {isIncrement ? "Aumentar" : "Disminuir"} Stock
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-8 space-y-5">
            <div>
              <p className="text-base text-gray-500 dark:text-gray-300 mb-3">
                Producto:{" "}
                <span className="font-medium text-foreground">
                  {productName}
                </span>
              </p>
              <div className="flex items-center gap-2">
                <p className="text-base text-gray-500 dark:text-gray-300">
                  Stock actual:
                </p>
                <Badge className={getStockBadgeStyle(currentStock)}>
                  {currentStock}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="cantidad" className="text-base text-foreground">
                Cantidad a {isIncrement ? "agregar" : "restar"}
              </Label>
              <div className="flex items-center gap-2">
                {isIncrement ? (
                  <Plus
                    size={18}
                    className="text-green-600 dark:text-green-400"
                  />
                ) : (
                  <Minus size={18} className="text-red-600 dark:text-red-400" />
                )}
                <Input
                  id="cantidad"
                  value={cantidad}
                  onChange={handleChange}
                  className={`${
                    error ? "border-red-500" : ""
                  } dark:border-gray-600 dark:bg-gray-900 dark:text-white text-base`}
                  placeholder="Ingrese cantidad"
                  autoFocus
                />
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
            </div>
          </div>

          <div className="border-t p-6 flex justify-end gap-4 bg-background">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-[#EABD00] text-[#C79C00] hover:bg-[#EABD00]/10 dark:border-[#EABD00] dark:text-[#EABD00] dark:hover:bg-[#EABD00]/10 border px-6 py-2 text-base font-medium"
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              onClick={handleConfirm}
              className={
                isIncrement
                  ? "text-blue-600 border-blue-500 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-500 dark:hover:bg-blue-950 border px-6 py-2 text-base font-medium"
                  : "border-red-600 text-red-600 hover:bg-red-600/10 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-500/10 border px-6 py-2 text-base font-medium"
              }
            >
              {isIncrement ? "Aumentar" : "Disminuir"} Stock
            </Button>
          </div>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
