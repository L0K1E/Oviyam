"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useEditor } from "../editor-context"
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Download,
  Upload,
  Star,
  Triangle,
  Hexagon,
  Diamond,
  Search,
} from "lucide-react"
import { CustomInput } from "../ui/custom-input"

interface PresetShape {
  id: string
  name: string
  category: string
  icon: React.ComponentType<{ className?: string }>
  type: "rectangle" | "ellipse" | "line" | "triangle" | "diamond" | "hexagon" | "star"
}

interface SavedShape {
  id: string
  name: string
  thumbnail: string
  objects: any[]
  createdAt: number
}

const presetShapes: PresetShape[] = [
  // Basic Shapes
  {
    id: "rect",
    name: "Rectangle",
    category: "Basic",
    icon: () => <div className="w-4 h-3 border border-current" />,
    type: "rectangle",
  },
  {
    id: "circle",
    name: "Circle",
    category: "Basic",
    icon: () => <div className="w-4 h-4 border border-current rounded-full" />,
    type: "ellipse",
  },
  {
    id: "triangle",
    name: "Triangle",
    category: "Basic",
    icon: Triangle,
    type: "triangle",
  },
  {
    id: "diamond",
    name: "Diamond",
    category: "Basic",
    icon: Diamond,
    type: "diamond",
  },
  {
    id: "hexagon",
    name: "Hexagon",
    category: "Basic",
    icon: Hexagon,
    type: "hexagon",
  },

  // Icons
  {
    id: "star",
    name: "Star",
    category: "Icons",
    icon: Star,
    type: "star",
  },
]

