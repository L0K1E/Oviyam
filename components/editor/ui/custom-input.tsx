"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"

interface CustomInputProps {
  value: string | number
  onChange: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  type?: "text" | "number"
  placeholder?: string
  className?: string
  disabled?: boolean
  min?: number
  max?: number
  step?: number
  id?: string
  name?: string
}



export function CustomInput({
  id,
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  type = "text",
  placeholder,
  className = "",
  disabled,
  min,
  max,
  step,
}: CustomInputProps) {
  const [internalValue, setInternalValue] = useState(String(value))
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update internal value when external value changes (but not when focused)
  useEffect(() => {
    if (!isFocused) {
      setInternalValue(String(value))
    }
  }, [value, isFocused])

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      onFocus?.()
      // Disable global shortcuts
      document.body.classList.add("input-focused")
      e.target.select() // Select all text on focus
      console.log("I GOT FOCUSED")
    },
    [onFocus],
  )

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      onBlur?.()
      // Re-enable global shortcuts
      document.body.classList.remove("input-focused")

      // Validate and commit final value
      if (type === "number") {
        const numValue = Number.parseFloat(internalValue)
        if (!isNaN(numValue)) {
          const clampedValue = Math.max(
            min ?? Number.NEGATIVE_INFINITY,
            Math.min(max ?? Number.POSITIVE_INFINITY, numValue),
          )
          const finalValue = String(clampedValue)
          setInternalValue(finalValue)
          onChange(finalValue)
        } else {
          setInternalValue(String(value))
        }
      } else {
        onChange(internalValue)
      }
    },
    [internalValue, onChange, type, min, max, value, onBlur],
  )

const handleChange = useCallback(
  (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)

    // For numbers, validate and call onChange immediately if valid
    if (type === "number") {
      const numValue = Number.parseFloat(newValue)
      if (!isNaN(numValue)) {
        onChange(newValue)
      }
    } else {
      onChange(newValue)
    }
  },
  [onChange, type],
)


  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Prevent global shortcuts while typing

      console.log("typing:", e)
      if (!(e.ctrlKey || e.metaKey)) {
        // Only block shortcut keys, not everything
        e.stopPropagation()
      }

      if (e.key === "Enter") {
        inputRef.current?.blur()
        return
      }

      if (e.key === "Escape") {
        setInternalValue(String(value))
        inputRef.current?.blur()
        return
      }

      if (type === "number") {
        // Allow number input keys
        const allowedKeys = [
          "Backspace",
          "Delete",
          "Tab",
          "Escape",
          "Enter",
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Home",
          "End",
          ".",
          "-",
        ]

        if (!allowedKeys.includes(e.key) && !(e.key >= "0" && e.key <= "9") && !(e.ctrlKey || e.metaKey)) {
          e.preventDefault()
          return
        }

        // Handle arrow keys for number increment/decrement
        if (e.key === "ArrowUp") {
          e.preventDefault()
          const currentNum = Number.parseFloat(internalValue) || 0
          const newValue = currentNum + (step || 1)
          const clampedValue = Math.min(max ?? Number.POSITIVE_INFINITY, newValue)
          const finalValue = String(clampedValue)
          setInternalValue(finalValue)
          onChange(finalValue)
        } else if (e.key === "ArrowDown") {
          e.preventDefault()
          const currentNum = Number.parseFloat(internalValue) || 0
          const newValue = currentNum - (step || 1)
          const clampedValue = Math.max(min ?? Number.NEGATIVE_INFINITY, newValue)
          const finalValue = String(clampedValue)
          setInternalValue(finalValue)
          onChange(finalValue)
        }
      }
    },
    [internalValue, onChange, type, step, min, max, value],
  )

  return (
  <input
    id={id}
    name={name}
    ref={inputRef}
    type={type}
    value={internalValue}
    onChange={handleChange}
    onFocus={handleFocus}
    onBlur={handleBlur}
    onKeyDown={handleKeyDown}
    placeholder={placeholder}
    disabled={disabled}
    className={`custom-input ${className}`}
  />
  )
}
