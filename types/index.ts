// Tipo para categorías
export interface Categoria {
  id: number;
  nombre: string;
}

// Tipo para productos
export interface Producto {
  id: string;
  nombre: string;
  cantidad: number;
  descripcion: string | null;
  categoria_id: number;
  categoria?: string; // Para uso en el frontend
  fecha_creacion?: Date;
}

// Tipo para productos con nombre de categoría incluido
export interface ProductoConCategoria extends Producto {
  categoria: string;
}

// Tipos para estadísticas
export interface CategoriaCount {
  nombre: string;
  cantidad: number;
}

export interface Estadisticas {
  totalProductos: number;
  totalStock: number;
  stockBajo: number;
  porCategoria: CategoriaCount[];
}

// Tipos para estados y props de componentes
export interface SortConfig {
  key: string | null;
  direction: "ascending" | "descending";
}

export interface ProductListProps {
  products: ProductoConCategoria[];
  onSelectProduct: (product: ProductoConCategoria) => void;
  selectedProductId?: string;
  onUpdateQuantity: (id: string, cambio: number) => void;
  onRequestSort: (key: string) => void;
  sortConfig: SortConfig;
  isLowStockTab?: boolean;
  loading?: boolean;
}

export interface ProductDetailProps {
  product: ProductoConCategoria;
  onClose: () => void;
  onEdit: (product: EditedProduct) => void;
  onDelete: (id: string) => void;
  onUpdateQuantity: (id: string, cambio: number) => void;
  categories: Categoria[];
  onAddCategory: (name: string) => Promise<Categoria | null>;
  onEditCategory: (oldName: string, newName: string) => Promise<void>;
  isLoading?: boolean;
}

export interface EditedProduct {
  id: string;
  name: string;
  quantity: number;
  description: string;
  categoria_id: number;
  category?: string;
}

export interface AddProductFormProps {
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

export interface CategorySelectorProps {
  categories: Categoria[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
}

export interface StatsCardsProps {
  stats: Estadisticas;
}

export interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (cantidad: number) => void;
  productName: string;
  currentStock: number;
  isIncrement: boolean;
}
