"use client"

import { useState, useRef, useEffect } from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  disabled = false,
  className,
  ariaLabel
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const datePickerRef = useRef<HTMLDivElement>(null)

  const selectedDate = value ? new Date(value) : null

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push({ date: prevDate, isCurrentMonth: false })
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({ date, isCurrentMonth: true })
    }
    
    // Días del mes siguiente para completar la cuadrícula
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day)
      days.push({ date: nextDate, isCurrentMonth: false })
    }
    
    return days
  }

  const handleDateSelect = (date: Date) => {
    onChange(formatDateForInput(date))
    setIsOpen(false)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString()
  }

  const days = getDaysInMonth(currentMonth)
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  return (
    <div className="relative" ref={datePickerRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full px-3 py-2 text-left border border-gray-300 rounded-md",
          "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500",
          "disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500",
          "hover:border-gray-400 transition-colors",
          "flex items-center justify-between",
          className
        )}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
      >
        <span className={cn(
          "truncate",
          !selectedDate && "text-gray-500"
        )}>
          {selectedDate ? formatDate(selectedDate) : placeholder}
        </span>
        <Calendar className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-2 w-64">
          {/* Header del calendario */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <h3 className="text-sm font-semibold text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleDateSelect(day.date)}
                className={cn(
                  "h-6 w-6 text-xs rounded hover:bg-orange-100 transition-colors",
                  !day.isCurrentMonth && "text-gray-400",
                  day.isCurrentMonth && "text-gray-900",
                  isToday(day.date) && "bg-blue-100 text-blue-900 font-semibold",
                  isSelected(day.date) && "bg-orange-500 text-white font-semibold hover:bg-orange-600"
                )}
              >
                {day.date.getDate()}
              </button>
            ))}
          </div>

          {/* Botón para limpiar selección */}
          {selectedDate && (
            <div className="mt-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => {
                  onChange('')
                  setIsOpen(false)
                }}
                className="w-full text-xs text-gray-500 hover:text-gray-700 py-1"
              >
                Limpiar selección
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}