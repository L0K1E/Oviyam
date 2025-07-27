"use client"

import { Rect } from "react-konva"

interface SelectionBoxProps {
  x: number
  y: number
  width: number
  height: number
}

export function SelectionBox({ x, y, width, height }: SelectionBoxProps) {
  return (
    <Rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="rgba(59, 130, 246, 0.1)"
      stroke="#3b82f6"
      strokeWidth={1}
      dash={[5, 5]}
    />
  )
}
