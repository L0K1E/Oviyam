"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { CustomInput } from "./custom-input"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  onClose: () => void
}

const presetColors = [
  "#ff6b35",
  "#f7931e",
  "#ffd700",
  "#32cd32",
  "#00bfff",
  "#6a5acd",
  "#ff69b4",
  "#ff4500",
  "#ffffff",
  "#cccccc",
  "#999999",
  "#666666",
  "#333333",
  "#000000",
  "#8b0000",
  "#006400",
]

export function ColorPicker({ color, onChange, onClose }: ColorPickerProps) {
  const [hexValue, setHexValue] = useState(color)

  useEffect(() => {
    setHexValue(color)
  }, [color])

  const handleHexChange = (value: string) => {
    setHexValue(value)
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      onChange(value)
    }
  }

  const handlePresetClick = (presetColor: string) => {
    onChange(presetColor)
    setHexValue(presetColor)
  }

  const handleNativeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    onChange(newColor)
    setHexValue(newColor)
  }

  return (
    <div className="p-3 space-y-3">
      {/* Color input */}
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={color}
          onChange={handleNativeColorChange}
          className="w-8 h-6 border border-gray-600 bg-black cursor-pointer"
          style={{ borderRadius: "2px" }}
        />
        <CustomInput value={hexValue} onChange={handleHexChange} placeholder="#000000" className="flex-1 font-mono" />
      </div>

      {/* Preset colors */}
      <div className="grid grid-cols-8 gap-1">
        {presetColors.map((presetColor) => (
          <button
            key={presetColor}
            onClick={() => handlePresetClick(presetColor)}
            className="w-5 h-5 border border-gray-600 hover:border-gray-500 transition-colors"
            style={{ backgroundColor: presetColor, borderRadius: "2px" }}
            title={presetColor}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="text-xs text-secondary hover:text-primary px-2 py-1 hover:bg-gray-800 transition-colors"
          style={{ borderRadius: "2px" }}
        >
          Done
        </button>
      </div>
    </div>
  )
}
