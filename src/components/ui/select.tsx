"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  disabled = false,
  className,
  ariaLabel
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(option => option.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={selectRef}>
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
        aria-haspopup="listbox"
      >
        <span className={cn(
          "truncate",
          !selectedOption && "text-gray-500"
        )}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={cn(
                "w-full px-3 py-2 text-left hover:bg-orange-50 transition-colors",
                "flex items-center justify-between",
                value === option.value && "bg-orange-100 text-orange-900"
              )}
            >
              <span>{option.label}</span>
              {value === option.value && (
                <Check className="h-4 w-4 text-orange-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
