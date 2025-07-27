"use client"

import type React from "react"
import { useCallback } from "react"
import type { CanvasObject } from "../editor-context"

interface TransformControlsProps {
  object: CanvasObject
  onTransform: (updates: Partial<CanvasObject>) => void
  zoom: number
}

export function TransformControls({ object, onTransform, zoom }: TransformControlsProps) {
  const handleSize = 8 / zoom
  const borderWidth = 1 / zoom

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, handleType: string) => {
      e.stopPropagation()
      e.preventDefault()

      const startX = e.clientX
      const startY = e.clientY
      const startWidth = object.width || 100
      const startHeight = object.height || 100
      const startX_pos = object.x
      const startY_pos = object.y

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = (e.clientX - startX) / zoom
        const deltaY = (e.clientY - startY) / zoom

        let updates: Partial<CanvasObject> = {}

        switch (handleType) {
          case "nw":
            updates = {
              width: Math.max(10, startWidth - deltaX),
              height: Math.max(10, startHeight - deltaY),
              x: startX_pos + deltaX,
              y: startY_pos + deltaY,
            }
            break
          case "n":
            updates = {
              height: Math.max(10, startHeight - deltaY),
              y: startY_pos + deltaY,
            }
            break
          case "ne":
            updates = {
              width: Math.max(10, startWidth + deltaX),
              height: Math.max(10, startHeight - deltaY),
              y: startY_pos + deltaY,
            }
            break
          case "e":
            updates = {
              width: Math.max(10, startWidth + deltaX),
            }
            break
          case "se":
            updates = {
              width: Math.max(10, startWidth + deltaX),
              height: Math.max(10, startHeight + deltaY),
            }
            break
          case "s":
            updates = {
              height: Math.max(10, startHeight + deltaY),
            }
            break
          case "sw":
            updates = {
              width: Math.max(10, startWidth - deltaX),
              height: Math.max(10, startHeight + deltaY),
              x: startX_pos + deltaX,
            }
            break
          case "w":
            updates = {
              width: Math.max(10, startWidth - deltaX),
              x: startX_pos + deltaX,
            }
            break
        }

        onTransform(updates)
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.body.style.cursor = "default"
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = getComputedStyle(e.target as Element).cursor
    },
    [object, onTransform, zoom],
  )

  if (!object.width || !object.height) return null

  const handles = [
    { type: "nw", x: 0, y: 0, cursor: "nw-resize" },
    { type: "n", x: object.width / 2, y: 0, cursor: "n-resize" },
    { type: "ne", x: object.width, y: 0, cursor: "ne-resize" },
    { type: "e", x: object.width, y: object.height / 2, cursor: "e-resize" },
    { type: "se", x: object.width, y: object.height, cursor: "se-resize" },
    { type: "s", x: object.width / 2, y: object.height, cursor: "s-resize" },
    { type: "sw", x: 0, y: object.height, cursor: "sw-resize" },
    { type: "w", x: 0, y: object.height / 2, cursor: "w-resize" },
  ]

  return (
    <g>
      {/* Selection outline */}
      <rect
        x={object.x}
        y={object.y}
        width={object.width}
        height={object.height}
        className="selection-outline"
        strokeWidth={borderWidth}
        strokeDasharray={`${3 / zoom} ${3 / zoom}`}
      />

      {/* Transform handles */}
      {handles.map((handle) => (
        <circle
          key={handle.type}
          cx={object.x + handle.x}
          cy={object.y + handle.y}
          r={handleSize / 2}
          className={`transform-handle corner ${handle.type}-resize`}
          style={{ cursor: handle.cursor }}
          onMouseDown={(e) => handleMouseDown(e, handle.type)}
        />
      ))}
    </g>
  )
}
