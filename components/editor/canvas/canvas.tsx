"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"
import { useEditor } from "../editor-context"
import type { CanvasObject } from "../editor-context"

interface Point {
  x: number
  y: number
}

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { state, dispatch, addObject, updateObject, selectObjects, setTool } = useEditor()

  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [isDrawing, setIsDrawing] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 })
  const [currentPreview, setCurrentPreview] = useState<CanvasObject | null>(null)
  const [draggedObject, setDraggedObject] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 })
  const [selectionBox, setSelectionBox] = useState<{ start: Point; end: Point } | null>(null)

  // Transform screen coordinates to canvas coordinates
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number): Point => {
      return {
        x: (screenX - state.panX) / state.zoom,
        y: (screenY - state.panY) / state.zoom,
      }
    },
    [state.panX, state.panY, state.zoom],
  )

  // Transform canvas coordinates to screen coordinates
  const canvasToScreen = useCallback(
    (canvasX: number, canvasY: number): Point => {
      return {
        x: canvasX * state.zoom + state.panX,
        y: canvasY * state.zoom + state.panY,
      }
    },
    [state.panX, state.panY, state.zoom],
  )

  // Update canvas size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setCanvasSize({ width: rect.width, height: rect.height })
      }
    }

    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  // Render canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Save context
    ctx.save()

    // Apply zoom and pan
    ctx.translate(state.panX, state.panY)
    ctx.scale(state.zoom, state.zoom)

    // Draw grid
    if (state.showGrid) {
      drawGrid(ctx)
    }
    // Draw objects
    ;[...state.objects].forEach((obj) => {
      if (obj.visible) {
        drawObject(ctx, obj, state.selectedIds.includes(obj.id))
      }
    })

    // Draw preview object
    if (currentPreview) {
      ctx.globalAlpha = 0.7
      drawObject(ctx, currentPreview, false)
      ctx.globalAlpha = 1
    }

    // Restore context
    ctx.restore()

    // Draw selection box (in screen coordinates)
    if (selectionBox) {
      ctx.save()
      ctx.strokeStyle = "#3b82f6"
      ctx.fillStyle = "rgba(59, 130, 246, 0.1)"
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])

      const width = selectionBox.end.x - selectionBox.start.x
      const height = selectionBox.end.y - selectionBox.start.y

      ctx.fillRect(selectionBox.start.x, selectionBox.start.y, width, height)
      ctx.strokeRect(selectionBox.start.x, selectionBox.start.y, width, height)
      ctx.restore()
    }
  }, [state, currentPreview, selectionBox])

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const gridSize = 40
    const startX = Math.floor(-state.panX / state.zoom / gridSize) * gridSize
    const startY = Math.floor(-state.panY / state.zoom / gridSize) * gridSize
    const endX = startX + canvasSize.width / state.zoom + gridSize
    const endY = startY + canvasSize.height / state.zoom + gridSize

    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 0.2 / state.zoom
    ctx.beginPath()

    // Vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.moveTo(x, startY)
      ctx.lineTo(x, endY)
    }

    // Horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.moveTo(startX, y)
      ctx.lineTo(endX, y)
    }

    ctx.stroke()
  }

  const drawObject = (ctx: CanvasRenderingContext2D, obj: CanvasObject, isSelected: boolean) => {
    ctx.save()

    // Apply transformations
    ctx.translate(obj.x + (obj.width || 0) / 2, obj.y + (obj.height || 0) / 2)
    ctx.rotate((obj.rotation * Math.PI) / 180)
    ctx.scale(obj.scaleX, obj.scaleY)
    ctx.globalAlpha = obj.opacity

    // Draw based on type
    switch (obj.type) {
      case "rectangle":
        drawRectangle(ctx, obj)
        break
      case "ellipse":
        drawEllipse(ctx, obj)
        break
      case "line":
        drawLine(ctx, obj)
        break
      case "text":
        drawText(ctx, obj)
        break
    }

    ctx.restore()

    // Draw selection outline
    if (isSelected) {
      drawSelectionOutline(ctx, obj)
    }
  }

  const drawRectangle = (ctx: CanvasRenderingContext2D, obj: CanvasObject) => {
    const x = -(obj.width || 0) / 2
    const y = -(obj.height || 0) / 2
    const width = obj.width || 0
    const height = obj.height || 0
    const radius = obj.borderRadius || 0

    if (radius > 0) {
      ctx.beginPath()
      ctx.roundRect(x, y, width, height, radius)
    } else {
      ctx.beginPath()
      ctx.rect(x, y, width, height)
    }

    if (obj.fill) {
      ctx.fillStyle = obj.fill
      ctx.fill()
    }

    if (obj.stroke && obj.strokeWidth) {
      ctx.strokeStyle = obj.stroke
      ctx.lineWidth = obj.strokeWidth
      ctx.stroke()
    }
  }

  const drawEllipse = (ctx: CanvasRenderingContext2D, obj: CanvasObject) => {
    const radiusX = (obj.width || 0) / 2
    const radiusY = (obj.height || 0) / 2

    ctx.beginPath()
    ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, 2 * Math.PI)

    if (obj.fill) {
      ctx.fillStyle = obj.fill
      ctx.fill()
    }

    if (obj.stroke && obj.strokeWidth) {
      ctx.strokeStyle = obj.stroke
      ctx.lineWidth = obj.strokeWidth
      ctx.stroke()
    }
  }

  const drawLine = (ctx: CanvasRenderingContext2D, obj: CanvasObject) => {
    const startX = -(obj.width || 0) / 2
    const startY = -(obj.height || 0) / 2
    const endX = (obj.width || 0) / 2
    const endY = (obj.height || 0) / 2

    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)

    if (obj.stroke && obj.strokeWidth) {
      ctx.strokeStyle = obj.stroke
      ctx.lineWidth = obj.strokeWidth
      ctx.stroke()
    }
  }

  const drawText = (ctx: CanvasRenderingContext2D, obj: CanvasObject) => {
    ctx.font = `${obj.fontStyle === "italic" ? "italic " : ""}${obj.fontWeight || "normal"} ${obj.fontSize || 24}px ${obj.fontFamily || "Inter"}`
    ctx.textAlign = (obj.textAlign as CanvasTextAlign) || "left"
    ctx.textBaseline = "middle"

    if (obj.fill) {
      ctx.fillStyle = obj.fill
      ctx.fillText(obj.text || "", 0, 0)
    }

    if (obj.stroke && obj.strokeWidth) {
      ctx.strokeStyle = obj.stroke
      ctx.lineWidth = obj.strokeWidth
      ctx.strokeText(obj.text || "", 0, 0)
    }
  }

  const drawSelectionOutline = (ctx: CanvasRenderingContext2D, obj: CanvasObject) => {
    ctx.save()
    ctx.translate(obj.x, obj.y)
    ctx.rotate((obj.rotation * Math.PI) / 180)
    ctx.scale(obj.scaleX, obj.scaleY)

    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 2 / state.zoom
    ctx.setLineDash([5 / state.zoom, 5 / state.zoom])
    ctx.strokeRect(0, 0, obj.width || 0, obj.height || 0)

    // Draw resize handles
    const handleSize = 8 / state.zoom
    ctx.fillStyle = "#3b82f6"
    ctx.setLineDash([])

    const positions = [
      [0, 0],
      [obj.width || 0, 0],
      [obj.width || 0, obj.height || 0],
      [0, obj.height || 0],
      [(obj.width || 0) / 2, 0],
      [obj.width || 0, (obj.height || 0) / 2],
      [(obj.width || 0) / 2, obj.height || 0],
      [0, (obj.height || 0) / 2],
    ]

    positions.forEach(([x, y]) => {
      ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize)
    })

    ctx.restore()
  }

  // Get object at point
  const getObjectAtPoint = (point: Point): CanvasObject | null => {
    // Check objects in reverse order (top to bottom)
    for (let i = state.objects.length - 1; i >= 0; i--) {
      const obj = state.objects[i]
      if (!obj.visible) continue

      if (
        point.x >= obj.x &&
        point.x <= obj.x + (obj.width || 0) &&
        point.y >= obj.y &&
        point.y <= obj.y + (obj.height || 0)
      ) {
        return obj
      }
    }
    return null
  }

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const screenPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    const canvasPoint = screenToCanvas(screenPoint.x, screenPoint.y)

    if (state.activeTool === "hand" || (e.shiftKey && state.activeTool === "select")) {
      setIsPanning(true)
      setDragStart(screenPoint)
      return
    }

    if (state.activeTool === "select") {
      const hitObject = getObjectAtPoint(canvasPoint)

      if (hitObject) {
        if (!state.selectedIds.includes(hitObject.id)) {
          selectObjects([hitObject.id])
        }
        setDraggedObject(hitObject.id)
        setDragOffset({
          x: canvasPoint.x - hitObject.x,
          y: canvasPoint.y - hitObject.y,
        })
      } else {
        selectObjects([])
        setSelectionBox({ start: screenPoint, end: screenPoint })
      }
    } else if (["rectangle", "ellipse", "line"].includes(state.activeTool)) {
      setIsDrawing(true)
      setDragStart(canvasPoint)

      const newObj: CanvasObject = {
        id: "preview",
        type: state.activeTool as any,
        name: `${state.activeTool} ${state.objects.length + 1}`,
        x: canvasPoint.x,
        y: canvasPoint.y,
        width: 0,
        height: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        visible: true,
        locked: false,
        fill: state.activeTool === "line" ? undefined : "#3b82f6",
        stroke: "#1e40af",
        strokeWidth: 2,
      }
      setCurrentPreview(newObj)
    } else if (state.activeTool === "text") {
      addObject("text", canvasPoint.x, canvasPoint.y)
      setTool("select")
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const screenPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    const canvasPoint = screenToCanvas(screenPoint.x, screenPoint.y)

    if (isPanning) {
      const deltaX = screenPoint.x - dragStart.x
      const deltaY = screenPoint.y - dragStart.y
      dispatch({ type: "SET_PAN", panX: state.panX + deltaX, panY: state.panY + deltaY })
      setDragStart(screenPoint)
    } else if (draggedObject) {
      const newX = canvasPoint.x - dragOffset.x
      const newY = canvasPoint.y - dragOffset.y
      updateObject(draggedObject, { x: newX, y: newY })
    } else if (selectionBox) {
      setSelectionBox({ start: selectionBox.start, end: screenPoint })
    } else if (isDrawing && currentPreview) {
      const width = Math.abs(canvasPoint.x - dragStart.x)
      const height = Math.abs(canvasPoint.y - dragStart.y)
      const x = Math.min(canvasPoint.x, dragStart.x)
      const y = Math.min(canvasPoint.y, dragStart.y)

      setCurrentPreview({
        ...currentPreview,
        x,
        y,
        width,
        height: currentPreview.type === "line" ? canvasPoint.y - dragStart.y : height,
      })
    }
  }

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false)
    } else if (draggedObject) {
      setDraggedObject(null)
      dispatch({ type: "SAVE_STATE" })
    } else if (selectionBox) {
      // Select objects within selection box
      const canvasStart = screenToCanvas(selectionBox.start.x, selectionBox.start.y)
      const canvasEnd = screenToCanvas(selectionBox.end.x, selectionBox.end.y)

      const minX = Math.min(canvasStart.x, canvasEnd.x)
      const maxX = Math.max(canvasStart.x, canvasEnd.x)
      const minY = Math.min(canvasStart.y, canvasEnd.y)
      const maxY = Math.max(canvasStart.y, canvasEnd.y)

      const selectedIds = state.objects
        .filter(
          (obj) =>
            obj.x >= minX && obj.x + (obj.width || 0) <= maxX && obj.y >= minY && obj.y + (obj.height || 0) <= maxY,
        )
        .map((obj) => obj.id)

      selectObjects(selectedIds)
      setSelectionBox(null)
    } else if (isDrawing && currentPreview) {
      if ((currentPreview.width || 0) > 5 || (currentPreview.height || 0) > 5) {
        addObject(currentPreview.type, currentPreview.x, currentPreview.y, {
          width: currentPreview.width,
          height: currentPreview.height,
        })
        setTool("select")
      }
      setIsDrawing(false)
      setCurrentPreview(null)
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(0.1, Math.min(5, state.zoom * zoomFactor))

    // Zoom towards mouse cursor
    const zoomRatio = newZoom / state.zoom
    const newPanX = mouseX - (mouseX - state.panX) * zoomRatio
    const newPanY = mouseY - (mouseY - state.panY) * zoomRatio

    dispatch({ type: "SET_ZOOM", zoom: newZoom })
    dispatch({ type: "SET_PAN", panX: newPanX, panY: newPanY })
  }

  // Render on state changes
  useEffect(() => {
    render()
  }, [render])

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{
          cursor:
            state.activeTool === "hand" || isPanning ? "grab" : state.activeTool === "select" ? "default" : "crosshair",
        }}
      />
    </div>
  )
}
