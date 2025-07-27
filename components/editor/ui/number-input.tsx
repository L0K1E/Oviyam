"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Plus, Minus } from "lucide-react"

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
  disabled?: boolean
}

export function NumberInput({ value, onChange, min, max, step = 1, className = "", disabled }: NumberInputProps) {
  const [inputValue, setInputValue] = useState(value.toString())
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toString())
    }
  }, [value, isFocused])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    const numValue = Number.parseFloat(newValue)
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(
        min ?? Number.NEGATIVE_INFINITY,
        Math.min(max ?? Number.POSITIVE_INFINITY, numValue),
      )
      onChange(clampedValue)
    }
  }

  const handleIncrement = () => {
    const newValue = Math.min(max ?? Number.POSITIVE_INFINITY, value + step)
    onChange(newValue)
  }

  const handleDecrement = () => {
    const newValue = Math.max(min ?? Number.NEGATIVE_INFINITY, value - step)
    onChange(newValue)
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
    const numValue = Number.parseFloat(inputValue)
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(
        min ?? Number.NEGATIVE_INFINITY,
        Math.min(max ?? Number.POSITIVE_INFINITY, numValue),
      )
      onChange(clampedValue)
      setInputValue(clampedValue.toString())
    } else {
      setInputValue(value.toString())
    }
  }

  return (
    <div className={`flex items-center ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className="themed-input flex-1 text-center"
      />
      <div className="flex flex-col ml-1">
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && value >= max)}
          className="w-4 h-2 flex items-center justify-center text-muted hover:text-primary disabled:opacity-30 hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-2 h-2" />
        </button>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || (min !== undefined && value <= min)}
          className="w-4 h-2 flex items-center justify-center text-muted hover:text-primary disabled:opacity-30 hover:bg-gray-800 transition-colors"
        >
          <Minus className="w-2 h-2" />
        </button>
      </div>
    </div>
  )
}
