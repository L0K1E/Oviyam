"use client"

import { EditorProvider } from "@/components/editor/editor-context"
import { EditorLayout } from "@/components/editor/editor-layout"

export default function Home() {
  return (
    <EditorProvider>
      <EditorLayout />
    </EditorProvider>
  )
}
