"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Stage, Layer, Line } from "react-konva"
import { useEditor } from "../editor-context"
import { KonvaCanvasObject } from "./konva-canvas-object"
import { SharedTransformer } from "./shared-transformer"
import type Konva from "konva"

export default function KonvaCanvas() {
  const { state, dispatch, addObject, selectObjects, updateObject } = useEditor()
  const stageRef = useRef<Konva.Stage>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 })
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 })
  const [currentShape, setCurrentShape] = useState<any>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setStageSize({ width: rect.width, height: rect.height })
      }
    }

    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  const getRelativePointerPosition = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return { x: 0, y: 0 }

    const transform = stage.getAbsoluteTransform().copy()
    transform.invert()
    const pos = stage.getPointerPosition()
    return transform.point(pos || { x: 0, y: 0 })
  }, [])

  const createShapeFromType = useCallback(
    (type: string, x: number, y: number, width: number, height: number) => {
      const baseProps = {
        x,
        y,
        width: Math.abs(width),
        height: Math.abs(height),
        fill: type === "line" ? undefined : state.activeFillColor,
        stroke: state.activeStrokeColor,
        strokeWidth: state.activeStrokeWidth,
      }

      switch (type) {
        case "rectangle":
          return addObject("rectangle", x, y, baseProps)
        case "ellipse":
          return addObject("ellipse", x, y, baseProps)
        case "line":
          return addObject("line", x, y, {
            ...baseProps,
            width: width,
            height: height,
            fill: undefined,
          })
        case "triangle":
          return addObject("polygon", x, y, {
            ...baseProps,
            points: [width / 2, 0, 0, height, width, height],
          })
        case "diamond":
          return addObject("polygon", x, y, {
            ...baseProps,
            points: [width / 2, 0, width, height / 2, width / 2, height, 0, height / 2],
          })
        case "hexagon":
          return addObject("polygon", x, y, {
            ...baseProps,
            points: [
              width * 0.25,
              0,
              width * 0.75,
              0,
              width,
              height * 0.43,
              width * 0.75,
              height,
              width * 0.25,
              height,
              0,
              height * 0.43,
            ],
          })
        case "star":
          return addObject("polygon", x, y, {
            ...baseProps,
            points: [
              width * 0.5,
              0,
              width * 0.61,
              height * 0.35,
              width * 0.98,
              height * 0.35,
              width * 0.68,
              height * 0.57,
              width * 0.79,
              height * 0.91,
              width * 0.5,
              height * 0.7,
              width * 0.21,
              height * 0.91,
              width * 0.32,
              height * 0.57,
              width * 0.02,
              height * 0.35,
              width * 0.39,
              height * 0.35,
            ],
          })
        default:
          return addObject("rectangle", x, y, baseProps)
      }
    },
    [addObject, state.activeFillColor, state.activeStrokeColor, state.activeStrokeWidth],
  )

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault()

      const stage = stageRef.current
      if (!stage) return

      const oldScale = stage.scaleX()
      const pointer = stage.getPointerPosition()
      if (!pointer) return

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      }

      const direction = e.evt.deltaY > 0 ? -1 : 1
      const factor = 1.1
      const newScale = direction > 0 ? oldScale * factor : oldScale / factor

      const clampedScale = Math.max(0.1, Math.min(5, newScale))

      dispatch({ type: "SET_ZOOM", zoom: clampedScale })

      const newPos = {
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      }

      dispatch({ type: "SET_PAN", panX: newPos.x, panY: newPos.y })
    },
    [dispatch],
  )

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = stageRef.current
      if (!stage) return

      const pos = getRelativePointerPosition()

      // Handle panning with hand tool or spacebar
      if (state.activeTool === "hand" || e.evt.shiftKey) {
        setIsPanning(true)
        setLastPanPoint({ x: e.evt.clientX, y: e.evt.clientY })
        return
      }

      // Handle selection
      if (state.activeTool === "select") {
        if (e.target === stage) {
          selectObjects([])
        }
        return
      }

      // Handle shape drawing
      if (["rectangle", "ellipse", "line", "triangle", "diamond", "hexagon", "star"].includes(state.activeTool)) {
        setIsDrawing(true)
        setDrawStart(pos)

        // Create temporary shape for preview
        const tempShape = {
          id: "temp",
          type: state.activeTool,
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          fill: state.activeTool === "line" ? undefined : state.activeFillColor,
          stroke: state.activeStrokeColor,
          strokeWidth: state.activeStrokeWidth,
          points:
            state.activeTool === "triangle"
              ? [0, 0, 0, 0, 0, 0]
              : state.activeTool === "diamond"
                ? [0, 0, 0, 0, 0, 0, 0, 0]
                : state.activeTool === "hexagon"
                  ? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                  : state.activeTool === "star"
                    ? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                    : undefined,
        }
        setCurrentShape(tempShape)
      }

      // Handle text tool
      if (state.activeTool === "text") {
        addObject("text", pos.x, pos.y)
        dispatch({ type: "SET_TOOL", tool: "select" })
      }
    },
    [
      state.activeTool,
      state.activeFillColor,
      state.activeStrokeColor,
      state.activeStrokeWidth,
      getRelativePointerPosition,
      selectObjects,
      addObject,
      dispatch,
    ],
  )

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = stageRef.current
      if (!stage) return

      // Handle panning
      if (isPanning) {
        const deltaX = e.evt.clientX - lastPanPoint.x
        const deltaY = e.evt.clientY - lastPanPoint.y

        dispatch({
          type: "SET_PAN",
          panX: state.panX + deltaX,
          panY: state.panY + deltaY,
        })

        setLastPanPoint({ x: e.evt.clientX, y: e.evt.clientY })
        return
      }

      // Handle shape drawing
      if (isDrawing && currentShape) {
        const pos = getRelativePointerPosition()
        const width = pos.x - drawStart.x
        const height = pos.y - drawStart.y

        const updatedShape = {
          ...currentShape,
          width: Math.abs(width),
          height: Math.abs(height),
          x: width < 0 ? pos.x : drawStart.x,
          y: height < 0 ? pos.y : drawStart.y,
        }

        // Update points for polygon shapes
        if (currentShape.type === "triangle") {
          updatedShape.points = [Math.abs(width) / 2, 0, 0, Math.abs(height), Math.abs(width), Math.abs(height)]
        } else if (currentShape.type === "diamond") {
          updatedShape.points = [
            Math.abs(width) / 2,
            0,
            Math.abs(width),
            Math.abs(height) / 2,
            Math.abs(width) / 2,
            Math.abs(height),
            0,
            Math.abs(height) / 2,
          ]
        } else if (currentShape.type === "hexagon") {
          updatedShape.points = [
            Math.abs(width) * 0.25,
            0,
            Math.abs(width) * 0.75,
            0,
            Math.abs(width),
            Math.abs(height) * 0.43,
            Math.abs(width) * 0.75,
            Math.abs(height),
            Math.abs(width) * 0.25,
            Math.abs(height),
            0,
            Math.abs(height) * 0.43,
          ]
        } else if (currentShape.type === "star") {
          const w = Math.abs(width)
          const h = Math.abs(height)
          updatedShape.points = [
            w * 0.5,
            0,
            w * 0.61,
            h * 0.35,
            w * 0.98,
            h * 0.35,
            w * 0.68,
            h * 0.57,
            w * 0.79,
            h * 0.91,
            w * 0.5,
            h * 0.7,
            w * 0.21,
            h * 0.91,
            w * 0.32,
            h * 0.57,
            w * 0.02,
            h * 0.35,
            w * 0.39,
            h * 0.35,
          ]
        }

        setCurrentShape(updatedShape)
      }
    },
    [
      isPanning,
      lastPanPoint,
      state.panX,
      state.panY,
      dispatch,
      isDrawing,
      currentShape,
      drawStart,
      getRelativePointerPosition,
    ],
  )

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)

    if (isDrawing && currentShape && (currentShape.width > 5 || currentShape.height > 5)) {
      // Create the actual shape
      createShapeFromType(currentShape.type, currentShape.x, currentShape.y, currentShape.width, currentShape.height)

      // Switch back to select tool
      dispatch({ type: "SET_TOOL", tool: "select" })
    }

    setIsDrawing(false)
    setCurrentShape(null)
  }, [isDrawing, currentShape, createShapeFromType, dispatch])

  const renderGrid = () => {
    if (!state.showGrid) return null

    const gridSize = 20
    const lines = []

    // Vertical lines
    for (let i = 0; i < stageSize.width / state.zoom; i += gridSize) {
      lines.push(
        <Line
          key={`v${i}`}
          points={[i, -state.panY / state.zoom, i, (stageSize.height - state.panY) / state.zoom]}
          stroke="#374151"
          strokeWidth={0.5}
        />,
      )
    }

    // Horizontal lines
    for (let i = 0; i < stageSize.height / state.zoom; i += gridSize) {
      lines.push(
        <Line
          key={`h${i}`}
          points={[-state.panX / state.zoom, i, (stageSize.width - state.panX) / state.zoom, i]}
          stroke="#374151"
          strokeWidth={0.5}
        />,
      )
    }

    return lines
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={state.zoom}
        scaleY={state.zoom}
        x={state.panX}
        y={state.panY}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {renderGrid()}

          {state.objects.map((object) => (
            <KonvaCanvasObject key={object.id} object={object} isSelected={state.selectedIds.includes(object.id)} />
          ))}

          {/* Preview shape while drawing */}
          {currentShape && <KonvaCanvasObject object={currentShape} isSelected={false} isPreview={true} />}

          {/* Shared Transformer */}
          <SharedTransformer selectedIds={state.selectedIds} objects={state.objects} onTransform={updateObject} />
        </Layer>
      </Stage>
    </div>
  )
}
