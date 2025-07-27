"use client";

import { Button } from "@/components/ui/button";
import { useEditor } from "../editor-context";
import {
  MousePointer2,
  Square,
  Circle,
  Minus,
  Type,
  ImageIcon,
  Hand,
  ZoomIn,
} from "lucide-react";
import { ColorSwatch } from "../ui/color-swatch";

const tools = [
  { id: "select", icon: MousePointer2, label: "Select", shortcut: "V" },
  { id: "rectangle", icon: Square, label: "Rectangle", shortcut: "R" },
  { id: "ellipse", icon: Circle, label: "Ellipse", shortcut: "E" },
  { id: "line", icon: Minus, label: "Line", shortcut: "L" },
  { id: "text", icon: Type, label: "Text", shortcut: "T" },
  { id: "image", icon: ImageIcon, label: "Image", shortcut: "I" },
  { id: "hand", icon: Hand, label: "Hand", shortcut: "H" },
  { id: "zoom", icon: ZoomIn, label: "Zoom", shortcut: "Z" },
];

export function ToolPalette() {
  const { state, setTool, dispatch } = useEditor();

  return (
    <div className="absolute top-4 left-4 z-50">
      <div className="flex items-center gap-1 panel-bg border border-panel p-2 rounded-lg shadow-xl backdrop-blur-md drop-shadow-2xl">
        {/* Tool Buttons */}
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant="ghost"
            size="sm"
            onClick={() => setTool(tool.id)}
            title={`${tool.label} (${tool.shortcut})`}
            className={`w-8 h-8 p-0 ${
              state.activeTool === tool.id
                ? "primary-bg text-white"
                : "text-secondary hover:text-primary hover:bg-gray-800"
            }`}
          >
            <tool.icon className="w-4 h-4" />
          </Button>
        ))}

        {/* Separator */}
        <div className="w-px h-6 bg-gray-700 mx-1" />
        <div className="flex items-center gap-1 px-1">
          <ColorSwatch
            color={state.activeFillColor}
            onChange={(color) =>
              dispatch({ type: "SET_ACTIVE_FILL_COLOR", color })
            }
            title="Fill Color"
            size={24}
            className="shadow rounded-sm"
          />
          <ColorSwatch
            color={state.activeStrokeColor}
            onChange={(color) =>
              dispatch({ type: "SET_ACTIVE_STROKE_COLOR", color })
            }
            title="Stroke Color"
            size={24}
            isStroke
            className="shadow rounded-sm"
          />
        </div>
      </div>
    </div>
  );
}
