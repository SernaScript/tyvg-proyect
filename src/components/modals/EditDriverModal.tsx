"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  X,
  User,
  IdCard,
  FileText,
  Phone,
  Mail,
  Info,
  Save
} from "lucide-react"

interface Driver {
  id: string
  name: string
  identification: string
  license: string
  phone?: string
  isActive: boolean
  user: {
    id: string
    name: string
    email: string
  }
}

interface EditDriverModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  driver: Driver | null
}

export function EditDriverModal({
  isOpen,
  onClose,
  onSuccess,
  driver
}: EditDriverModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    identification: '',
    license: '',
    phone: '',
    email: '',
    password: '',
    isActive: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPasswordField, setShowPasswordField] = useState(false)

  // Cargar datos del conductor cuando se abre el modal
  useEffect(() => {
    if (driver && isOpen) {
      setFormData({
        name: driver.name,
        identification: driver.identification,
        license: driver.license,
        phone: driver.phone || '',
        email: driver.user.email,
        password: '',
        isActive: driver.isActive
      })
      setShowPasswordField(false)
    }
  }, [driver, isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!driver) return

    setIsLoading(true)
    setError('')

    try {
      // Preparar datos para envío (solo enviar password si se proporcionó)
      const updateData: any = {
        name: formData.name,
        identification: formData.identification,
        license: formData.license,
        phone: formData.phone,
        email: formData.email,
        isActive: formData.isActive
      }

      // Solo incluir password si se proporcionó
      if (formData.password.trim()) {
        updateData.password = formData.password
      }

      const response = await fetch(`/api/drivers/${driver.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar el conductor')
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar el conductor')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    if (driver) {
      setFormData({
        name: driver.name,
        identification: driver.identification,
        license: driver.license,
        phone: driver.phone || '',
        email: driver.user.email,
        password: '',
        isActive: driver.isActive
      })
    }
    setShowPasswordField(false)
  }

  const handleClose = () => {
    if (!isLoading) {
      resetForm()
      setError('')
      setSuccess(false)
      onClose()
    }
  }

  if (!isOpen || !driver) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <Card 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <CardTitle>Editar Conductor</CardTitle>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nombre completo del conductor"
                    required
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Cédula */}
              <div className="space-y-2">
                <Label htmlFor="identification">Cédula *</Label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="identification"
                    name="identification"
                    type="text"
                    value={formData.identification}
                    onChange={handleInputChange}
                    placeholder="Número de cédula"
                    required
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Licencia */}
              <div className="space-y-2">
                <Label htmlFor="license">Número de Licencia *</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="license"
                    name="license"
                    type="text"
                    value={formData.license}
                    onChange={handleInputChange}
                    placeholder="Número de licencia de conducción"
                    required
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Número de teléfono"
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Correo electrónico"
                    required
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPasswordField(!showPasswordField)}
                    disabled={isLoading}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {showPasswordField ? 'Ocultar' : 'Cambiar'}
                  </Button>
                </div>
                {showPasswordField && (
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Nueva contraseña (dejar vacío para mantener la actual)"
                    disabled={isLoading}
                  />
                )}
                {!showPasswordField && (
                  <div className="text-sm text-gray-500">
                    Haz clic en "Cambiar" para actualizar la contraseña
                  </div>
                )}
              </div>
            </div>

            {/* Estado */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                disabled={isLoading}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="isActive" className="text-sm text-gray-700">
                Conductor activo
              </Label>
            </div>

            {/* Información sobre la edición */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Información sobre la Edición</h4>
                  <div className="text-sm text-blue-800 mt-1 space-y-1">
                    <p>• Los cambios se aplicarán tanto al conductor como a su usuario del sistema</p>
                    <p>• Si cambias el email, el conductor deberá usar el nuevo email para iniciar sesión</p>
                    <p>• La contraseña solo se actualiza si proporcionas una nueva</p>
                    <p>• Los documentos del conductor no se ven afectados por estos cambios</p>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <X className="h-5 w-5 text-red-600" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-green-600 rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-white rounded-full"></div>
                  </div>
                  <p className="text-green-800">Conductor actualizado exitosamente</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
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
                disabled={isLoading || !formData.name || !formData.identification || !formData.license || !formData.email}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Actualizar Conductor
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
