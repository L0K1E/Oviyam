"use client"

import type React from "react"
import { createContext, useContext, useReducer, useCallback } from "react"
import { nanoid } from "nanoid"

export interface CanvasObject {
  id: string
  type: "rectangle" | "ellipse" | "line" | "text" | "image" | "polygon" | "path"
  name: string
  x: number
  y: number
  width?: number
  height?: number
  rotation: number
  scaleX: number
  scaleY: number
  opacity: number
  visible: boolean
  locked: boolean
  fill?: string
  stroke?: string
  strokeWidth?: number
  borderRadius?: number
  text?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: "normal" | "bold"
  fontStyle?: "normal" | "italic"
  textDecoration?: "none" | "underline"
  textTransform?: "none" | "uppercase" | "lowercase"
  textAlign?: "left" | "center" | "right" | "justify"
  letterSpacing?: number
  lineHeight?: number
  src?: string
  points?: number[]
  path?: string
  shadow?: {
    color: string
    blur: number
    offsetX: number
    offsetY: number
  }
}

export interface EditorState {
  objects: CanvasObject[]
  selectedIds: string[]
  activeTool: string
  zoom: number
  panX: number
  panY: number
  canvasWidth: number
  canvasHeight: number
  showGrid: boolean
  snapToGrid: boolean
  history: CanvasObject[][]
  historyIndex: number
  activeFillColor: string
  activeStrokeColor: string
  activeStrokeWidth: number
}

type EditorAction =
  | { type: "ADD_OBJECT"; object: CanvasObject }
  | { type: "UPDATE_OBJECT"; id: string; updates: Partial<CanvasObject> }
  | { type: "DELETE_OBJECTS"; ids: string[] }
  | { type: "SELECT_OBJECTS"; ids: string[] }
  | { type: "REORDER_OBJECTS"; fromIndex: number; toIndex: number }
  | { type: "SET_TOOL"; tool: string }
  | { type: "SET_ZOOM"; zoom: number }
  | { type: "SET_PAN"; panX: number; panY: number }
  | { type: "TOGGLE_GRID" }
  | { type: "TOGGLE_SNAP" }
  | { type: "SET_ACTIVE_FILL_COLOR"; color: string }
  | { type: "SET_ACTIVE_STROKE_COLOR"; color: string }
  | { type: "SET_ACTIVE_STROKE_WIDTH"; width: number }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SAVE_STATE" }

const initialState: EditorState = {
  objects: [],
  selectedIds: [],
  activeTool: "select",
  zoom: 1,
  panX: 0,
  panY: 0,
  canvasWidth: 800,
  canvasHeight: 600,
  showGrid: true,
  snapToGrid: false,
  history: [[]],
  historyIndex: 0,
  activeFillColor: "#ff6b35",
  activeStrokeColor: "#ffffff",
  activeStrokeWidth: 2,
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "ADD_OBJECT":
      const newObjects = [...state.objects, action.object]
      return {
        ...state,
        objects: newObjects,
        selectedIds: [action.object.id],
        history: [...state.history.slice(0, state.historyIndex + 1), newObjects],
        historyIndex: state.historyIndex + 1,
      }

    case "UPDATE_OBJECT":
      const updatedObjects = state.objects.map((obj) => (obj.id === action.id ? { ...obj, ...action.updates } : obj))
      return {
        ...state,
        objects: updatedObjects,
      }

    case "DELETE_OBJECTS":
      const filteredObjects = state.objects.filter((obj) => !action.ids.includes(obj.id))
      return {
        ...state,
        objects: filteredObjects,
        selectedIds: state.selectedIds.filter((id) => !action.ids.includes(id)),
        history: [...state.history.slice(0, state.historyIndex + 1), filteredObjects],
        historyIndex: state.historyIndex + 1,
      }

    case "SELECT_OBJECTS":
      return {
        ...state,
        selectedIds: action.ids,
      }

    case "REORDER_OBJECTS":
      const reorderedObjects = [...state.objects]
      const [movedObject] = reorderedObjects.splice(action.fromIndex, 1)
      reorderedObjects.splice(action.toIndex, 0, movedObject)
      return {
        ...state,
        objects: reorderedObjects,
      }

    case "SET_TOOL":
      return {
        ...state,
        activeTool: action.tool,
      }

    case "SET_ZOOM":
      return {
        ...state,
        zoom: Math.max(0.1, Math.min(5, action.zoom)),
      }

    case "SET_PAN":
      return {
        ...state,
        panX: action.panX,
        panY: action.panY,
      }

    case "TOGGLE_GRID":
      return {
        ...state,
        showGrid: !state.showGrid,
      }

    case "TOGGLE_SNAP":
      return {
        ...state,
        snapToGrid: !state.snapToGrid,
      }

    case "SET_ACTIVE_FILL_COLOR":
      return {
        ...state,
        activeFillColor: action.color,
      }

    case "SET_ACTIVE_STROKE_COLOR":
      return {
        ...state,
        activeStrokeColor: action.color,
      }

    case "SET_ACTIVE_STROKE_WIDTH":
      return {
        ...state,
        activeStrokeWidth: action.width,
      }

    case "UNDO":
      if (state.historyIndex > 0) {
        return {
          ...state,
          objects: state.history[state.historyIndex - 1],
          historyIndex: state.historyIndex - 1,
          selectedIds: [],
        }
      }
      return state

    case "REDO":
      if (state.historyIndex < state.history.length - 1) {
        return {
          ...state,
          objects: state.history[state.historyIndex + 1],
          historyIndex: state.historyIndex + 1,
          selectedIds: [],
        }
      }
      return state

    case "SAVE_STATE":
      return {
        ...state,
        history: [...state.history.slice(0, state.historyIndex + 1), state.objects],
        historyIndex: state.historyIndex + 1,
      }

    default:
      return state
  }
}

