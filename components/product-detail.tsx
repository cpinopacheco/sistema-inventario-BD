"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Save, Trash2, Edit2, Plus, Minus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { TooltipSimple } from "@/components/ui/tooltip-simple";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { StockAdjustmentModal } from "./stock-adjustment-modal";
import type { ProductDetailProps, EditedProduct, Categoria } from "@/types";

// ProductDetail component shows detailed information about a selected product
export default function ProductDetail({
  product,
  onClose,
  onEdit,
  onDelete,
  onUpdateQuantity,
  categories,
  onAddCategory,
  onEditCategory,
  isLoading = false,
}: ProductDetailProps) {
  // Verificar que onUpdateQuantity sea una función al cargar el componente
  useEffect(() => {
    if (
      onUpdateQuantity === undefined ||
      typeof onUpdateQuantity !== "function"
    ) {
      console.warn(
        "ProductDetail: onUpdateQuantity no es una función o no está definida"
      );
    }
  }, [onUpdateQuantity]);

  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState<EditedProduct>({
    id: product.id,
    name: product.nombre,
    quantity: product.cantidad,
    description: product.descripcion || "",
    categoria_id: product.categoria_id,
    category: product.categoria,
  });

  // New category state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categoryError, setCategoryError] = useState("");

  // Edit category state
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState({
    original: "",
    new: "",
  });

  // Confirm delete dialog state
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Stock adjustment modal state
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isIncrement, setIsIncrement] = useState(true);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedProduct({
      ...editedProduct,
      [name]: name === "quantity" ? Number.parseInt(value) || 0 : value,
    });
  };

  const handleCategoryChange = (value: string) => {
    if (value === "nueva") {
      setIsAddingCategory(true);
    } else if (value === "editar") {
      setCategoryToEdit({
        original: product.categoria,
        new: product.categoria,
      });
      setIsEditingCategory(true);
    } else {
      const selectedCategory = categories.find(
        (c: Categoria) => c.id.toString() === value
      );
      setEditedProduct({
        ...editedProduct,
        categoria_id: Number.parseInt(value),
        category: selectedCategory?.nombre || "",
      });
    }
  };

  // Handle new category submission
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      setCategoryError("El nombre de la categoría es obligatorio");
      return;
    }

    const existingCategory = categories.find(
      (c: Categoria) => c.nombre.toLowerCase() === newCategory.toLowerCase()
    );

    if (existingCategory) {
      setCategoryError("Esta categoría ya existe");
      return;
    }

    const result = await onAddCategory(newCategory);
    if (result) {
      setEditedProduct({
        ...editedProduct,
        categoria_id: result.id,
        category: result.nombre,
      });
      setNewCategory("");
      setIsAddingCategory(false);
      setCategoryError("");
    }
  };

  // Handle edit category submission
  const handleEditCategory = async () => {
    if (!categoryToEdit.new.trim()) {
      setCategoryError("El nombre de la categoría es obligatorio");
      return;
    }

    const existingCategory = categories.find(
      (c: Categoria) =>
        c.nombre.toLowerCase() === categoryToEdit.new.toLowerCase() &&
        c.nombre !== categoryToEdit.original
    );

    if (existingCategory) {
      setCategoryError("Esta categoría ya existe");
      return;
    }

    await onEditCategory(categoryToEdit.original, categoryToEdit.new);
    setIsEditingCategory(false);
    setCategoryError("");
  };

  // Función para abrir el modal de ajuste de stock
  const handleOpenAdjustmentModal = (increment: boolean) => {
    setIsIncrement(increment);
    setIsAdjustmentModalOpen(true);
  };

  // Función para confirmar el ajuste de stock
  const handleConfirmAdjustment = (cantidad: number) => {
    if (typeof onUpdateQuantity === "function") {
      onUpdateQuantity(product.id, cantidad);
      setIsAdjustmentModalOpen(false);
    } else {
      console.error("onUpdateQuantity no es una función o no está definida");
    }
  };

  const handleSave = () => {
    onEdit(editedProduct);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProduct({
      id: product.id,
      name: product.nombre,
      quantity: product.cantidad,
      description: product.descripcion || "",
      categoria_id: product.categoria_id,
      category: product.categoria,
    });
    setIsEditing(false);
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.98 }}
        transition={{
          duration: 0.4,
          ease: [0.25, 0.1, 0.25, 1.0],
        }}
        className="bg-background"
      >
        <Card className="border-[#BFD189] border-2 w-full mx-auto bg-background shadow-lg dark:border-gray-600 rounded-xl overflow-hidden">
          <CardHeader className="bg-[#f5f9e8] dark:bg-[#1a2e22] pb-2 px-6 py-4 flex flex-row justify-between items-center">
            <CardTitle className="text-[#013612] dark:text-[#BFD189] text-xl">
              {isEditing ? "Editar Producto" : "Detalles del Producto"}
            </CardTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </CardHeader>

          <CardContent className="pt-4 bg-background px-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 size={30} className="animate-spin text-primary mb-2" />
                <p className="text-sm text-gray-500">
                  Cargando detalles del producto...
                </p>
              </div>
            ) : isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Producto</Label>
                  <Input
                    id="name"
                    name="name"
                    value={editedProduct.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria_id">Categoría</Label>
                  <Select
                    value={editedProduct.categoria_id.toString()}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {categories.map((category: Categoria) => (
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
                      {product.categoria && (
                        <SelectItem
                          value="editar"
                          className="text-amber-600 dark:text-amber-400 font-medium group"
                        >
                          <div className="flex items-center gap-1 group-hover:text-black">
                            <Edit2 size={14} />
                            <span>Editar "{product.categoria}"</span>
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 text-sm font-medium">
                      {product.cantidad}
                    </div>
                    <div className="flex gap-1">
                      <TooltipSimple text="Aumentar cantidad">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-green-600 border-green-500 hover:bg-green-100 dark:text-green-400 dark:border-green-500 dark:hover:bg-green-900 border"
                          onClick={() => handleOpenAdjustmentModal(true)}
                        >
                          <Plus size={14} />
                        </Button>
                      </TooltipSimple>
                      <TooltipSimple text="Disminuir cantidad">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-gray-600 border-gray-400 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-800 border"
                          onClick={() => handleOpenAdjustmentModal(false)}
                          disabled={product.cantidad <= 0}
                        >
                          <Minus size={14} />
                        </Button>
                      </TooltipSimple>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={editedProduct.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Código
                  </div>
                  <div className="text-sm font-medium">{product.id}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Nombre
                  </div>
                  <div className="text-sm font-medium">{product.nombre}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Categoría
                  </div>
                  <div className="text-sm font-medium">{product.categoria}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Cantidad
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">
                      {product.cantidad}
                    </div>
                    <div className="flex gap-1 ml-auto">
                      <TooltipSimple text="Aumentar cantidad">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 text-green-600 border-green-500 hover:bg-green-100 dark:text-green-400 dark:border-green-500 dark:hover:bg-green-900 border"
                          onClick={() => handleOpenAdjustmentModal(true)}
                        >
                          <Plus size={12} />
                        </Button>
                      </TooltipSimple>
                      <TooltipSimple text="Disminuir cantidad">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 text-gray-600 border-gray-400 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-800 border"
                          onClick={() => handleOpenAdjustmentModal(false)}
                          disabled={product.cantidad <= 0}
                        >
                          <Minus size={12} />
                        </Button>
                      </TooltipSimple>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Descripción
                  </div>
                  <div className="text-sm">
                    {product.descripcion || "Sin descripción"}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Estado de Stock
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      product.cantidad > 10
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {product.cantidad > 10 ? "En Stock" : "Stock Bajo"}
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-4 px-6 bg-background">
            {isLoading ? (
              <div className="w-full flex justify-center">
                <Button variant="outline" disabled>
                  Cargando...
                </Button>
              </div>
            ) : isEditing ? (
              <>
                <TooltipSimple text="Cancelar edición">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="border-[#EABD00] text-[#EABD00] hover:bg-[#EABD00]/10 dark:border-[#EABD00] dark:text-[#EABD00] dark:hover:bg-[#EABD00]/10 border"
                  >
                    Cancelar
                  </Button>
                </TooltipSimple>
                <TooltipSimple text="Guardar cambios">
                  <Button
                    variant="outline"
                    className="border-[#52C1E4] text-[#52C1E4] hover:bg-[#52C1E4]/10 dark:border-[#52C1E4] dark:text-[#52C1E4] dark:hover:bg-[#52C1E4]/10 border"
                    onClick={handleSave}
                  >
                    <Save size={14} className="mr-1" />
                    Guardar
                  </Button>
                </TooltipSimple>
              </>
            ) : (
              <>
                <TooltipSimple text="Editar producto">
                  <Button
                    variant="outline"
                    className="text-blue-600 border-blue-500 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-500 dark:hover:bg-blue-950 border"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 size={14} className="mr-1" />
                    Editar
                  </Button>
                </TooltipSimple>
                <TooltipSimple text="Eliminar producto">
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-500 hover:bg-red-50 dark:text-red-400 dark:border-red-500 dark:hover:bg-red-950 border"
                    onClick={() => setIsConfirmDeleteOpen(true)}
                  >
                    <Trash2 size={14} className="mr-1" />
                    Eliminar
                  </Button>
                </TooltipSimple>
              </>
            )}
          </CardFooter>
        </Card>

        {/* Dialog para agregar nueva categoría */}
        <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
          <DialogContent className="sm:max-w-[425px] rounded-xl border-2 border-[#BFD189] dark:border-gray-600 p-0 overflow-hidden">
            <div className="bg-[#f5f9e8] dark:bg-[#1a2e22] py-4 px-6 flex items-center justify-between">
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
                  onChange={(e) => setNewCategory(e.target.value)}
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

        {/* Dialog para editar categoría */}
        <Dialog open={isEditingCategory} onOpenChange={setIsEditingCategory}>
          <DialogContent className="sm:max-w-[425px] rounded-xl border-2 border-[#BFD189] dark:border-gray-600 p-0 overflow-hidden">
            <div className="bg-[#f5f9e8] dark:bg-[#1a2e22] py-4 px-6 flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold text-[#013612] dark:text-[#BFD189]">
                Editar Categoría
              </DialogTitle>
              <button
                onClick={() => setIsEditingCategory(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editCategory">Nombre de la Categoría</Label>
                <Input
                  id="editCategory"
                  value={categoryToEdit.new}
                  onChange={(e) =>
                    setCategoryToEdit({
                      ...categoryToEdit,
                      new: e.target.value,
                    })
                  }
                  placeholder="Ingrese nuevo nombre de la categoría"
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
                onClick={() => setIsEditingCategory(false)}
                className="border-[#EABD00] text-[#EABD00] hover:bg-[#EABD00]/10 dark:border-[#EABD00] dark:text-[#EABD00] dark:hover:bg-[#EABD00]/10 border"
              >
                Cancelar
              </Button>
              <Button
                variant="outline"
                onClick={handleEditCategory}
                className="border-[#52C1E4] text-[#52C1E4] hover:bg-[#52C1E4]/10 dark:border-[#52C1E4] dark:text-[#52C1E4] dark:hover:bg-[#52C1E4]/10 border"
              >
                Guardar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal para ajustar stock */}
        <StockAdjustmentModal
          isOpen={isAdjustmentModalOpen}
          onClose={() => setIsAdjustmentModalOpen(false)}
          onConfirm={handleConfirmAdjustment}
          productName={product.nombre}
          currentStock={product.cantidad}
          isIncrement={isIncrement}
        />

        <ConfirmDialog
          isOpen={isConfirmDeleteOpen}
          onClose={() => setIsConfirmDeleteOpen(false)}
          onConfirm={() => onDelete(product.id)}
          title="Eliminar Producto"
          description={`¿Estás seguro que deseas eliminar el producto "${product.nombre}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="danger"
        />
      </motion.div>
    </TooltipProvider>
  );
}