export function ShapeLibraryPanel() {
  const { addObject, state, setTool } = useEditor()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(["Basic", "Icons", "Saved"]))
  const [savedShapes, setSavedShapes] = useState<SavedShape[]>([])
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [shapeName, setShapeName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categories = ["All", ...Array.from(new Set(presetShapes.map((shape) => shape.category))), "Saved"]

  const filteredShapes = presetShapes.filter((shape) => {
    const matchesSearch = shape.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || shape.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredSavedShapes = savedShapes.filter(
    (shape) =>
      shape.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "All" || selectedCategory === "Saved"),
  )

  const toggleCategory = (category: string) => {
    const newOpenCategories = new Set(openCategories)
    if (newOpenCategories.has(category)) {
      newOpenCategories.delete(category)
    } else {
      newOpenCategories.add(category)
    }
    setOpenCategories(newOpenCategories)
  }

  const addPresetShape = (shape: PresetShape) => {
    const centerX = 400 // Canvas center
    const centerY = 300
    const size = 100

    // Set the tool to the shape type first
    setTool(shape.type)

    // Add the shape with current colors
    const baseProps = {
      width: size,
      height: size,
      fill: shape.type === "line" ? undefined : state.activeFillColor,
      stroke: state.activeStrokeColor,
      strokeWidth: state.activeStrokeWidth,
    }

    switch (shape.type) {
      case "rectangle":
        addObject("rectangle", centerX - size / 2, centerY - size / 2, baseProps)
        break
      case "ellipse":
        addObject("ellipse", centerX - size / 2, centerY - size / 2, baseProps)
        break
      case "triangle":
        addObject("polygon", centerX - size / 2, centerY - size / 2, {
          ...baseProps,
          points: [size / 2, 0, 0, size, size, size],
        })
        break
      case "diamond":
        addObject("polygon", centerX - size / 2, centerY - size / 2, {
          ...baseProps,
          points: [size / 2, 0, size, size / 2, size / 2, size, 0, size / 2],
        })
        break
      case "hexagon":
        addObject("polygon", centerX - size / 2, centerY - size / 2, {
          ...baseProps,
          points: [
            size * 0.25,
            0,
            size * 0.75,
            0,
            size,
            size * 0.43,
            size * 0.75,
            size,
            size * 0.25,
            size,
            0,
            size * 0.43,
          ],
        })
        break
      case "star":
        addObject("polygon", centerX - size / 2, centerY - size / 2, {
          ...baseProps,
          points: [
            size * 0.5,
            0,
            size * 0.61,
            size * 0.35,
            size * 0.98,
            size * 0.35,
            size * 0.68,
            size * 0.57,
            size * 0.79,
            size * 0.91,
            size * 0.5,
            size * 0.7,
            size * 0.21,
            size * 0.91,
            size * 0.32,
            size * 0.57,
            size * 0.02,
            size * 0.35,
            size * 0.39,
            size * 0.35,
          ],
        })
        break
    }

    // Switch back to select tool
    setTool("select")
  }

  const saveCurrentSelection = () => {
    if (state.selectedIds.length === 0) return

    const selectedObjects = state.objects.filter((obj) => state.selectedIds.includes(obj.id))

    // Generate a simple thumbnail (placeholder)
    const thumbnail =
      "data:image/svg+xml;base64," +
      btoa(`
      <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" fill="#ff6b35" rx="4"/>
        <text x="24" y="28" textAnchor="middle" fill="white" fontSize="12">${shapeName.charAt(0).toUpperCase()}</text>
      </svg>
    `)

    const newShape: SavedShape = {
      id: Date.now().toString(),
      name: shapeName || `Shape ${savedShapes.length + 1}`,
      thumbnail,
      objects: selectedObjects,
      createdAt: Date.now(),
    }

    setSavedShapes([...savedShapes, newShape])
    setSaveDialogOpen(false)
    setShapeName("")
  }

  const addSavedShape = (savedShape: SavedShape) => {
    const centerX = 400
    const centerY = 300

    // Calculate bounds of the saved shape
    let minX = Number.POSITIVE_INFINITY
    let minY = Number.POSITIVE_INFINITY
    savedShape.objects.forEach((obj) => {
      minX = Math.min(minX, obj.x)
      minY = Math.min(minY, obj.y)
    })

    // Add each object with offset to center
    savedShape.objects.forEach((obj) => {
      addObject(obj.type, centerX + (obj.x - minX), centerY + (obj.y - minY), {
        ...obj,
        id: undefined, // Let addObject generate new ID
      })
    })
  }

  const deleteSavedShape = (shapeId: string) => {
    setSavedShapes(savedShapes.filter((shape) => shape.id !== shapeId))
  }

  const exportShapes = () => {
    const dataStr = JSON.stringify(savedShapes, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "shapes-library.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  const importShapes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedShapes = JSON.parse(e.target?.result as string)
        setSavedShapes([...savedShapes, ...importedShapes])
      } catch (error) {
        console.error("Failed to import shapes:", error)
      }
    }
    reader.readAsText(file)
  }

  const CategorySection = ({ category, children }: { category: string; children: React.ReactNode }) => (
    <div className="border-b border-panel">
      <Button
        variant="ghost"
        onClick={() => toggleCategory(category)}
        className="w-full justify-between h-6 px-2 text-xs text-secondary hover:text-primary hover:bg-gray-900"
      >
        <span>{category}</span>
        {openCategories.has(category) ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </Button>
      {openCategories.has(category) && <div className="p-2">{children}</div>}
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-7 border-b border-panel flex items-center px-2 text-xs text-secondary">
        <span>Shape Library</span>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSaveDialogOpen(true)}
          disabled={state.selectedIds.length === 0}
          className="w-4 h-4 p-0 text-muted hover:text-primary"
          title="Save Selection as Shape"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-panel">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted" />
          <CustomInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search shapes..."
            className="pl-6 w-full"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="p-2 border-b border-panel">
        <div className="flex flex-wrap gap-1">
          {categories.map((category) => (
            <Button
              key={category}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={`h-5 px-2 text-xs ${
                selectedCategory === category
                  ? "primary-bg text-white"
                  : "text-muted hover:text-primary hover:bg-gray-800"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Shape Categories */}
      <div className="flex-1 overflow-y-auto">
        {/* Preset Shapes by Category */}
        {categories.slice(1, -1).map((category) => {
          const categoryShapes = filteredShapes.filter((shape) => shape.category === category)
          if (categoryShapes.length === 0 && selectedCategory !== "All") return null

          return (
            <CategorySection key={category} category={category}>
              <div className="grid grid-cols-3 gap-1">
                {categoryShapes.map((shape) => (
                  <Button
                    key={shape.id}
                    variant="ghost"
                    onClick={() => addPresetShape(shape)}
                    className="h-12 p-1 flex flex-col items-center justify-center text-muted hover:text-primary hover:bg-gray-800 group"
                    title={shape.name}
                  >
                    <div className="w-6 h-6 flex items-center justify-center mb-1">
                      <shape.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs truncate w-full text-center">{shape.name}</span>
                  </Button>
                ))}
              </div>
            </CategorySection>
          )
        })}

        {/* Saved Shapes */}
        {(selectedCategory === "All" || selectedCategory === "Saved") && (
          <CategorySection category="Saved">
            <div className="space-y-2">
              {/* Import/Export Controls */}
              <div className="flex gap-1 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exportShapes}
                  disabled={savedShapes.length === 0}
                  className="flex-1 h-5 text-xs text-muted hover:text-primary hover:bg-gray-800"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 h-5 text-xs text-muted hover:text-primary hover:bg-gray-800"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Import
                </Button>
                <input ref={fileInputRef} type="file" accept=".json" onChange={importShapes} className="hidden" />
              </div>

              {/* Saved Shapes Grid */}
              {filteredSavedShapes.length === 0 ? (
                <div className="text-center text-muted text-xs py-4">
                  {savedShapes.length === 0 ? "No saved shapes" : "No shapes match search"}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1">
                  {filteredSavedShapes.map((shape) => (
                    <div key={shape.id} className="group relative">
                      <Button
                        variant="ghost"
                        onClick={() => addSavedShape(shape)}
                        className="w-full h-16 p-1 flex flex-col items-center justify-center text-muted hover:text-primary hover:bg-gray-800"
                        title={shape.name}
                      >
                        <div className="w-8 h-8 mb-1 flex items-center justify-center">
                          <img
                            src={shape.thumbnail || "/placeholder.svg"}
                            alt={shape.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-xs truncate w-full text-center">{shape.name}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSavedShape(shape.id)}
                        className="absolute top-0 right-0 w-4 h-4 p-0 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-2 h-2" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CategorySection>
        )}
      </div>

      {/* Save Dialog */}
      {saveDialogOpen && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 p-4 rounded-md min-w-64">
            <h3 className="text-sm font-medium mb-3">Save Shape</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted block mb-1">Shape Name</label>
                <CustomInput
                  value={shapeName}
                  onChange={setShapeName}
                  placeholder="Enter shape name..."
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSaveDialogOpen(false)}
                  className="flex-1 h-6 text-xs text-secondary hover:text-primary hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={saveCurrentSelection}
                  disabled={!shapeName.trim()}
                  className="flex-1 h-6 text-xs primary-bg text-white hover:bg-orange-600"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
