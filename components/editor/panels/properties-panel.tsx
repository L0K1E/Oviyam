"use client"

import type React from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useEditor } from "../editor-context"
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Type,
} from "lucide-react"
import { useState } from "react"
import { CustomInput } from "../ui/custom-input"
import { CustomSlider } from "../ui/custom-slider"
import { ColorSwatch } from "../ui/color-swatch"

export function PropertiesPanel() {
  const { state, updateObject } = useEditor()
  const selectedObjects = state.objects.filter((obj) => state.selectedIds.includes(obj.id))

  if (selectedObjects.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="h-8 border-b border-panel flex items-center px-2 text-xs text-secondary">Properties</div>
        <div className="flex-1 flex items-center justify-center text-muted text-xs">No selection</div>
      </div>
    )
  }

  const selectedObject = selectedObjects[0]

  const SectionTitle = ({ title }: { title: string }) => (
    <div className="border-b border-panel title">
      <div className="w-full flex justify-between h-6 px-2 text-xs text-secondary items-center">
        <span>{title}</span>
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      <div className="h-8 border-b border-panel flex items-center px-2 text-xs text-secondary">
        <span>Properties</span>
        <div className="flex-1" />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">

        {selectedObject.type === "text" && (
          <div className="p-2">
            <SectionTitle title="Typography" />

            <div>
              <Label className="text-xs text-muted block mb-1">Text</Label>
              <CustomInput
                value={selectedObject.text || ""}
                onChange={(value) => updateObject(selectedObject.id, { text: value })}
                placeholder="Enter text..."
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted block mb-1">Size</Label>
                <CustomInput
                  type="number"
                  value={selectedObject.fontSize || 24}
                  onChange={(value) =>
                    updateObject(selectedObject.id, { fontSize: Math.max(1, Number.parseFloat(value) || 1) })
                  }
                  min={1}
                  className="w-[100px]"
                />
              </div>
              <div>
                <Label className="text-xs text-muted block mb-1 w-[100px]">Line Height</Label>
                <CustomInput
                  type="number"
                  value={selectedObject.lineHeight || 1.2}
                  onChange={(value) =>
                    updateObject(selectedObject.id, {
                      lineHeight: Math.max(0.5, Math.min(3, Number.parseFloat(value) || 1.2)),
                    })
                  }
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="w-[100px]"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted block mb-1">Font Family</Label>
              <select
                value={selectedObject.fontFamily || "Inter"}
                onChange={(e) => updateObject(selectedObject.id, { fontFamily: e.target.value })}
                className="w-full custom-input"
              >
                <option value="Inter">Inter</option>
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
              </select>
            </div>

            <div>
              <Label className="text-xs text-muted block mb-1">Alignment</Label>
              <div className="flex gap-1">
                {[AlignLeft, AlignCenter, AlignRight, AlignJustify].map((Icon, i) => {
                  const value = ["left", "center", "right", "justify"][i]
                  return (
                    <Button
                      key={value}
                      variant="ghost"
                      size="sm"
                      onClick={() => updateObject(selectedObject.id, { textAlign: value })}
                      className={`w-6 h-5 p-0 ${
                        selectedObject.textAlign === value
                          ? "primary-bg text-white"
                          : "text-muted hover:text-primary hover:bg-gray-800"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                    </Button>
                  )
                })}
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted block mb-1">Format</Label>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    updateObject(selectedObject.id, {
                      fontWeight: selectedObject.fontWeight === "bold" ? "normal" : "bold",
                    })
                  }
                  className={`w-6 h-5 p-0 ${
                    selectedObject.fontWeight === "bold"
                      ? "primary-bg text-white"
                      : "text-muted hover:text-primary hover:bg-gray-800"
                  }`}
                >
                  <Bold className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    updateObject(selectedObject.id, {
                      fontStyle: selectedObject.fontStyle === "italic" ? "normal" : "italic",
                    })
                  }
                  className={`w-6 h-5 p-0 ${
                    selectedObject.fontStyle === "italic"
                      ? "primary-bg text-white"
                      : "text-muted hover:text-primary hover:bg-gray-800"
                  }`}
                >
                  <Italic className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    updateObject(selectedObject.id, {
                      textDecoration: selectedObject.textDecoration === "underline" ? "none" : "underline",
                    })
                  }
                  className={`w-6 h-5 p-0 ${
                    selectedObject.textDecoration === "underline"
                      ? "primary-bg text-white"
                      : "text-muted hover:text-primary hover:bg-gray-800"
                  }`}
                >
                  <Underline className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    updateObject(selectedObject.id, {
                      textTransform: selectedObject.textTransform === "uppercase" ? "none" : "uppercase",
                    })
                  }
                  className={`w-6 h-5 p-0 ${
                    selectedObject.textTransform === "uppercase"
                      ? "primary-bg text-white"
                      : "text-muted hover:text-primary hover:bg-gray-800"
                  }`}
                >
                  <Type className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs text-muted">Letter Spacing</Label>
                <span className="text-xs text-muted">{(selectedObject.letterSpacing || 0).toFixed(1)}px</span>
              </div>
              <CustomSlider
                value={selectedObject.letterSpacing || 0}
                onChange={(value) => updateObject(selectedObject.id, { letterSpacing: value })}
                min={-2}
                max={10}
                step={0.1}
              />
            </div>
          </div>
        )}

        <SectionTitle title="Transform" />
        <div className="grid grid-cols-2 gap-2 p-2">
          <div>
            <Label className="text-xs text-muted block mb-1">X</Label>
            <CustomInput
              type="number"
              value={selectedObject.x}
              onChange={(value) => updateObject(selectedObject.id, { x: Number.parseFloat(value) || 0 })}
              className="w-[100px]"
            />
          </div>
          <div>
            <Label className="text-xs text-muted block mb-1">Y</Label>
            <CustomInput
              type="number"
              value={selectedObject.y}
              onChange={(value) => updateObject(selectedObject.id, { y: Number.parseFloat(value) || 0 })}
              className="w-[100px]"
            />
          </div>
        </div>

        {selectedObject.width !== undefined && (
          <div className="grid grid-cols-2 gap-2 p-2">
            <div>
              <Label className="text-xs text-muted block mb-1">W</Label>
              <CustomInput
                type="number"
                value={selectedObject.width}
                onChange={(value) =>
                  updateObject(selectedObject.id, { width: Math.max(1, Number.parseFloat(value) || 1) })
                }
                min={1}
                className="w-[100px]"
              />
            </div>
            <div>
              <Label className="text-xs text-muted block mb-1">H</Label>
              <CustomInput
                type="number"
                value={selectedObject.height || 0}
                onChange={(value) =>
                  updateObject(selectedObject.id, { height: Math.max(1, Number.parseFloat(value) || 1) })
                }
                min={1}
                className="w-[100px]"
              />
            </div>
          </div>
        )}

        <div className="p-2">
          <div className="flex items-center justify-between mb-1">
            <Label className="text-xs text-muted">Rotation</Label>
            <span className="text-xs text-muted">{Math.round(selectedObject.rotation)}°</span>
          </div>
          <CustomSlider
            value={selectedObject.rotation}
            onChange={(value) => updateObject(selectedObject.id, { rotation: value })}
            min={-360}
            max={360}
            step={1}
          />
        </div>

        <SectionTitle title="Appearance" />
        <div className="p-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label className="text-xs text-muted">Opacity</Label>
            <span className="text-xs text-muted">{Math.round(selectedObject.opacity * 100)}%</span>
          </div>
          <CustomSlider
            value={selectedObject.opacity * 100}
            onChange={(value) => updateObject(selectedObject.id, { opacity: value / 100 })}
            min={0}
            max={100}
            step={1}
          />
        </div>

        {selectedObject.fill && (
          <div>
            <Label className="text-xs text-muted block mb-1">Fill</Label>
            <div className="flex gap-2 items-center">
              <ColorSwatch
                color={selectedObject.fill}
                onChange={(color) => updateObject(selectedObject.id, { fill: color })}
                title="Fill Color"
                size={20}
              />
              <CustomInput
                value={selectedObject.fill}
                onChange={(value) => updateObject(selectedObject.id, { fill: value })}
                className="flex-1 font-mono"
              />
            </div>
          </div>
        )}

        {selectedObject.stroke && (
          <>
            <div>
              <Label className="text-xs text-muted block mb-1">Stroke</Label>
              <div className="flex gap-2 items-center">
                <ColorSwatch
                  color={selectedObject.stroke}
                  onChange={(color) => updateObject(selectedObject.id, { stroke: color })}
                  title="Stroke Color"
                  size={20}
                  isStroke
                />
                <CustomInput
                  value={selectedObject.stroke}
                  onChange={(value) => updateObject(selectedObject.id, { stroke: value })}
                  className="flex-1 font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs text-muted">Stroke Width</Label>
                <span className="text-xs text-muted">{selectedObject.strokeWidth || 0}px</span>
              </div>
              <CustomSlider
                value={selectedObject.strokeWidth || 0}
                onChange={(value) => updateObject(selectedObject.id, { strokeWidth: value })}
                min={0}
                max={20}
                step={0.5}
              />
            </div>
          </>
        )}

        {selectedObject.type === "rectangle" && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs text-muted">Border Radius</Label>
              <span className="text-xs text-muted">{selectedObject.borderRadius || 0}px</span>
            </div>
            <CustomSlider
              value={selectedObject.borderRadius || 0}
              onChange={(value) => updateObject(selectedObject.id, { borderRadius: value })}
              min={0}
              max={50}
              step={1}
            />
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
