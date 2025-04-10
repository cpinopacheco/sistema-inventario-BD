"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package2, AlertTriangle, Archive } from "lucide-react";
import type { StatsCardsProps } from "@/types";

// StatsCards component displays inventory statistics
export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Resumen de Inventario</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1.0],
          }}
        >
          <Card className="bg-blue-50 border-blue-100 dark:bg-blue-950 dark:border-blue-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Package2 size={16} />
                Total de Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {stats.totalProductos}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.1,
            ease: [0.25, 0.1, 0.25, 1.0],
          }}
        >
          <Card className="bg-green-50 border-green-100 dark:bg-green-950 dark:border-green-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                <Archive size={16} />
                Stock Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                {stats.totalStock}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.2,
            ease: [0.25, 0.1, 0.25, 1.0],
          }}
        >
          <Card className="bg-red-50 border-red-100 dark:bg-red-950 dark:border-red-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle size={16} />
                Productos con Stock Bajo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                {stats.stockBajo}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="bg-card rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium mb-4">Productos por Categoría</h3>
        <div className="space-y-4">
          {stats.porCategoria &&
            stats.porCategoria.map((item, index) => (
              <motion.div
                key={item.nombre}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.3 + index * 0.08,
                  ease: [0.25, 0.1, 0.25, 1.0],
                }}
                className="flex items-center"
              >
                <div className="w-32 font-medium">{item.nombre}</div>
                <div className="flex-1 mx-2">
                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#52C1E4] dark:bg-[#3ba9cc]"
                      style={{
                        width: `${
                          (item.cantidad / stats.totalProductos) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="w-10 text-right font-medium">
                  {item.cantidad}
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
}
