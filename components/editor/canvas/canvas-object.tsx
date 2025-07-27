"use client"

import { useRef, useEffect, useState } from "react"
import { Rect, Ellipse, Line, Text, Transformer } from "react-konva"
import { useEditor } from "../editor-context"
import type Konva from "konva"
import type { CanvasObject as CanvasObjectInterface } from "../editor-context"

interface CanvasObjectProps {
  object: CanvasObjectInterface
  isSelected: boolean
}

export function CanvasObject({ object, isSelected }: CanvasObjectProps) {
  const { updateObject, selectObjects } = useEditor()
  const shapeRef = useRef<Konva.Node>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    if (isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current])
      transformerRef.current.getLayer()?.batchDraw()
    }
  }, [isSelected, isMounted])

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true
    if (!isSelected) {
      selectObjects([object.id])
    }
  }

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    updateObject(object.id, {
      x: e.target.x(),
      y: e.target.y(),
    })
  }

  const handleTransformEnd = () => {
    const node = shapeRef.current
    if (node) {
      const scaleX = node.scaleX()
      const scaleY = node.scaleY()

      updateObject(object.id, {
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        scaleX,
        scaleY,
        width: Math.max(5, (object.width || 100) * scaleX),
        height: Math.max(5, (object.height || 100) * scaleY),
      })

      // Reset scale
      node.scaleX(1)
      node.scaleY(1)
    }
  }

  if (!object.visible || !isMounted) return null

  const commonProps = {
    ref: shapeRef,
    x: object.x,
    y: object.y,
    rotation: object.rotation,
    scaleX: object.scaleX,
    scaleY: object.scaleY,
    opacity: object.opacity,
    draggable: !object.locked,
    onClick: handleClick,
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
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
        />
      )
      break

    case "ellipse":
      shape = (
        <Ellipse
          {...commonProps}
          radiusX={(object.width || 100) / 2}
          radiusY={(object.height || 100) / 2}
          fill={object.fill}
          stroke={object.stroke}
          strokeWidth={object.strokeWidth}
        />
      )
      break

    case "line":
      shape = <Line {...commonProps} points={[0, 0, 100, 0]} stroke={object.stroke} strokeWidth={object.strokeWidth} />
      break

    case "text":
      shape = (
        <Text
          {...commonProps}
          text={object.text}
          fontSize={object.fontSize}
          fontFamily={object.fontFamily}
          fill={object.fill}
        />
      )
      break

    default:
      return null
  }

  return (
    <>
      {shape}
      {isSelected && !object.locked && isMounted && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox
            }
            return newBox
          }}
        />
      )}
    </>
  )
}
