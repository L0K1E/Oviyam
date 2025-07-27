"use client"

import { Button } from "@/components/ui/button"
import { useEditor } from "../editor-context"
import { Undo2, Redo2, Grid, Magnet, ZoomIn, ZoomOut, Save, FolderOpen } from "lucide-react"

export function TopBar() {
  const { state, dispatch, undo, redo } = useEditor()

  const handleZoomIn = () => {
    const newZoom = Math.min(5, state.zoom * 1.2)
    dispatch({ type: "SET_ZOOM", zoom: newZoom })
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(0.1, state.zoom / 1.2)
    dispatch({ type: "SET_ZOOM", zoom: newZoom })
  }

  const handleZoomReset = () => {
    dispatch({ type: "SET_ZOOM", zoom: 1 })
    dispatch({ type: "SET_PAN", panX: 0, panY: 0 })
  }

  return (
    <div className="h-8 panel-bg border-b border-panel flex items-center px-2 text-xs">
      {/* File Operations */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => console.log("Save")}
          className="h-6 px-2 text-xs text-secondary hover:text-primary hover:bg-gray-800"
        >
          <Save className="w-3 h-3 mr-1" />
          Save
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => console.log("Open")}
          className="h-6 px-2 text-xs text-secondary hover:text-primary hover:bg-gray-800"
        >
          <FolderOpen className="w-3 h-3 mr-1" />
          Open
        </Button>
      </div>

      <div className="w-px h-4 bg-gray-700 mx-2" />

      {/* History */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={state.historyIndex <= 0}
          className="h-6 w-6 p-0 text-secondary hover:text-primary hover:bg-gray-800 disabled:opacity-30"
        >
          <Undo2 className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={state.historyIndex >= state.history.length - 1}
          className="h-6 w-6 p-0 text-secondary hover:text-primary hover:bg-gray-800 disabled:opacity-30"
        >
          <Redo2 className="w-3 h-3" />
        </Button>
      </div>

      <div className="w-px h-4 bg-gray-700 mx-2" />

      {/* View Options */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({ type: "TOGGLE_GRID" })}
          className={`h-6 w-6 p-0 ${
            state.showGrid ? "text-white primary-bg" : "text-secondary hover:text-primary hover:bg-gray-800"
          }`}
        >
          <Grid className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({ type: "TOGGLE_SNAP" })}
          className={`h-6 w-6 p-0 ${
            state.snapToGrid ? "text-white primary-bg" : "text-secondary hover:text-primary hover:bg-gray-800"
          }`}
        >
          <Magnet className="w-3 h-3" />
        </Button>
      </div>

      <div className="w-px h-4 bg-gray-700 mx-2" />

      {/* Zoom Controls */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomOut}
          className="h-6 w-6 p-0 text-secondary hover:text-primary hover:bg-gray-800"
        >
          <ZoomOut className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomReset}
          className="h-6 px-2 text-xs text-secondary hover:text-primary hover:bg-gray-800 font-mono"
        >
          {Math.round(state.zoom * 100)}%
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomIn}
          className="h-6 w-6 p-0 text-secondary hover:text-primary hover:bg-gray-800"
        >
          <ZoomIn className="w-3 h-3" />
        </Button>
      </div>

      <div className="flex-1" />

      {/* Project Name */}
      <div className="text-xs text-secondary">Untitled Project</div>
    </div>
  )
}
