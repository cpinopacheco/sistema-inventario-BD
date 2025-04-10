"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TooltipSimple } from "@/components/ui/tooltip-simple";
import { TooltipProvider } from "@/components/ui/tooltip";

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
          className="bg-background rounded-lg shadow-xl w-full max-w-md border-2 border-[#BFD189] dark:border-gray-600"
        >
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-medium text-[#013612] dark:text-[#BFD189]">
              {isIncrement ? "Aumentar" : "Disminuir"} Stock
            </h2>
            <TooltipSimple text="Cerrar">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X size={18} />
              </Button>
            </TooltipSimple>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Producto:{" "}
                <span className="font-medium text-foreground">
                  {productName}
                </span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Stock actual:{" "}
                <span className="font-medium text-foreground">
                  {currentStock}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidad">
                Cantidad a {isIncrement ? "agregar" : "restar"}
              </Label>
              <div className="flex items-center gap-2">
                {isIncrement ? (
                  <Plus
                    size={16}
                    className="text-green-600 dark:text-green-400"
                  />
                ) : (
                  <Minus size={16} className="text-red-600 dark:text-red-400" />
                )}
                <Input
                  id="cantidad"
                  value={cantidad}
                  onChange={handleChange}
                  className={error ? "border-red-500" : ""}
                  placeholder="Ingrese cantidad"
                  autoFocus
                />
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                className={
                  isIncrement
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }
              >
                {isIncrement ? "Aumentar" : "Disminuir"} Stock
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
