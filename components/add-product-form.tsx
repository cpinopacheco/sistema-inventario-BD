"use client";

import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { TooltipSimple } from "@/components/ui/tooltip-simple";
import { TooltipProvider } from "@/components/ui/tooltip";

// AddProductForm component provides a modal form to add new products
export default function AddProductForm({
  onAddProduct,
  onCancel,
  categories,
  onAddCategory,
}) {
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    quantity: 0,
    description: "",
    categoria_id: categories.length > 0 ? categories[0].id : null,
  });

  // Form validation state
  const [errors, setErrors] = useState({});

  // New category state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categoryError, setCategoryError] = useState("");

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "quantity" ? Number.parseInt(value) || 0 : value,
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  // Handle category selection
  const handleCategoryChange = (value) => {
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
          categoria_id: null,
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
  const validateForm = () => {
    const newErrors = {};

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
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onAddProduct(formData);
    }
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 20 }}
        className="bg-background rounded-lg shadow-xl w-full max-w-md border-2 border-[#BFD189] dark:border-gray-600"
      >
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-medium text-[#013612] dark:text-[#BFD189]">
            Agregar Nuevo Producto
          </h2>
          <TooltipSimple text="Cerrar">
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X size={18} />
            </Button>
          </TooltipSimple>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre del Producto <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ingrese nombre del producto"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria_id">
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
                }`}
              >
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent className="bg-background dark:bg-gray-800">
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.nombre}
                  </SelectItem>
                ))}
                <SelectItem
                  value="nueva"
                  className="text-blue-600 dark:text-blue-400 font-medium"
                >
                  <div className="flex items-center gap-1">
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

          <div className="space-y-2">
            <Label htmlFor="quantity">
              Cantidad <span className="text-red-500">*</span>
            </Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="0"
              className={errors.quantity ? "border-red-500" : ""}
            />
            {errors.quantity && (
              <p className="text-red-500 text-xs">{errors.quantity}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ingrese descripción del producto"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#52C1E4] hover:bg-[#3ba9cc] text-white"
            >
              Agregar Producto
            </Button>
          </div>
        </form>

        {/* Dialog para agregar nueva categoría */}
        <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
          <DialogContent className="sm:max-w-[425px] bg-background dark:border-gray-600">
            <DialogHeader>
              <DialogTitle>Agregar Nueva Categoría</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newCategory">Nombre de la Categoría</Label>
                <Input
                  id="newCategory"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Ingrese nombre de la categoría"
                  className={categoryError ? "border-red-500" : ""}
                />
                {categoryError && (
                  <p className="text-red-500 text-xs">{categoryError}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddingCategory(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddCategory}
                className="bg-[#52C1E4] hover:bg-[#3ba9cc] text-white"
              >
                Agregar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </TooltipProvider>
  );
}
