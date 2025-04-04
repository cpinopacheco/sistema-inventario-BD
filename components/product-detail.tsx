"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Save, Trash2, Edit2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

// ProductDetail component shows detailed information about a selected product
export default function ProductDetail({
  product,
  onClose,
  onEdit,
  onDelete,
  categories,
  onAddCategory,
  onEditCategory,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedProduct, setEditedProduct] = useState({
    id: product.id,
    name: product.nombre,
    quantity: product.cantidad,
    description: product.descripcion || "",
    categoria_id: product.categoria_id,
    category: product.categoria,
  })

  // New category state
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [categoryError, setCategoryError] = useState("")

  // Edit category state
  const [isEditingCategory, setIsEditingCategory] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState({ original: "", new: "" })

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditedProduct({
      ...editedProduct,
      [name]: name === "quantity" ? Number.parseInt(value) || 0 : value,
    })
  }

  const handleCategoryChange = (value) => {
    if (value === "nueva") {
      setIsAddingCategory(true)
    } else if (value === "editar") {
      setCategoryToEdit({ original: product.categoria, new: product.categoria })
      setIsEditingCategory(true)
    } else {
      const selectedCategory = categories.find((c) => c.id.toString() === value)
      setEditedProduct({
        ...editedProduct,
        categoria_id: Number.parseInt(value),
        category: selectedCategory?.nombre || "",
      })
    }
  }

  // Handle new category submission
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      setCategoryError("El nombre de la categoría es obligatorio")
      return
    }

    const existingCategory = categories.find((c) => c.nombre.toLowerCase() === newCategory.toLowerCase())

    if (existingCategory) {
      setCategoryError("Esta categoría ya existe")
      return
    }

    const result = await onAddCategory(newCategory)
    if (result) {
      setEditedProduct({
        ...editedProduct,
        categoria_id: result.id,
        category: result.nombre,
      })
      setNewCategory("")
      setIsAddingCategory(false)
      setCategoryError("")
    }
  }

  // Handle edit category submission
  const handleEditCategory = async () => {
    if (!categoryToEdit.new.trim()) {
      setCategoryError("El nombre de la categoría es obligatorio")
      return
    }

    const existingCategory = categories.find(
      (c) => c.nombre.toLowerCase() === categoryToEdit.new.toLowerCase() && c.nombre !== categoryToEdit.original,
    )

    if (existingCategory) {
      setCategoryError("Esta categoría ya existe")
      return
    }

    await onEditCategory(categoryToEdit.original, categoryToEdit.new)
    setIsEditingCategory(false)
    setCategoryError("")
  }

  const handleSave = () => {
    onEdit(editedProduct)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedProduct({
      id: product.id,
      name: product.nombre,
      quantity: product.cantidad,
      description: product.descripcion || "",
      categoria_id: product.categoria_id,
      category: product.categoria,
    })
    setIsEditing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="bg-background"
    >
      <Card className="border-[#BFD189] border-2 w-full mx-auto bg-background shadow-lg">
        <CardHeader className="bg-[#f5f9e8] dark:bg-[#1a2e22] pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-[#013612] dark:text-[#BFD189]">
              {isEditing ? "Editar Producto" : "Detalles del Producto"}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-4 bg-background">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Producto</Label>
                <Input id="name" name="name" value={editedProduct.name} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria_id">Categoría</Label>
                <Select value={editedProduct.categoria_id.toString()} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.nombre}
                      </SelectItem>
                    ))}
                    <SelectItem value="nueva" className="text-blue-600 dark:text-blue-400 font-medium">
                      <div className="flex items-center gap-1">
                        <Plus size={14} />
                        <span>Nueva Categoría</span>
                      </div>
                    </SelectItem>
                    {product.categoria && (
                      <SelectItem value="editar" className="text-amber-600 dark:text-amber-400 font-medium">
                        <div className="flex items-center gap-1">
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
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={editedProduct.quantity}
                  onChange={handleChange}
                />
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
                <div className="text-sm text-gray-500 dark:text-gray-400">Código</div>
                <div className="text-sm font-medium">{product.id}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-gray-500 dark:text-gray-400">Nombre</div>
                <div className="text-sm font-medium">{product.nombre}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-gray-500 dark:text-gray-400">Categoría</div>
                <div className="text-sm font-medium">{product.categoria}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-gray-500 dark:text-gray-400">Cantidad</div>
                <div className="text-sm font-medium">{product.cantidad}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-gray-500 dark:text-gray-400">Descripción</div>
                <div className="text-sm">{product.descripcion || "Sin descripción"}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-gray-500 dark:text-gray-400">Estado de Stock</div>
                <div
                  className={`text-sm font-medium ${
                    product.cantidad > 10 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {product.cantidad > 10 ? "En Stock" : "Stock Bajo"}
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-4 bg-background">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button className="bg-[#52C1E4] hover:bg-[#3ba9cc] text-white" onClick={handleSave}>
                <Save size={14} className="mr-1" />
                Guardar
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-900 dark:hover:bg-blue-950"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={14} className="mr-1" />
                Editar
              </Button>
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950"
                onClick={() => onDelete(product.id)}
              >
                <Trash2 size={14} className="mr-1" />
                Eliminar
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      {/* Dialog para agregar nueva categoría */}
      <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <DialogContent className="w-[95%] max-w-md mx-auto bg-background">
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
              {categoryError && <p className="text-red-500 text-xs">{categoryError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingCategory(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddCategory} className="bg-[#52C1E4] hover:bg-[#3ba9cc] text-white">
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar categoría */}
      <Dialog open={isEditingCategory} onOpenChange={setIsEditingCategory}>
        <DialogContent className="w-[95%] max-w-md mx-auto bg-background">
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editCategory">Nombre de la Categoría</Label>
              <Input
                id="editCategory"
                value={categoryToEdit.new}
                onChange={(e) => setCategoryToEdit({ ...categoryToEdit, new: e.target.value })}
                placeholder="Ingrese nuevo nombre de la categoría"
                className={categoryError ? "border-red-500" : ""}
              />
              {categoryError && <p className="text-red-500 text-xs">{categoryError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingCategory(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditCategory} className="bg-[#52C1E4] hover:bg-[#3ba9cc] text-white">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

