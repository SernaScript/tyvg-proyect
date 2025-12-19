'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Truck, AlertCircle } from 'lucide-react'
import { Trip } from '@/types/trip'
import { TripForm } from '@/components/forms/TripForm'

interface EditTripModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  tripId: string
}

export function EditTripModal({ isOpen, onClose, onSuccess, tripId }: EditTripModalProps) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && tripId) {
      fetchTrip()
    }
  }, [isOpen, tripId])

  const fetchTrip = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}`)
      if (response.ok) {
        const data = await response.json()
        setTrip(data)
      }
    } catch (error) {
      console.error('Error fetching trip:', error)
    }
  }

  const handleSubmit = async (data: any) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al actualizar el viaje')
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      setLoading(false)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setTrip(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <Card className="w-full max-w-7xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              Editar Viaje
            </CardTitle>
            <CardDescription>
              {trip?.incomingReceiptNumber ? `Recibo Entrada: ${trip.incomingReceiptNumber}` : 'Sin número de recibo'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={loading}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {trip && trip.project && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Información del Proyecto</p>
                  <p className="text-sm text-blue-700">
                    <strong>Proyecto:</strong> {trip.project.name} •
                    <strong> Cliente:</strong> {trip.project.client?.name || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {trip && (
            <TripForm
              initialData={trip}
              onSubmit={handleSubmit}
              onCancel={handleClose}
              loading={loading}
              showApprovalCheckbox={true}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
