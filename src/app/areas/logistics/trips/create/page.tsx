'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AreaLayout } from '@/components/layout/AreaLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TripForm } from '@/components/forms/TripForm'

export default function CreateTripPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al crear el viaje')
      }

      // Success - will be handled by the form
    } catch (error: any) {
      setLoading(false)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAndAddAnother = () => {
    // Reset form by reloading the component
    window.location.reload()
  }

  return (
    <AreaLayout areaId="logistics" moduleId="trips" hideSidebar={true}>
      <div className="space-y-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Viaje</CardTitle>
            <CardDescription>
              Ingresa todos los datos necesarios para registrar el viaje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TripForm
              onSubmit={handleSubmit}
              onCancel={() => router.push('/areas/logistics/trips')}
              loading={loading}
              showSaveAndAddAnother={true}
              onSaveAndAddAnother={handleSaveAndAddAnother}
            />
          </CardContent>
        </Card>
      </div>
    </AreaLayout>
  )
}
