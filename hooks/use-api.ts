"use client"

import { useState } from "react"

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función genérica para hacer peticiones
  async function fetchApi<T>(url: string, options?: RequestInit): Promise<T | null> {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url, options)

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: `Error: ${response.status} ${response.statusText}` }))
        throw new Error(errorData.error || `Error: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (err: any) {
      console.error("Error en fetchApi:", err.message || "Error desconocido")
      setError(err.message || "Ocurrió un error al procesar la solicitud")
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    fetchApi,
  }
}

