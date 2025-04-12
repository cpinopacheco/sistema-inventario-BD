"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning" | "info"
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
}: ConfirmDialogProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const isMobile = useMobile()

  // Manejar la animación al abrir
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
    }
  }, [isOpen])

  // Colores según la variante
  const getColors = () => {
    switch (variant) {
      case "danger":
        return {
          icon: "text-red-500 dark:text-red-400",
          button: "bg-red-600 hover:bg-red-700 text-white",
          border: "border-red-200 dark:border-red-900",
          bg: "bg-red-50 dark:bg-red-950/30",
        }
      case "warning":
        return {
          icon: "text-amber-500 dark:text-amber-400",
          button: "bg-amber-600 hover:bg-amber-700 text-white",
          border: "border-amber-200 dark:border-amber-900",
          bg: "bg-amber-50 dark:bg-amber-950/30",
        }
      case "info":
        return {
          icon: "text-blue-500 dark:text-blue-400",
          button: "bg-blue-600 hover:bg-blue-700 text-white",
          border: "border-blue-200 dark:border-blue-900",
          bg: "bg-blue-50 dark:bg-blue-950/30",
        }
      default:
        return {
          icon: "text-red-500 dark:text-red-400",
          button: "bg-red-600 hover:bg-red-700 text-white",
          border: "border-red-200 dark:border-red-900",
          bg: "bg-red-50 dark:bg-red-950/30",
        }
    }
  }

  const colors = getColors()

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] border-2 border-[#BFD189] dark:border-gray-700 p-0 overflow-hidden">
        <div className="bg-[#f5f9e8] dark:bg-[#1a2e22] pb-2 px-6 pt-4">
          <DialogTitle className="text-[#013612] dark:text-[#BFD189] text-lg">{title}</DialogTitle>
        </div>

        <div className="p-6">
          <div className={`p-3 rounded-full ${colors.bg} ${colors.border} border mb-4 w-fit mx-auto`}>
            <AnimatePresence>
              {isAnimating && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 15, stiffness: 400 }}
                >
                  <AlertTriangle className={`h-6 w-6 ${colors.icon}`} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </div>
        <div className="border-t p-4 flex justify-end gap-2 bg-background">
          {isMobile ? (
            <>
              <motion.div className="w-full" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="outline"
                  className={`w-full border-2 ${variant === "danger"
                    ? "border-red-600 text-red-600 hover:bg-red-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-950/30"
                    : "border-[#EABD00] text-[#EABD00] hover:bg-[#EABD00]/10"
                    }`}
                  onClick={handleConfirm}
                >
                  {confirmText}
                </Button>
              </motion.div>
              <Button
                variant="outline"
                className="w-full border-[#EABD00] text-[#EABD00] hover:bg-[#EABD00]/10 dark:border-[#EABD00] dark:text-[#EABD00] dark:hover:bg-[#EABD00]/10 border-2"
                onClick={onClose}
              >
                {cancelText}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="border-[#EABD00] text-[#EABD00] hover:bg-[#EABD00]/10 dark:border-[#EABD00] dark:text-[#EABD00] dark:hover:bg-[#EABD00]/10 border-2"
                onClick={onClose}
              >
                {cancelText}
              </Button>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="outline"
                  className={`border-2 ${variant === "danger"
                    ? "border-red-600 text-red-600 hover:bg-red-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-950/30"
                    : "border-[#EABD00] text-[#EABD00] hover:bg-[#EABD00]/10"
                    }`}
                  onClick={handleConfirm}
                >
                  {confirmText}
                </Button>
              </motion.div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
