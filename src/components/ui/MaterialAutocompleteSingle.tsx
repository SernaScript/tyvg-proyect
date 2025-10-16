'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Package, 
  Check,
  ChevronDown,
  X
} from 'lucide-react'

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

interface MaterialAutocompleteSingleProps {
  label?: string
  placeholder?: string
  value?: Material | null
  onChange: (material: Material | null) => void
  error?: string
  disabled?: boolean
  required?: boolean
}

export function MaterialAutocompleteSingle({
  label = "Material",
  placeholder = "Buscar material...",
  value,
  onChange,
  error,
  disabled = false,
  required = false
}: MaterialAutocompleteSingleProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [materials, setMaterials] = useState<Material[]>([])
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && searchTerm.length >= 2) {
      fetchMaterials()
    }
  }, [searchTerm, isOpen])

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filtered = materials.filter(material => 
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (material.description && material.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredMaterials(filtered)
    } else {
      setFilteredMaterials([])
    }
  }, [materials, searchTerm])

  useEffect(() => {
    if (value) {
      setSearchTerm(value.name)
    } else {
      setSearchTerm('')
    }
  }, [value])

  const fetchMaterials = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/materials?isActive=true')
      if (response.ok) {
        const data = await response.json()
        setMaterials(data)
      }
    } catch (error) {
      console.error('Error fetching materials:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setIsOpen(true)
    setHighlightedIndex(-1)
    
    if (!value) {
      onChange(null)
    }
  }

  const handleInputFocus = () => {
    if (searchTerm.length >= 2) {
      setIsOpen(true)
    }
  }

  const handleInputBlur = (e: React.FocusEvent) => {
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }, 150)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredMaterials.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < filteredMaterials.length) {
          handleSelectMaterial(filteredMaterials[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSelectMaterial = (material: Material) => {
    setSearchTerm(material.name)
    onChange(material)
    setIsOpen(false)
    setHighlightedIndex(-1)
    inputRef.current?.blur()
  }

  const handleClear = () => {
    setSearchTerm('')
    onChange(null)
    setIsOpen(false)
    setHighlightedIndex(-1)
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-2 relative">
      {label && (
        <Label htmlFor="material-search">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            ref={inputRef}
            id="material-search"
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`pl-10 pr-20 ${error ? 'border-red-500' : ''}`}
            autoComplete="off"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded"
                disabled={disabled}
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Buscando materiales...</p>
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {searchTerm.length < 2 
                    ? 'Escribe al menos 2 caracteres para buscar'
                    : 'No se encontraron materiales'
                  }
                </p>
              </div>
            ) : (
              <div className="py-1">
                {filteredMaterials.map((material, index) => (
                  <div
                    key={material.id}
                    className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                      index === highlightedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleSelectMaterial(material)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm truncate">{material.name}</p>
                          {value?.id === material.id && (
                            <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {material.type}
                          </Badge>
                          <span>{material.unitOfMeasure}</span>
                        </div>
                        {material.description && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {material.description}
                          </p>
                        )}
                      </div>
                      <Badge className={`${material.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} text-xs ml-2 flex-shrink-0`}>
                        {material.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Selected Material Info */}
      {value && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-semibold text-blue-900">{value.name}</p>
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Badge variant="outline" className="text-xs">
                  {value.type}
                </Badge>
                <span>{value.unitOfMeasure}</span>
              </div>
              {value.description && (
                <p className="text-sm text-blue-700 mt-1">
                  {value.description}
                </p>
              )}
            </div>
            <Badge className={`${value.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} text-xs`}>
              {value.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </div>
      )}
    </div>
  )
}
