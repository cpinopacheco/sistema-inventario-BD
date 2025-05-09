"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Package2, BarChart3, Search, FileDown } from "lucide-react";
import ProductList from "@/components/product-list";
import AddProductForm from "@/components/add-product-form";
import ProductDetail from "@/components/product-detail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCards from "@/components/stats-cards";
import { useMobile } from "@/hooks/use-mobile";
import { useApi } from "@/hooks/use-api";
import type {
  ProductoConCategoria,
  Categoria,
  Estadisticas,
  SortConfig,
  EditedProduct,
} from "@/types";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Loader } from "@/components/ui/loader";
import { TooltipSimple } from "@/components/ui/tooltip-simple";
import { TooltipProvider } from "@/components/ui/tooltip";
import { exportToExcel } from "@/lib/excel-export";
import { Header } from "@/components/header";
import { CategorySelector } from "@/components/category-selector";
import { ScrollToTop } from "@/components/scroll-to-top";

// Umbral para considerar stock bajo
const LOW_STOCK_THRESHOLD = 10;
// Duración de las notificaciones en milisegundos
const TOAST_DURATION = 4000;

export default function InventorySystem() {
  // Estado para productos y UI
  const [productos, setProductos] = useState<ProductoConCategoria[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] =
    useState<ProductoConCategoria | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "ascending",
  });
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    totalProductos: 0,
    totalStock: 0,
    stockBajo: 0,
    porCategoria: [],
  });
  const [activeTab, setActiveTab] = useState("todos");
  const [isLoadingProductDetail, setIsLoadingProductDetail] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  const isMobile = useMobile();
  const { loading, error, fetchApi } = useApi();

  // Cargar datos iniciales
  useEffect(() => {
    cargarCategorias();
    cargarProductos();
    cargarEstadisticas();
  }, []);

  // Mostrar errores como toast
  useEffect(() => {
    if (error) {
      const { dismiss } = toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });

      // Auto-cerrar después de TOAST_DURATION
      setTimeout(() => {
        dismiss();
      }, TOAST_DURATION);
    }
  }, [error]);

  // Agregar después de los otros useEffect
  useEffect(() => {
    // Pequeño retraso para asegurar que el DOM esté listo
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Cargar categorías
  const cargarCategorias = async () => {
    const data = await fetchApi<Categoria[]>("/api/categorias");
    if (data) {
      setCategorias(data);
    }
  };

  // Cargar productos
  const cargarProductos = async () => {
    const categoriaParam = selectedCategory !== "todas" ? selectedCategory : "";
    const data = await fetchApi<ProductoConCategoria[]>(
      `/api/productos?busqueda=${searchTerm}&categoria=${categoriaParam}`
    );
    if (data) {
      setProductos(data);
    }
  };

  // Cargar estadísticas
  const cargarEstadisticas = async () => {
    const data = await fetchApi<Estadisticas>("/api/estadisticas");
    if (data) {
      setEstadisticas(data);
    }
  };

  // Efecto para recargar productos cuando cambia el término de búsqueda o la categoría seleccionada
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      cargarProductos();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory]);

  // Productos con stock bajo
  const lowStockProducts = useMemo(() => {
    return productos.filter(
      (producto) => producto.cantidad <= LOW_STOCK_THRESHOLD
    );
  }, [productos]);

  // Ordenar productos
  const sortedProducts = useMemo(() => {
    const sortableProducts = [...productos];
    if (sortConfig.key) {
      sortableProducts.sort((a, b) => {
        const keyA = a[sortConfig.key as keyof ProductoConCategoria];
        const keyB = b[sortConfig.key as keyof ProductoConCategoria];

        if (keyA && keyB) {
          if (keyA < keyB) {
            return sortConfig.direction === "ascending" ? -1 : 1;
          }
          if (keyA > keyB) {
            return sortConfig.direction === "ascending" ? 1 : -1;
          }
        }
        return 0;
      });
    }
    return sortableProducts;
  }, [productos, sortConfig]);

  // Función para mostrar toast con auto-cierre
  const showToast = (
    title: string,
    description: string,
    variant: "default" | "destructive" = "default"
  ) => {
    const { dismiss } = toast({
      title,
      description,
      variant,
    });

    // Auto-cerrar después de TOAST_DURATION
    setTimeout(() => {
      dismiss();
    }, TOAST_DURATION);
  };

  // Agregar un nuevo producto
  const handleAddProduct = async (producto: {
    name: string;
    quantity: number;
    description: string;
    categoria_id: number;
  }) => {
    // Convertir de formato frontend a backend
    const productoParaAPI = {
      nombre: producto.name,
      cantidad: producto.quantity,
      descripcion: producto.description,
      categoria_id: producto.categoria_id,
    };

    const data = await fetchApi<ProductoConCategoria>("/api/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productoParaAPI),
    });

    if (data) {
      showToast(
        "Producto agregado",
        `El producto ${data.nombre} ha sido agregado correctamente.`
      );

      setIsAddingProduct(false);
      // Actualizar la lista local sin recargar todos los productos
      setProductos((prevProductos) => [...prevProductos, data]);
      cargarEstadisticas();
    }
  };

  // Seleccionar un producto para ver detalles
  const handleSelectProduct = async (producto: ProductoConCategoria) => {
    // CORRECCIÓN CRÍTICA: Evitar recargar la tabla al ver detalles
    // Primero verificamos si ya tenemos todos los detalles necesarios
    if (producto && producto.descripcion !== undefined) {
      // Si ya tenemos todos los datos necesarios, simplemente actualizamos el estado
      setSelectedProduct(producto);
      return;
    }

    // Solo si faltan datos, hacemos una petición específica para ese producto
    setIsLoadingProductDetail(true);
    try {
      const data = await fetchApi<ProductoConCategoria>(
        `/api/productos/${producto.id}`
      );
      if (data) {
        setSelectedProduct(data);

        // Actualizamos el producto en la lista local para tener datos completos
        // para futuras selecciones, sin recargar toda la tabla
        setProductos((prevProductos) =>
          prevProductos.map((p) => (p.id === data.id ? data : p))
        );
      }
    } finally {
      setIsLoadingProductDetail(false);
    }
  };

  // Actualizar cantidad de producto
  const handleUpdateQuantity = async (id: string, cambio: number) => {
    console.log(
      `Actualizando cantidad para producto ${id} con cambio ${cambio}`
    );

    try {
      const data = await fetchApi<ProductoConCategoria>(
        `/api/productos/${id}/cantidad`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cambio }),
        }
      );

      if (data) {
        // Actualizar el producto en la lista local sin recargar toda la tabla
        setProductos((prevProductos) =>
          prevProductos.map((p) => (p.id === id ? data : p))
        );

        // Si el producto está seleccionado, actualizar también la vista de detalle
        if (selectedProduct && selectedProduct.id === id) {
          setSelectedProduct(data);
        }

        showToast(
          "Cantidad actualizada",
          `La cantidad del producto ${data.nombre} ha sido actualizada correctamente.`
        );

        cargarEstadisticas();
      }
    } catch (error) {
      console.error("Error al actualizar cantidad:", error);
      showToast(
        "Error",
        "No se pudo actualizar la cantidad del producto",
        "destructive"
      );
    }
  };

  // Editar un producto
  const handleEditProduct = async (productoEditado: EditedProduct) => {
    // Convertir de formato frontend a backend
    const productoParaAPI = {
      nombre: productoEditado.name,
      cantidad: productoEditado.quantity,
      descripcion: productoEditado.description,
      categoria_id: productoEditado.categoria_id,
    };

    const data = await fetchApi<ProductoConCategoria>(
      `/api/productos/${productoEditado.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productoParaAPI),
      }
    );

    if (data) {
      showToast(
        "Producto actualizado",
        `El producto ${data.nombre} ha sido actualizado correctamente.`
      );

      // Actualizar el producto en la lista local sin recargar toda la tabla
      setProductos((prevProductos) =>
        prevProductos.map((p) => (p.id === data.id ? data : p))
      );

      setSelectedProduct(null);
      cargarEstadisticas();
    }
  };

  // Eliminar un producto
  const handleDeleteProduct = async (id: string) => {
    const data = await fetchApi<{ message: string }>(`/api/productos/${id}`, {
      method: "DELETE",
    });

    if (data) {
      showToast(
        "Producto eliminado",
        `El producto ha sido eliminado correctamente.`
      );

      setSelectedProduct(null);
      // Eliminar el producto de la lista local sin recargar toda la tabla
      setProductos((prevProductos) => prevProductos.filter((p) => p.id !== id));
      cargarEstadisticas();
    }
  };

  // Agregar una nueva categoría
  const handleAddCategory = async (
    nombreCategoria: string
  ): Promise<Categoria | null> => {
    const data = await fetchApi<Categoria>("/api/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombreCategoria }),
    });

    if (data) {
      showToast(
        "Categoría agregada",
        `La categoría ${data.nombre} ha sido agregada correctamente.`
      );

      // Actualizar categorías localmente sin recargar
      setCategorias((prevCategorias) => [...prevCategorias, data]);
      return data;
    }
    return null;
  };

  // Editar una categoría
  const handleEditCategory = async (
    oldCategory: string,
    newCategory: string
  ): Promise<void> => {
    // Encontrar el ID de la categoría por su nombre
    const categoria = categorias.find((c) => c.nombre === oldCategory);

    if (!categoria) {
      showToast("Error", "Categoría no encontrada", "destructive");
      return;
    }

    const data = await fetchApi<Categoria>(`/api/categorias/${categoria.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: newCategory }),
    });

    if (data) {
      showToast(
        "Categoría actualizada",
        `La categoría ha sido actualizada correctamente.`
      );

      // Actualizar categorías localmente sin recargar
      setCategorias((prevCategorias) =>
        prevCategorias.map((c) => (c.id === data.id ? data : c))
      );

      // Actualizar los productos localmente para reflejar el cambio de nombre de categoría
      setProductos((prevProductos) =>
        prevProductos.map((p) =>
          p.categoria_id === categoria.id ? { ...p, categoria: newCategory } : p
        )
      );
    }
  };

  // Configurar ordenamiento
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Manejar cambio de pestaña
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Manejar cambio de categoría
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  // Exportar productos a Excel
  const handleExportToExcel = () => {
    // Determinar qué productos exportar según la pestaña activa
    const productsToExport =
      activeTab === "stock-bajo"
        ? lowStockProducts.filter(
            (product) =>
              product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
              product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
              product.categoria.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : sortedProducts;

    // Formatear datos para Excel con orden consistente con la tabla
    const formattedData = productsToExport.map((product) => ({
      Código: product.id,
      Nombre: product.nombre,
      Descripción: product.descripcion || "",
      Categoría: product.categoria,
      Cantidad: product.cantidad,
      Estado:
        product.cantidad > LOW_STOCK_THRESHOLD ? "En Stock" : "Stock Bajo",
    }));

    // Nombre del archivo
    const fileName =
      activeTab === "stock-bajo"
        ? "productos-stock-bajo"
        : "productos-inventario";

    // Exportar a Excel
    exportToExcel(formattedData, fileName);

    showToast(
      "Exportación exitosa",
      `Se han exportado ${formattedData.length} productos a Excel.`
    );
  };

  return (
    <TooltipProvider>
      {/* Contenedor principal */}
      <div className="bg-background min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isPageLoaded ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col"
        >
          {/* Header */}
          <Header
            title="Sistema de Control de Inventario"
            subtitle="Centro Nacional de perfeccionamiento y capacitación"
            logoUrl="/cenpecar-logo.png"
          />

          {/* Main Content */}
          <main className="container mx-auto p-4 pt-8 pb-20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Productos en Inventario</h2>
              <TooltipSimple text="Agregar un nuevo producto al inventario">
                <Button
                  onClick={() => setIsAddingProduct(true)}
                  className="bg-[#EABD00] hover:bg-[#d9ae00] text-[#013612] gap-2"
                  disabled={loading}
                >
                  <Plus size={16} />
                  Agregar Producto
                </Button>
              </TooltipSimple>
            </div>

            <Tabs
              defaultValue="todos"
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="mb-4 bg-muted border border-transparent">
                <TabsTrigger
                  value="todos"
                  className="data-[state=active]:bg-background data-[state=active]:border-[#EABD00] data-[state=active]:border-b-2 data-[state=active]:font-medium dark:data-[state=active]:text-white"
                >
                  <Package2 size={16} className="mr-2" />
                  Todos
                </TabsTrigger>
                <TabsTrigger
                  value="stock-bajo"
                  className="data-[state=active]:bg-background data-[state=active]:border-[#EABD00] data-[state=active]:border-b-2 data-[state=active]:font-medium dark:data-[state=active]:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M16 18V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2z"></path>
                    <path d="M16 6h2a2 2 0 0 1 2 2v8"></path>
                    <path d="M12 10v4"></path>
                    <path d="M12 2v4"></path>
                  </svg>
                  Stock Bajo
                </TabsTrigger>
                <TabsTrigger
                  value="estadisticas"
                  className="data-[state=active]:bg-background data-[state=active]:border-[#EABD00] data-[state=active]:border-b-2 data-[state=active]:font-medium dark:data-[state=active]:text-white"
                >
                  <BarChart3 size={16} className="mr-2" />
                  Estadísticas
                </TabsTrigger>
              </TabsList>

              {/* Contenido de las pestañas */}
              <div>
                <TabsContent value="todos">
                  <div className="flex flex-col">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Buscar productos..."
                          className="pl-8"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>

                      <div className="w-full md:w-64">
                        <CategorySelector
                          categories={categorias}
                          selectedCategory={selectedCategory}
                          onCategoryChange={handleCategoryChange}
                        />
                      </div>

                      <TooltipSimple text="Exportar a Excel">
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 border-green-600 text-green-600 hover:bg-green-50 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-950"
                          onClick={handleExportToExcel}
                          disabled={loading || productos.length === 0}
                        >
                          <FileDown size={16} />
                          <span className="hidden md:inline">Exportar</span>
                        </Button>
                      </TooltipSimple>
                    </div>

                    {/* Tabla normal sin contenedor con scroll */}
                    <ProductList
                      products={sortedProducts}
                      onSelectProduct={handleSelectProduct}
                      selectedProductId={selectedProduct?.id}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRequestSort={requestSort}
                      sortConfig={sortConfig}
                      loading={loading}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="stock-bajo">
                  <div className="flex flex-col">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Buscar productos con stock bajo..."
                          className="pl-8"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>

                      <div className="w-full md:w-64">
                        <CategorySelector
                          categories={categorias}
                          selectedCategory={selectedCategory}
                          onCategoryChange={handleCategoryChange}
                        />
                      </div>

                      <TooltipSimple text="Exportar a Excel">
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 border-green-600 text-green-600 hover:bg-green-50 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-950"
                          onClick={handleExportToExcel}
                          disabled={loading || lowStockProducts.length === 0}
                        >
                          <FileDown size={16} />
                          <span className="hidden md:inline">Exportar</span>
                        </Button>
                      </TooltipSimple>
                    </div>

                    {/* Tabla normal sin contenedor con scroll */}
                    <ProductList
                      products={useMemo(() => {
                        // Primero filtramos los productos con stock bajo según el término de búsqueda
                        const filteredProducts = lowStockProducts.filter(
                          (product) =>
                            product.nombre
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            product.id
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            product.categoria
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
                        );

                        // Luego aplicamos el ordenamiento igual que en la otra pestaña
                        if (sortConfig.key) {
                          return [...filteredProducts].sort((a, b) => {
                            const keyA =
                              a[sortConfig.key as keyof ProductoConCategoria];
                            const keyB =
                              b[sortConfig.key as keyof ProductoConCategoria];

                            if (keyA && keyB) {
                              if (keyA < keyB) {
                                return sortConfig.direction === "ascending"
                                  ? -1
                                  : 1;
                              }
                              if (keyA > keyB) {
                                return sortConfig.direction === "ascending"
                                  ? 1
                                  : -1;
                              }
                            }
                            return 0;
                          });
                        }
                        return filteredProducts;
                      }, [lowStockProducts, searchTerm, sortConfig])}
                      onSelectProduct={handleSelectProduct}
                      selectedProductId={selectedProduct?.id}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRequestSort={requestSort}
                      sortConfig={sortConfig}
                      isLowStockTab={true}
                      loading={loading}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="estadisticas">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader size={30} />
                      <span className="ml-2">Cargando estadísticas...</span>
                    </div>
                  ) : (
                    <StatsCards stats={estadisticas} />
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </main>

          {/* Product Detail Modal (conditionally rendered as modal on mobile) */}
          {selectedProduct &&
            (isMobile ? (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="w-full max-w-md">
                  <ProductDetail
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    onUpdateQuantity={handleUpdateQuantity}
                    categories={categorias}
                    onAddCategory={handleAddCategory}
                    onEditCategory={handleEditCategory}
                    isLoading={isLoadingProductDetail}
                  />
                </div>
              </div>
            ) : (
              <div className="fixed bottom-4 right-4 w-80 z-40">
                <ProductDetail
                  product={selectedProduct}
                  onClose={() => setSelectedProduct(null)}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onUpdateQuantity={handleUpdateQuantity}
                  categories={categorias}
                  onAddCategory={handleAddCategory}
                  onEditCategory={handleEditCategory}
                  isLoading={isLoadingProductDetail}
                />
              </div>
            ))}

          {/* Add Product Modal */}
          {isAddingProduct && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <AddProductForm
                onAddProduct={handleAddProduct}
                onCancel={() => setIsAddingProduct(false)}
                categories={categorias}
                onAddCategory={handleAddCategory}
              />
            </div>
          )}
        </motion.div>

        {/* Botón Scroll to Top */}
        <ScrollToTop />

        <Toaster />
      </div>
    </TooltipProvider>
  );
}
