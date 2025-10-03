'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  icon?: React.ReactNode
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  icon
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-red-900/50',
          iconColor: 'text-red-400',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
        }
      case 'warning':
        return {
          iconBg: 'bg-yellow-900/50',
          iconColor: 'text-yellow-400',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        }
      case 'info':
        return {
          iconBg: 'bg-blue-900/50',
          iconColor: 'text-blue-400',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white'
        }
    }
  }

  const styles = getVariantStyles()
  const defaultIcon = <AlertTriangle className="h-6 w-6" />

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-white z-10"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="p-6">
              {/* Icon */}
              <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${styles.iconBg} mb-4`}>
                <div className={styles.iconColor}>
                  {icon || defaultIcon}
                </div>
              </div>

              {/* Content */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {title}
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  {description}
                </p>

                {/* Actions */}
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    {cancelText}
                  </Button>
                  
                  <Button
                    onClick={handleConfirm}
                    className={`flex-1 ${styles.confirmButton}`}
                  >
                    {confirmText}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
