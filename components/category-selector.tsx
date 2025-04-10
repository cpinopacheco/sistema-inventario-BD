"use client";

import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import type { CategorySelectorProps, Categoria } from "@/types";

export function CategorySelector({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategorySelectorProps) {
  // Encontrar el nombre de la categoría seleccionada
  const getSelectedCategoryName = () => {
    if (selectedCategory === "todas") return "Todas las categorías";
    const category = categories.find(
      (c: Categoria) => c.id.toString() === selectedCategory
    );
    return category ? category.nombre : "Filtrar por categoría";
  };

  return (
    <Select value={selectedCategory} onValueChange={onCategoryChange}>
      <SelectTrigger className="bg-background">
        <div className="flex items-center gap-2">
          <Filter size={14} />
          <span>{getSelectedCategoryName()}</span>
        </div>
      </SelectTrigger>
      <SelectContent className="bg-background">
        <SelectItem value="todas">Todas las categorías</SelectItem>
        {categories.map((categoria: Categoria) => (
          <SelectItem key={categoria.id} value={categoria.id.toString()}>
            {categoria.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
