"use client"

import { useRef } from "react"
import { Rect, Ellipse, Line, Text } from "react-konva"
import { useEditor } from "../editor-context"
import type Konva from "konva"
import type { CanvasObject as CanvasObjectInterface } from "../editor-context"

interface KonvaCanvasObjectProps {
  object: CanvasObjectInterface
  isSelected: boolean
  isPreview?: boolean
}

export function KonvaCanvasObject({ object, isSelected, isPreview = false }: KonvaCanvasObjectProps) {
  const { selectObjects } = useEditor()
  const shapeRef = useRef<Konva.Node>(null)

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isPreview) return

    e.cancelBubble = true
    if (!isSelected) {
      selectObjects([object.id])
    }
  }

  if (!object.visible && !isPreview) return null

  const commonProps = {
    ref: shapeRef,
    id: object.id,
    x: object.x,
    y: object.y,
    rotation: object.rotation,
    scaleX: object.scaleX,
    scaleY: object.scaleY,
    opacity: isPreview ? 0.7 : object.opacity,
    draggable: !object.locked && !isPreview && isSelected,
    onClick: handleClick,
  }

  let shape
  switch (object.type) {
    case "rectangle":
      shape = (
        <Rect
          {...commonProps}
          width={object.width}
          height={object.height}
          fill={object.fill}
          stroke={object.stroke}
          strokeWidth={object.strokeWidth}
          cornerRadius={object.borderRadius || 0}
        />
      )
      break

    case "ellipse":
      shape = (
        <Ellipse
          {...commonProps}
          radiusX={(object.width || 100) / 2}
          radiusY={(object.height || 100) / 2}
          offsetX={-(object.width || 100) / 2}
          offsetY={-(object.height || 100) / 2}
          fill={object.fill}
          stroke={object.stroke}
          strokeWidth={object.strokeWidth}
        />
      )
      break

    case "line":
      shape = (
        <Line
          {...commonProps}
          points={[0, 0, object.width || 100, object.height || 0]}
          stroke={object.stroke}
          strokeWidth={object.strokeWidth}
        />
      )
      break

    case "text":
      shape = (
        <Text
          {...commonProps}
          text={object.text}
          fontSize={object.fontSize}
          fontFamily={object.fontFamily}
          fill={object.fill}
          fontStyle={`${object.fontWeight === "bold" ? "bold " : ""}${object.fontStyle === "italic" ? "italic" : ""}`}
          textDecoration={object.textDecoration}
          align={object.textAlign}
          letterSpacing={object.letterSpacing}
          lineHeight={object.lineHeight}
        />
      )
      break

    case "polygon":
      if (object.points && object.points.length >= 6) {
        shape = (
          <Line
            {...commonProps}
            points={object.points}
            fill={object.fill}
            stroke={object.stroke}
            strokeWidth={object.strokeWidth}
            closed={true}
          />
        )
      }
      break

    default:
      return null
  }

  return shape
}
