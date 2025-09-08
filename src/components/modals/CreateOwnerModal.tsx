"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, UserPlus, AlertCircle, CheckCircle } from "lucide-react"

interface CreateOwnerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateOwnerModal({ isOpen, onClose, onSuccess }: CreateOwnerModalProps) {
  const [formData, setFormData] = useState({
    document: '',
    firstName: '',
    lastName: '',
    isActive: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    
    if (name === 'document') {
      // Solo permitir números
      const numericValue = value.replace(/\D/g, '')
      setFormData(prev => ({ ...prev, [name]: numericValue }))
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/owners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear el propietario')
      }

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onSuccess()
        onClose()
        setFormData({
          document: '',
          firstName: '',
          lastName: '',
          isActive: true
        })
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el propietario')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        document: '',
        firstName: '',
        lastName: '',
        isActive: true
      })
      setError('')
      setSuccess(false)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            <CardTitle>Crear Propietario</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="document">Número de Documento *</Label>
              <Input
                id="document"
                name="document"
                type="text"
                value={formData.document}
                onChange={handleInputChange}
                placeholder="Solo números"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre *</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Ingrese el nombre"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido *</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Ingrese el apellido"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleInputChange}
                disabled={isLoading}
                className="rounded border-gray-300"
                aria-label="Propietario activo"
              />
              <Label htmlFor="isActive">Propietario activo</Label>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  Propietario creado exitosamente
                </span>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.document || !formData.firstName || !formData.lastName}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Crear Propietario
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
