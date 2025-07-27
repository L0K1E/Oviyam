"use client"

import { useEffect, useState } from "react"
import { Canvas } from "./canvas/canvas"
import { LayerPanel } from "./panels/layer-panel"
import { PropertiesPanel } from "./panels/properties-panel"
import { ShapeLibraryPanel } from "./panels/shape-library-panel"
import { ToolPalette } from "./toolbar/tool-palette"
import { TopBar } from "./toolbar/top-bar"
import { useEditor } from "./editor-context"
import { Button } from "@/components/ui/button"
import { Shapes, Layers } from "lucide-react"

export function EditorLayout() {
  const { undo, redo, deleteSelected, setTool } = useEditor()
  const [leftPanelWidth, setLeftPanelWidth] = useState(240)
  const [rightPanelWidth, setRightPanelWidth] = useState(260)
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const [activeLeftPanel, setActiveLeftPanel] = useState<"layers" | "shapes">("layers")
  const [isInputFocused, setIsInputFocused] = useState(false)

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.contentEditable === "true"
      ) {
        setIsInputFocused(true)
      }
    }

    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.contentEditable === "true"
      ) {
        setIsInputFocused(false)
      }
    }

    document.addEventListener("focusin", handleFocusIn)
    document.addEventListener("focusout", handleFocusOut)

    return () => {
      document.removeEventListener("focusin", handleFocusIn)
      document.removeEventListener("focusout", handleFocusOut)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip keyboard shortcuts when input is focused
      if (isInputFocused) return

      // Tool shortcuts
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case "v":
            e.preventDefault()
            setTool("select")
            break
          case "r":
            e.preventDefault()
            setTool("rectangle")
            break
          case "e":
            e.preventDefault()
            setTool("ellipse")
            break
          case "l":
            e.preventDefault()
            setTool("line")
            break
          case "t":
            e.preventDefault()
            setTool("text")
            break
          case "h":
            e.preventDefault()
            setTool("hand")
            break
        }
      }

      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case "z":
            e.preventDefault()
            if (e.shiftKey) {
              redo()
            } else {
              undo()
            }
            break
          case "y":
            e.preventDefault()
            redo()
            break
        }
      }

      switch (e.key) {
        case "Delete":
        case "Backspace":
          e.preventDefault()
          deleteSelected()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo, deleteSelected, setTool, isInputFocused])

  return (
    <div className="h-screen bg-white text-white flex flex-col overflow-hidden">
      <TopBar />

      <div className="flex-1 flex min-h-0">
        {/* Left Panel */}
        {!leftPanelCollapsed && (
          <div className="panel-bg border-r border-panel flex-shrink-0 flex flex-col" style={{ width: leftPanelWidth }}>
            {/* Panel Tabs */}
            <div className="h-8 border-b border-panel flex">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveLeftPanel("layers")}
                className={`flex-1 h-full rounded-none text-xs ${
                  activeLeftPanel === "layers"
                    ? "bg-gray-800 text-primary border-b-2 border-primary"
                    : "text-secondary hover:text-primary hover:bg-gray-900"
                }`}
              >
                <Layers className="w-3 h-3 mr-1" />
                Layers
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveLeftPanel("shapes")}
                className={`flex-1 h-full rounded-none text-xs ${
                  activeLeftPanel === "shapes"
                    ? "bg-gray-800 text-primary border-b-2 border-primary"
                    : "text-secondary hover:text-primary hover:bg-gray-900"
                }`}
              >
                <Shapes className="w-3 h-3 mr-1" />
                Shapes
              </Button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 min-h-0">
              {activeLeftPanel === "layers" && <LayerPanel />}
              {activeLeftPanel === "shapes" && <ShapeLibraryPanel />}
            </div>
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          <div className="flex-1 relative overflow-hidden">
            <Canvas />
          </div>
          <ToolPalette />
        </div>

        {/* Right Panel */}
        {!rightPanelCollapsed && (
          <div className="panel-bg border-l border-panel flex-shrink-0" style={{ width: rightPanelWidth }}>
            <PropertiesPanel />
          </div>
        )}
      </div>
    </div>
  )
}
