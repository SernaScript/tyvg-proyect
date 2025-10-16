'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Package, 
  Plus,
  Trash2,
  DollarSign
} from 'lucide-react'
import { MaterialAutocomplete } from './MaterialAutocomplete'

interface Material {
  id: string
  name: string
  type: string
  unitOfMeasure: string
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface MaterialPrice {
  materialId: string
  material: Material
  price: number
}

interface MaterialPriceManagerProps {
  label?: string
  materialPrices?: MaterialPrice[]
  onMaterialPricesChange: (materialPrices: MaterialPrice[]) => void
  error?: string
  disabled?: boolean
  required?: boolean
}

export function MaterialPriceManager({
  label = "Precios de Materiales",
  materialPrices = [],
  onMaterialPricesChange,
  error,
  disabled = false,
  required = false
}: MaterialPriceManagerProps) {
  const [selectedMaterials, setSelectedMaterials] = useState<Material[]>([])
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({})

  useEffect(() => {
    // Sincronizar materiales seleccionados con los precios existentes
    const materials = materialPrices.map(mp => mp.material)
    setSelectedMaterials(materials)
    
    // Sincronizar inputs de precios
    const prices: Record<string, string> = {}
    materialPrices.forEach(mp => {
      prices[mp.materialId] = mp.price.toString()
    })
    setPriceInputs(prices)
  }, [materialPrices])

  const handleMaterialsChange = (materials: Material[]) => {
    setSelectedMaterials(materials)
    
    // Mantener precios existentes y agregar nuevos materiales con precio 0
    const newPrices: Record<string, string> = { ...priceInputs }
    materials.forEach(material => {
      if (!newPrices[material.id]) {
        newPrices[material.id] = '0'
      }
    })
    setPriceInputs(newPrices)
    
    // Actualizar precios de materiales
    const updatedMaterialPrices: MaterialPrice[] = materials.map(material => {
      const existingPrice = materialPrices.find(mp => mp.materialId === material.id)
      return {
        materialId: material.id,
        material,
        price: existingPrice ? existingPrice.price : 0
      }
    })
    onMaterialPricesChange(updatedMaterialPrices)
  }

  const handlePriceChange = (materialId: string, price: string) => {
    const numericPrice = parseFloat(price) || 0
    setPriceInputs(prev => ({ ...prev, [materialId]: price }))
    
    // Actualizar el precio en la lista de precios
    const updatedMaterialPrices = materialPrices.map(mp => 
      mp.materialId === materialId 
        ? { ...mp, price: numericPrice }
        : mp
    )
    onMaterialPricesChange(updatedMaterialPrices)
  }

  const removeMaterial = (materialId: string) => {
    const updatedMaterials = selectedMaterials.filter(m => m.id !== materialId)
    setSelectedMaterials(updatedMaterials)
    
    const newPrices = { ...priceInputs }
    delete newPrices[materialId]
    setPriceInputs(newPrices)
    
    const updatedMaterialPrices = materialPrices.filter(mp => mp.materialId !== materialId)
    onMaterialPricesChange(updatedMaterialPrices)
  }

  return (
    <div className="space-y-4">
      {label && (
        <Label>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      {/* Selector de materiales */}
      <MaterialAutocomplete
        label="Seleccionar Materiales"
        placeholder="Buscar materiales para agregar precios..."
        selectedMaterials={selectedMaterials}
        onMaterialsChange={handleMaterialsChange}
        disabled={disabled}
        multiple={true}
      />

      {/* Lista de precios */}
      {selectedMaterials.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <Label className="text-base font-medium">Precios por Material</Label>
          </div>
          
          <div className="space-y-2">
            {selectedMaterials.map((material) => (
              <Card key={material.id} className="border border-gray-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="font-semibold text-sm">{material.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {material.unitOfMeasure}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`price-${material.id}`} className="text-xs whitespace-nowrap">
                          Precio:
                        </Label>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-muted-foreground">$</span>
                          <Input
                            id={`price-${material.id}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={priceInputs[material.id] || '0'}
                            onChange={(e) => handlePriceChange(material.id, e.target.value)}
                            placeholder="0.00"
                            disabled={disabled}
                            className="w-24 h-8 text-sm"
                          />
                          <span className="text-xs text-muted-foreground">
                            / {material.unitOfMeasure}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeMaterial(material.id)}
                      disabled={disabled}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
