"use client"

import { useState, useEffect } from "react"

// Hook para detectar si el dispositivo es móvil
export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Verificar al cargar
    checkIfMobile()

    // Verificar al cambiar el tamaño de la ventana
    window.addEventListener("resize", checkIfMobile)

    // Limpiar evento
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  return isMobile
}

