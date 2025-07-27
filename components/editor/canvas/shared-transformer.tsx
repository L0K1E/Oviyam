"use client"

import { useRef, useEffect } from "react"
import { Transformer } from "react-konva"
import type Konva from "konva"
import type { CanvasObject } from "../editor-context"

interface SharedTransformerProps {
  selectedIds: string[]
  objects: CanvasObject[]
  onTransform: (id: string, updates: Partial<CanvasObject>) => void
}

export function SharedTransformer({ selectedIds, objects, onTransform }: SharedTransformerProps) {
  const transformerRef = useRef<Konva.Transformer>(null)

  useEffect(() => {
    const transformer = transformerRef.current
    if (!transformer) return

    const stage = transformer.getStage()
    if (!stage) return

    if (selectedIds.length === 0) {
      transformer.nodes([])
      return
    }

    // Find the selected nodes
    const selectedNodes: Konva.Node[] = []
    selectedIds.forEach((id) => {
      const node = stage.findOne(`#${id}`)
      if (node) {
        selectedNodes.push(node)
      }
    })

    transformer.nodes(selectedNodes)
    transformer.getLayer()?.batchDraw()
  }, [selectedIds])

  const handleTransformEnd = () => {
    const transformer = transformerRef.current
    if (!transformer) return

    const nodes = transformer.nodes()
    nodes.forEach((node) => {
      const id = node.id()
      const object = objects.find((obj) => obj.id === id)
      if (!object) return

      const scaleX = node.scaleX()
      const scaleY = node.scaleY()

      // Calculate new dimensions
      const newWidth = Math.max(5, (object.width || 100) * Math.abs(scaleX))
      const newHeight = Math.max(5, (object.height || 100) * Math.abs(scaleY))

      const updates: Partial<CanvasObject> = {
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        width: newWidth,
        height: newHeight,
        scaleX: scaleX < 0 ? -1 : 1,
        scaleY: scaleY < 0 ? -1 : 1,
      }

      onTransform(id, updates)

      // Reset scale to 1 after applying the transformation
      node.scaleX(scaleX < 0 ? -1 : 1)
      node.scaleY(scaleY < 0 ? -1 : 1)
    })
  }

  const handleDragEnd = () => {
    const transformer = transformerRef.current
    if (!transformer) return

    const nodes = transformer.nodes()
    nodes.forEach((node) => {
      const id = node.id()
      onTransform(id, {
        x: node.x(),
        y: node.y(),
      })
    })
  }

  return (
    <Transformer
      ref={transformerRef}
      boundBoxFunc={(oldBox, newBox) => {
        // Limit minimum size
        if (newBox.width < 5 || newBox.height < 5) {
          return oldBox
        }
        return newBox
      }}
      anchorSize={8}
      anchorStroke="#ff6b35"
      anchorFill="#ff6b35"
      anchorCornerRadius={4}
      borderStroke="#ff6b35"
      borderStrokeWidth={1}
      borderDash={[3, 3]}
      rotateEnabled={true}
      enabledAnchors={[
        "top-left",
        "top-center",
        "top-right",
        "middle-right",
        "bottom-right",
        "bottom-center",
        "bottom-left",
        "middle-left",
      ]}
      onTransformEnd={handleTransformEnd}
      onDragEnd={handleDragEnd}
    />
  )
}
