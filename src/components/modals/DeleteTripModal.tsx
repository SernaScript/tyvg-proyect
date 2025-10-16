'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2, X } from 'lucide-react'

interface DeleteTripModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  tripInfo?: {
    waybillNumber?: string
    projectName: string
    clientName: string
    scheduledDate: Date
    status: string
  }
  loading?: boolean
}

export function DeleteTripModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  tripInfo,
  loading = false 
}: DeleteTripModalProps) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'Programado'
      case 'LOADING': return 'Cargando'
      case 'IN_TRANSIT': return 'En Tránsito'
      case 'DELIVERED': return 'Entregado'
      case 'COMPLETED': return 'Completado'
      case 'INVOICED': return 'Facturado'
      default: return status
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg">Confirmar Eliminación</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-900 mb-2">
                  ¿Estás seguro de que deseas eliminar este viaje?
                </p>
                <p className="text-sm text-red-700">
                  Esta acción no se puede deshacer. El viaje será eliminado permanentemente 
                  y la solicitud de viaje volverá al estado "Pendiente".
                </p>
              </div>
            </div>
          </div>

          {tripInfo && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Información del Viaje:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Guía:</span>
                  <span className="font-medium">
                    {tripInfo.waybillNumber || 'Sin número de guía'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Proyecto:</span>
                  <span className="font-medium">{tripInfo.projectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cliente:</span>
                  <span className="font-medium">{tripInfo.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha Programada:</span>
                  <span className="font-medium">{formatDate(tripInfo.scheduledDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className="font-medium">{getStatusText(tripInfo.status)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Viaje
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