interface EditorContextType {
  state: EditorState
  dispatch: React.Dispatch<EditorAction>
  addObject: (type: CanvasObject["type"], x: number, y: number, options?: Partial<CanvasObject>) => void
  updateObject: (id: string, updates: Partial<CanvasObject>) => void
  deleteSelected: () => void
  selectObjects: (ids: string[]) => void
  reorderObjects: (fromIndex: number, toIndex: number) => void
  setTool: (tool: string) => void
  undo: () => void
  redo: () => void
}

const EditorContext = createContext<EditorContextType | null>(null)

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState)

  const addObject = useCallback(
    (type: CanvasObject["type"], x: number, y: number, options: Partial<CanvasObject> = {}) => {
      const object: CanvasObject = {
        id: nanoid(),
        type,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${state.objects.length + 1}`,
        x,
        y,
        width: type === "line" ? 100 : options.width || 100,
        height: type === "line" ? 0 : options.height || 100,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        visible: true,
        locked: false,
        fill: type === "text" ? state.activeFillColor : type === "line" ? undefined : state.activeFillColor,
        stroke: state.activeStrokeColor,
        strokeWidth: type === "text" ? 0 : state.activeStrokeWidth,
        borderRadius: 0,
        text: type === "text" ? "Text" : undefined,
        fontSize: type === "text" ? 24 : undefined,
        fontFamily: type === "text" ? "Inter" : undefined,
        fontWeight: "normal",
        fontStyle: "normal",
        textDecoration: "none",
        textTransform: "none",
        textAlign: "left",
        letterSpacing: 0,
        lineHeight: 1.2,
        ...options,
      }
      dispatch({ type: "ADD_OBJECT", object })
    },
    [state.objects.length, state.activeFillColor, state.activeStrokeColor, state.activeStrokeWidth],
  )

  const updateObject = useCallback((id: string, updates: Partial<CanvasObject>) => {
    dispatch({ type: "UPDATE_OBJECT", id, updates })
  }, [])

  const deleteSelected = useCallback(() => {
    if (state.selectedIds.length > 0) {
      dispatch({ type: "DELETE_OBJECTS", ids: state.selectedIds })
    }
  }, [state.selectedIds])

  const selectObjects = useCallback((ids: string[]) => {
    dispatch({ type: "SELECT_OBJECTS", ids })
  }, [])

  const reorderObjects = useCallback((fromIndex: number, toIndex: number) => {
    dispatch({ type: "REORDER_OBJECTS", fromIndex, toIndex })
  }, [])

  const setTool = useCallback((tool: string) => {
    dispatch({ type: "SET_TOOL", tool })
  }, [])

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" })
  }, [])

  const redo = useCallback(() => {
    dispatch({ type: "REDO" })
  }, [])

  const value = {
    state,
    dispatch,
    addObject,
    updateObject,
    deleteSelected,
    selectObjects,
    reorderObjects,
    setTool,
    undo,
    redo,
  }

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error("useEditor must be used within EditorProvider")
  }
  return context
}
