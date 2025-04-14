"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { motion } from "framer-motion";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Categoria } from "@/types";

interface AddProductFormProps {
  onAddProduct: (product: {
    name: string;
    quantity: number;
    description: string;
    categoria_id: number;
  }) => void;
  onCancel: () => void;
  categories: Categoria[];
  onAddCategory: (name: string) => Promise<Categoria | null>;
}

interface FormData {
  name: string;
  quantity: number;
  description: string;
  categoria_id: number | null;
}

interface FormErrors {
  name?: string;
  quantity?: string;
  categoria_id?: string;
}

// AddProductForm component provides a modal form to add new products
export default function AddProductForm({
  onAddProduct,
  onCancel,
  categories,
  onAddCategory,
}: AddProductFormProps) {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    quantity: 0,
    description: "",
    categoria_id: categories.length > 0 ? categories[0].id : null,
  });

  // Form validation state
  const [errors, setErrors] = useState<FormErrors>({});

  // New category state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categoryError, setCategoryError] = useState("");

  // Handle form input changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "quantity" ? Number.parseInt(value) || 0 : value,
    });

    // Clear error when field is edited
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    if (value === "nueva") {
      setIsAddingCategory(true);
    } else {
      setFormData({
        ...formData,
        categoria_id: Number.parseInt(value),
      });

      if (errors.categoria_id) {
        setErrors({
          ...errors,
          categoria_id: undefined,
        });
      }
    }
  };

  // Handle new category submission
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      setCategoryError("El nombre de la categoría es obligatorio");
      return;
    }

    const existingCategory = categories.find(
      (c) => c.nombre.toLowerCase() === newCategory.toLowerCase()
    );

    if (existingCategory) {
      setCategoryError("Esta categoría ya existe");
      return;
    }

    const result = await onAddCategory(newCategory);
    if (result) {
      setFormData({
        ...formData,
        categoria_id: result.id,
      });
      setNewCategory("");
      setIsAddingCategory(false);
      setCategoryError("");
    }
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre del producto es obligatorio";
    }

    if (formData.quantity < 0) {
      newErrors.quantity = "La cantidad no puede ser negativa";
    }

    if (!formData.categoria_id) {
      newErrors.categoria_id = "La categoría es obligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (validateForm() && formData.categoria_id !== null) {
      onAddProduct({
        name: formData.name,
        quantity: formData.quantity,
        description: formData.description,
        categoria_id: formData.categoria_id,
      });
    }
  };

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
          className="w-full max-w-[600px] rounded-xl overflow-hidden bg-background border-2 border-[#BFD189] shadow-lg dark:border-gray-600"
        >
          <div className="bg-[#f5f9e8] dark:bg-[#1a2e22] py-4 px-6 flex flex-row justify-between items-center">
            <h2 className="text-xl font-semibold text-[#013612] dark:text-[#BFD189]">
              Agregar Nuevo Producto
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-8 space-y-5">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-base">
                Nombre del Producto <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ingrese nombre del producto"
                className={`${errors.name ? "border-red-500" : ""} text-base`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="categoria_id" className="text-base">
                Categoría <span className="text-red-500">*</span>
              </Label>
              <Select
                value={
                  formData.categoria_id ? formData.categoria_id.toString() : ""
                }
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger
                  className={`bg-background ${
                    errors.categoria_id ? "border-red-500" : ""
                  } text-base`}
                >
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.nombre}
                    </SelectItem>
                  ))}
                  <SelectItem
                    value="nueva"
                    className="text-blue-600 dark:text-blue-400 font-medium group"
                  >
                    <div className="flex items-center gap-1 group-hover:text-black">
                      <Plus size={14} />
                      <span>Nueva Categoría</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.categoria_id && (
                <p className="text-red-500 text-xs">{errors.categoria_id}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="quantity" className="text-base">
                Cantidad <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="0"
                className={`${
                  errors.quantity ? "border-red-500" : ""
                } text-base`}
              />
              {errors.quantity && (
                <p className="text-red-500 text-xs">{errors.quantity}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-base">
                Descripción (Opcional)
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Ingrese descripción del producto"
                rows={3}
                className="text-base"
              />
            </div>
          </div>

          <div className="border-t p-6 flex justify-end gap-4 bg-background">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-[#EABD00] text-[#EABD00] hover:bg-[#EABD00]/10 dark:border-[#EABD00] dark:text-[#EABD00] dark:hover:bg-[#EABD00]/10 border"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="outline"
              onClick={handleSubmit}
              className="border-[#52C1E4] text-[#52C1E4] hover:bg-[#52C1E4]/10 dark:border-[#52C1E4] dark:text-[#52C1E4] dark:hover:bg-[#52C1E4]/10 border"
            >
              Agregar Producto
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Dialog para agregar nueva categoría */}
      <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <DialogContent className="sm:max-w-[425px] rounded-xl border-2 border-[#BFD189] dark:border-gray-600 p-0 overflow-hidden">
          <div className="bg-[#f5f9e8] dark:bg-[#1a2e22] py-4 px-6 flex flex-row justify-between items-center">
            <DialogTitle className="text-lg font-semibold text-[#013612] dark:text-[#BFD189]">
              Agregar Nueva Categoría
            </DialogTitle>
            <button
              onClick={() => setIsAddingCategory(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newCategory">Nombre de la Categoría</Label>
              <Input
                id="newCategory"
                value={newCategory}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewCategory(e.target.value)
                }
                placeholder="Ingrese nombre de la categoría"
                className={categoryError ? "border-red-500" : ""}
              />
              {categoryError && (
                <p className="text-red-500 text-xs">{categoryError}</p>
              )}
            </div>
          </div>

          <div className="border-t p-4 flex justify-end gap-2 bg-background">
            <Button
              variant="outline"
              onClick={() => setIsAddingCategory(false)}
              className="border-[#EABD00] text-[#EABD00] hover:bg-[#EABD00]/10 dark:border-[#EABD00] dark:text-[#EABD00] dark:hover:bg-[#EABD00]/10 border"
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              onClick={handleAddCategory}
              className="border-[#52C1E4] text-[#52C1E4] hover:bg-[#52C1E4]/10 dark:border-[#52C1E4] dark:text-[#52C1E4] dark:hover:bg-[#52C1E4]/10 border"
            >
              Agregar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
