"use client"

import { useState, useRef, useEffect } from "react"
import { ColorPicker } from "./color-picker"

interface ColorSwatchProps {
  color: string
  onChange: (color: string) => void
  title: string
  size?: number
  isStroke?: boolean
  className?: string
}

export function ColorSwatch({ color, onChange, title, size = 24, isStroke = false, className = "" }: ColorSwatchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.body.classList.add("input-focused") // Disable shortcuts
    } else {
      document.body.classList.remove("input-focused")
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.classList.remove("input-focused")
    }
  }, [isOpen])

  const handleClick = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        onClick={handleClick}
        title={title}
        className={`color-swatch ${isStroke ? "stroke-swatch" : ""}`}
        style={{
          width: size,
          height: size,
          backgroundColor: isStroke ? "transparent" : color,
          color: isStroke ? color : "transparent",
        }}
      />

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute mb-2 left-1/2 transform color-picker-popup"
          style={{ minWidth: "200px" }}
        >
          <ColorPicker color={color} onChange={onChange} onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  )
}
