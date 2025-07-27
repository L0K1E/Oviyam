"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEditor } from "../editor-context"
import { Eye, EyeOff, Lock, Unlock, MoreHorizontal, Trash2, Copy, GripVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function LayerPanel() {
  const { state, selectObjects, updateObject, deleteSelected, reorderObjects, addObject } = useEditor()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragCounter = useRef(0)

  const handleLayerClick = (id: string, e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey) {
      const newSelection = state.selectedIds.includes(id)
        ? state.selectedIds.filter((selectedId) => selectedId !== id)
        : [...state.selectedIds, id]
      selectObjects(newSelection)
    } else {
      selectObjects([id])
    }
  }

  const handleDuplicate = (object: any) => {
    addObject(object.type, object.x + 20, object.y + 20, {
      ...object,
      name: `${object.name} Copy`,
    })
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    dragCounter.current = 0
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", "")
  }

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    dragCounter.current++
    setDragOverIndex(index)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setDragOverIndex(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    dragCounter.current = 0
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      reorderObjects(draggedIndex, dropIndex)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const getLayerIcon = (type: string) => {
    switch (type) {
      case "rectangle":
        return "▢"
      case "ellipse":
        return "○"
      case "line":
        return "—"
      case "text":
        return "T"
      case "image":
        return "🖼"
      default:
        return "?"
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-7 border-b border-panel flex items-center px-2 text-xs text-secondary">
        <span>Layers</span>
        <div className="flex-1" />
        <span className="text-muted">{state.objects.length}</span>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto">
        {state.objects.length === 0 ? (
          <div className="p-4 text-center text-muted text-xs">No layers</div>
        ) : (
          <div className="p-1">
            {[...state.objects].reverse().map((object, reverseIndex) => {
              const index = state.objects.length - 1 - reverseIndex
              const isSelected = state.selectedIds.includes(object.id)
              const isDragging = draggedIndex === index
              const isDragOver = dragOverIndex === index

              return (
                <div
                  key={object.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`layer-row group flex items-center gap-2 px-2 py-1 text-xs cursor-pointer transition-all duration-150 ${
                    isSelected ? "bg-gray-800 primary-border border-l-2" : "hover:bg-gray-900"
                  } ${isDragging ? "opacity-50" : ""} ${isDragOver ? "bg-gray-700" : ""}`}
                  onClick={(e) => handleLayerClick(object.id, e)}
                >
                  {/* Drag Handle */}
                  <div className="drag-handle">
                    <GripVertical className="w-3 h-3 text-muted" />
                  </div>

                  {/* Icon */}
                  <div className="w-4 h-4 flex items-center justify-center text-muted">{getLayerIcon(object.type)}</div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    {editingId === object.id ? (
                      <Input
                        value={object.name}
                        onChange={(e) => updateObject(object.id, { name: e.target.value })}
                        onBlur={() => setEditingId(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setEditingId(null)
                          e.stopPropagation() // Prevent keyboard shortcuts while editing
                        }}
                        className="themed-input h-4 text-xs p-1"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="text-primary truncate" onDoubleClick={() => setEditingId(object.id)}>
                        {object.name}
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center opacity-0 gap-2 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-4 h-4 p-0 text-muted hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation()
                        updateObject(object.id, { visible: !object.visible })
                      }}
                    >
                      {object.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-4 h-4 p-0 text-muted hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation()
                        updateObject(object.id, { locked: !object.locked })
                      }}
                    >
                      {object.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-4 h-4 p-0 text-muted hover:text-primary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-900 border-gray-700 text-xs">
                        <DropdownMenuItem
                          onClick={() => handleDuplicate(object)}
                          className="text-secondary hover:text-primary hover:bg-gray-800 text-xs cursor-pointer"
                        >
                          <Copy className="w-3 h-3 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            selectObjects([object.id])
                            deleteSelected()
                          }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 text-xs cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
