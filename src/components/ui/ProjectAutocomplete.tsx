'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  MapPin, 
  User, 
  Check,
  ChevronDown,
  X
} from 'lucide-react'

interface Project {
  id: string
  name: string
  description?: string
  location?: string
  startDate?: Date
  endDate?: Date
  status: string
  client: {
    id: string
    name: string
    identification: string
  }
}

interface ProjectAutocompleteProps {
  label?: string
  placeholder?: string
  value?: Project | null
  onChange: (project: Project | null) => void
  error?: string
  disabled?: boolean
  required?: boolean
}

export function ProjectAutocomplete({
  label = "Proyecto",
  placeholder = "Buscar proyecto...",
  value,
  onChange,
  error,
  disabled = false,
  required = false
}: ProjectAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && searchTerm.length >= 2) {
      fetchProjects()
    }
  }, [searchTerm, isOpen])

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filtered = projects.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client.identification.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.location && project.location.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredProjects(filtered)
    } else {
      setFilteredProjects([])
    }
  }, [projects, searchTerm])

  useEffect(() => {
    if (value) {
      setSearchTerm(value.name)
    } else {
      setSearchTerm('')
    }
  }, [value])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/projects?isActive=true')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
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
    // Delay to allow click on dropdown items
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
          prev < filteredProjects.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < filteredProjects.length) {
          handleSelectProject(filteredProjects[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSelectProject = (project: Project) => {
    setSearchTerm(project.name)
    onChange(project)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'PLANNING': return 'bg-blue-100 text-blue-800'
      case 'ON_HOLD': return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Activo'
      case 'PLANNING': return 'Planificación'
      case 'ON_HOLD': return 'En Pausa'
      case 'COMPLETED': return 'Completado'
      case 'CANCELLED': return 'Cancelado'
      default: return status
    }
  }

  return (
    <div className="space-y-2 relative">
      {label && (
        <Label htmlFor="project-search">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            ref={inputRef}
            id="project-search"
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
                <p className="text-sm text-muted-foreground">Buscando proyectos...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {searchTerm.length < 2 
                    ? 'Escribe al menos 2 caracteres para buscar'
                    : 'No se encontraron proyectos'
                  }
                </p>
              </div>
            ) : (
              <div className="py-1">
                {filteredProjects.map((project, index) => (
                  <div
                    key={project.id}
                    className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                      index === highlightedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleSelectProject(project)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm truncate">{project.name}</p>
                          {value?.id === project.id && (
                            <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <User className="h-3 w-3" />
                          <span>{project.client.name}</span>
                          <span>•</span>
                          <span>{project.client.identification}</span>
                        </div>
                        {project.location && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{project.location}</span>
                          </div>
                        )}
                      </div>
                      <Badge className={`${getStatusColor(project.status)} text-xs ml-2 flex-shrink-0`}>
                        {getStatusText(project.status)}
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

      {/* Selected Project Info */}
      {value && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-semibold text-blue-900">{value.name}</p>
              <p className="text-sm text-blue-700">
                Cliente: {value.client.name} • {value.client.identification}
              </p>
              {value.location && (
                <p className="text-sm text-blue-700">
                  Ubicación: {value.location}
                </p>
              )}
            </div>
            <Badge className={`${getStatusColor(value.status)} text-xs`}>
              {getStatusText(value.status)}
            </Badge>
          </div>
        </div>
      )}
    </div>
  )
}
