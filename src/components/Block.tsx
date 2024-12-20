import { useRef, useState } from 'react'
import { Rnd } from 'react-rnd'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface BlockProps {
  id: string
  content: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  scale: number
  onUpdate: (id: string, position: { x: number; y: number }, size: { width: number; height: number }) => void
  onDuplicate?: (id: string) => void
}

export const Block = ({ id, content, position, size, scale, onUpdate, onDuplicate }: BlockProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const blockRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none p-4 focus:outline-none'
      }
    }
  })

  const handleDrag = (_e: any, data: { x: number; y: number }) => {
    const { altKey, shiftKey } = window.event as MouseEvent
    
    if (altKey && !isDragging && onDuplicate) {
      onDuplicate(id)
      return
    }

    let newX = data.x
    let newY = data.y

    if (shiftKey) {
      const gridSize = 10
      newX = Math.round(newX / gridSize) * gridSize
      newY = Math.round(newY / gridSize) * gridSize
    }

    onUpdate(id, { x: newX, y: newY }, size)
  }

  const handleResize = (_e: any, _direction: any, ref: any, _delta: any, position: { x: number; y: number }) => {
    onUpdate(
      id,
      position,
      { width: parseInt(ref.style.width), height: parseInt(ref.style.height) }
    )
  }

  return (
    <Rnd
      position={position}
      size={size}
      scale={scale}
      onDragStart={() => setIsDragging(true)}
      onDragStop={() => setIsDragging(false)}
      onDrag={handleDrag}
      onResize={handleResize}
      bounds="parent"
      className="block-container"
    >
      <div
        ref={blockRef}
        className={`w-full h-full bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <EditorContent editor={editor} />
      </div>
    </Rnd>
  )
}
