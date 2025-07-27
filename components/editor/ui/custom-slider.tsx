"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"

interface CustomSliderProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  className?: string
  disabled?: boolean
  onChangeStart?: () => void
  onChangeEnd?: () => void
}

export function CustomSlider({
  value,
  onChange,
  min,
  max,
  step = 1,
  className = "",
  disabled,
  onChangeStart,
  onChangeEnd,
}: CustomSliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)

  const percentage = ((value - min) / (max - min)) * 100

  const calculateValueFromPosition = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return value

      const rect = sliderRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left))
      const rawValue = min + (x / rect.width) * (max - min)
      const steppedValue = Math.round(rawValue / step) * step
      return Math.max(min, Math.min(max, steppedValue))
    },
    [min, max, step, value],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return

      e.preventDefault()
      e.stopPropagation()

      setIsDragging(true)
      setIsFocused(true)
      onChangeStart?.()

      // Disable global shortcuts
      document.body.classList.add("input-focused")

      const newValue = calculateValueFromPosition(e.clientX)
      onChange(newValue)
    },
    [disabled, calculateValueFromPosition, onChange, onChangeStart],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || disabled) return

      e.preventDefault()
      const newValue = calculateValueFromPosition(e.clientX)
      onChange(newValue)
    },
    [isDragging, disabled, calculateValueFromPosition, onChange],
  )

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return

    setIsDragging(false)
    onChangeEnd?.()

    // Don't remove focus immediately - let user continue interacting
    setTimeout(() => {
      if (!isFocused) {
        document.body.classList.remove("input-focused")
      }
    }, 100)
  }, [isDragging, onChangeEnd, isFocused])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return

      e.stopPropagation() // Prevent global shortcuts

      let newValue = value

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowDown":
          e.preventDefault()
          newValue = Math.max(min, value - step)
          break
        case "ArrowRight":
        case "ArrowUp":
          e.preventDefault()
          newValue = Math.min(max, value + step)
          break
        case "Home":
          e.preventDefault()
          newValue = min
          break
        case "End":
          e.preventDefault()
          newValue = max
          break
        case "Escape":
          e.preventDefault()
          sliderRef.current?.blur()
          return
        default:
          return
      }

      onChange(newValue)
    },
    [disabled, value, min, max, step, onChange],
  )

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    document.body.classList.add("input-focused")
  }, [])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    if (!isDragging) {
      document.body.classList.remove("input-focused")
    }
  }, [isDragging])

  // Global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove, { passive: false })
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <div
      ref={sliderRef}
      className={`custom-slider ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onMouseDown={handleMouseDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div className="custom-slider-track" />
      <div className="custom-slider-fill" style={{ width: `${percentage}%` }} />
      <div
        ref={thumbRef}
        className={`custom-slider-thumb ${isDragging ? "dragging" : ""}`}
        style={{ left: `${percentage}%` }}
      />
    </div>
  )
}
