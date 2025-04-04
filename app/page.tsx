"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Plus, Package2, BarChart3, Search, Moon, Sun } from "lucide-react"
import ProductList from "@/components/product-list"
import AddProductForm from "@/components/add-product-form"
import ProductDetail from "@/components/product-detail"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StatsCards from "@/components/stats-cards"
import { useMobile } from "@/hooks/use-mobile"
import { useTheme } from "next-themes"
import { useApi } from "@/hooks/use-api"
import type { ProductoConCategoria, Categoria } from "@/types"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Umbral para considerar stock bajo
const LOW_STOCK_THRESHOLD = 10

export default function InventorySystem() {
  // Estado para productos y UI
  const [productos, setProductos] = useState<ProductoConCategoria[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<ProductoConCategoria | null>(null)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" })
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [estadisticas, setEstadisticas] = useState({
    totalProductos: 0,
    totalStock: 0,
    stockBajo: 0,
    porCategoria: [],
  })

  const isMobile = useMobile()
  const { theme, setTheme } = useTheme()
  const { loading, error, fetchApi } = useApi()

  // Cargar datos iniciales
  useEffect(() => {
    const inicializarDatos = async () => {
      try {
        // Verificar la conexión a la base de datos primero
        const diagnostico = await fetchApi("/api/diagnostico")
        if (diagnostico && diagnostico.database.status === "Conectado") {
          await Promise.all([cargarCategorias(), cargarProductos(), cargarEstadisticas()])
        } else {
          toast({
            title: "Error de conexión",
            description: "No se pudo conectar a la base de datos. Verifica la configuración.",
            variant: "destructive",
          })
        }
      } catch (err) {
        console.error("Error al inicializar datos:", err)
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar los datos iniciales.",
          variant: "destructive",
        })
      }
    }

    inicializarDatos()
  }, [])

  // Mostrar errores como toast
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    }
  }, [error])

  // Cargar categorías
  const cargarCategorias = async () => {
    try {
      const data = await fetchApi<Categoria[]>("/api/categorias")
      if (data) {
        setCategorias(data)
      }
    } catch (err) {
      console.error("Error al cargar categorías:", err)
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Cargar productos
  const cargarProductos = async () => {
    try {
      const data = await fetchApi<ProductoConCategoria[]>(`/api/productos?busqueda=${searchTerm}`)
      if (data) {
        setProductos(data)
      }
    } catch (err) {
      console.error("Error al cargar productos:", err)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Cargar estadísticas
  const cargarEstadisticas = async () => {
    try {
      const data = await fetchApi("/api/estadisticas")
      if (data) {
        setEstadisticas(data)
      }
    } catch (err) {
      console.error("Error al cargar estadísticas:", err)
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Efecto para recargar productos cuando cambia el término de búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      cargarProductos()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Productos con stock bajo
  const lowStockProducts = useMemo(() => {
    return productos.filter((producto) => producto.cantidad <= LOW_STOCK_THRESHOLD)
  }, [productos])

  // Ordenar productos
  const sortedProducts = useMemo(() => {
    const sortableProducts = [...productos]
    if (sortConfig.key) {
      sortableProducts.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }
    return sortableProducts
  }, [productos, sortConfig])

  // Agregar un nuevo producto
  const handleAddProduct = async (producto) => {
    // Convertir de formato frontend a backend
    const productoParaAPI = {
      nombre: producto.name,
      cantidad: producto.quantity,
      descripcion: producto.description,
      categoria_id: producto.categoria_id,
    }

    const data = await fetchApi("/api/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productoParaAPI),
    })

    if (data) {
      toast({
        title: "Producto agregado",
        description: `El producto ${data.nombre} ha sido agregado correctamente.`,
      })

      setIsAddingProduct(false)
      cargarProductos()
      cargarEstadisticas()
    }
  }

  // Seleccionar un producto para ver detalles
  const handleSelectProduct = async (producto) => {
    // Obtener detalles completos del producto
    const data = await fetchApi<ProductoConCategoria>(`/api/productos/${producto.id}`)
    if (data) {
      setSelectedProduct(data)
    }
  }

  // Actualizar cantidad de producto
  const handleUpdateQuantity = async (id, cambio) => {
    const data = await fetchApi(`/api/productos/${id}/cantidad`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cambio }),
    })

    if (data) {
      // Actualizar el producto en la lista local
      setProductos(productos.map((p) => (p.id === id ? data : p)))

      // Si el producto está seleccionado, actualizar también la vista de detalle
      if (selectedProduct && selectedProduct.id === id) {
        setSelectedProduct(data)
      }

      cargarEstadisticas()
    }
  }

  // Editar un producto
  const handleEditProduct = async (productoEditado) => {
    // Convertir de formato frontend a backend
    const productoParaAPI = {
      nombre: productoEditado.name,
      cantidad: productoEditado.quantity,
      descripcion: productoEditado.description,
      categoria_id: productoEditado.categoria_id,
    }

    const data = await fetchApi(`/api/productos/${productoEditado.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productoParaAPI),
    })

    if (data) {
      toast({
        title: "Producto actualizado",
        description: `El producto ${data.nombre} ha sido actualizado correctamente.`,
      })

      setSelectedProduct(null)
      cargarProductos()
      cargarEstadisticas()
    }
  }

  // Eliminar un producto
  const handleDeleteProduct = async (id) => {
    const data = await fetchApi(`/api/productos/${id}`, {
      method: "DELETE",
    })

    if (data) {
      toast({
        title: "Producto eliminado",
        description: `El producto ha sido eliminado correctamente.`,
      })

      setSelectedProduct(null)
      cargarProductos()
      cargarEstadisticas()
    }
  }

  // Agregar una nueva categoría
  const handleAddCategory = async (nombreCategoria) => {
    const data = await fetchApi("/api/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombreCategoria }),
    })

    if (data) {
      toast({
        title: "Categoría agregada",
        description: `La categoría ${data.nombre} ha sido agregada correctamente.`,
      })

      cargarCategorias()
    }

    return data
  }

  // Editar una categoría
  const handleEditCategory = async (oldCategory, newCategory) => {
    // Encontrar el ID de la categoría por su nombre
    const categoria = categorias.find((c) => c.nombre === oldCategory)

    if (!categoria) {
      toast({
        title: "Error",
        description: "Categoría no encontrada",
        variant: "destructive",
      })
      return
    }

    const data = await fetchApi(`/api/categorias/${categoria.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: newCategory }),
    })

    if (data) {
      toast({
        title: "Categoría actualizada",
        description: `La categoría ha sido actualizada correctamente.`,
      })

      cargarCategorias()
      cargarProductos() // Recargar productos para actualizar nombres de categorías
    }
  }

  // Configurar ordenamiento
  const requestSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Cambiar tema
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-[#013612] dark:bg-[#011a09] text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <Package2 size={24} />
            <div>
              <h1 className="text-xl font-bold">Sistema de Control de Inventario</h1>
              <p className="text-sm opacity-80">Gestiona tu inventario de manera eficiente</p>
            </div>
          </motion.div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-white hover:bg-[#01471a] dark:hover:bg-[#012b10]"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 mt-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Productos en Inventario</h2>
          <Button
            onClick={() => setIsAddingProduct(true)}
            className="bg-[#EABD00] hover:bg-[#d9ae00] text-[#013612] gap-2"
            disabled={loading}
          >
            <Plus size={16} />
            Agregar Producto
          </Button>
        </div>

        <Tabs defaultValue="todos" className="w-full">
          <TabsList className="mb-4 bg-muted">
            <TabsTrigger value="todos" className="data-[state=active]:bg-background">
              <Package2 size={16} className="mr-2" />
              Todos
            </TabsTrigger>
            <TabsTrigger value="stock-bajo" className="data-[state=active]:bg-background">
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
            <TabsTrigger value="estadisticas" className="data-[state=active]:bg-background">
              <BarChart3 size={16} className="mr-2" />
              Estadísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar productos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {loading ? (
                <div className="text-center py-8">Cargando productos...</div>
              ) : (
                <ProductList
                  products={sortedProducts}
                  onSelectProduct={handleSelectProduct}
                  selectedProductId={selectedProduct?.id}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRequestSort={requestSort}
                  sortConfig={sortConfig}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="stock-bajo" className="space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar productos con stock bajo..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {loading ? (
                <div className="text-center py-8">Cargando productos...</div>
              ) : (
                <ProductList
                  products={lowStockProducts.filter(
                    (product) =>
                      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      product.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
                  )}
                  onSelectProduct={handleSelectProduct}
                  selectedProductId={selectedProduct?.id}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRequestSort={requestSort}
                  sortConfig={sortConfig}
                  isLowStockTab={true}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="estadisticas" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Cargando estadísticas...</div>
            ) : (
              <StatsCards stats={estadisticas} />
            )}
          </TabsContent>
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
                categories={categorias}
                onAddCategory={handleAddCategory}
                onEditCategory={handleEditCategory}
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
              categories={categorias}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
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

      <Toaster />
    </div>
  )
}

