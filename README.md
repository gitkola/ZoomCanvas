# ZoomCanvas, by Srcbook

This app was created using [https://srcbook.com](https://srcbook.com).  
Need help or want to join the community? Join our [Discord](https://discord.gg/shDEGBSe2d).

To run the devserver:

```sh
npm install
npm run dev
```

## Prompt 01

Create React Infinite-Canvas or in other words Zoomable User Interface with 100x100 px grid. Add Toolbar with buttons 'Zoom In', 'Zoom Out', '100%' scale.

***

I'll create a zoomable infinite canvas with a 100x100px grid and control buttons. We'll use CSS transforms for zooming and panning functionality. The implementation will include:

1. A main Canvas component with zoom/pan controls  
2. A Toolbar component with zoom controls  
3. A Grid component to render the background grid

The canvas will support both mouse drag for panning and buttons/wheel for zooming.

***

## Prompt 02

Great! Thank you! Please make the next improvements:

1. Zoom in/out on `handleWheel` only while the "Command" is pressed
2. Add lock button to Toolbar for disable zooming
3. Add Theme group button to the upper right corner for light, dark, system modes
4. Use "jotai" library to handle app state like Theme with persistence in `localStorage`
5. Add plus button to Toolbar to create new `Block` on canvas center
6. `Block` is a container for different content like Markdown text editor, attachement Image, attachement File, LinkPreview
7. `Block` must scale with canvas, must be with ability to drag&drop to move it on canvas, resizable by dragging its boundaries, duplicatable by dragging while pressing "Option"
8. Dragging while pressing "Shift" need to apply snap to 10px grid.

***

This plan will:

1. Add command key detection for zoom
2. Add lock button for zoom control
3. Implement theme switcher with jotai
4. Create Block component with drag, resize, and duplicate functionality
5. Implement snap-to-grid feature
6. Update toolbar with new controls
7. Handle block creation and management

Note: For brevity and clarity, I'll implement the initial text block type, with the structure ready for other block types.

### Packages

```sh
npm install jotai @dnd-kit/core @dnd-kit/modifiers react-rnd @tiptap/react @tiptap/starter-kit
```

#### src/store/atoms.ts `+16 -0`

```ts
// src/store/atoms.ts
import { atomWithStorage } from 'jotai/utils'

export type Theme = 'light' | 'dark' | 'system'

export const themeAtom = atomWithStorage<Theme>('theme', 'system')
export const isZoomLockedAtom = atomWithStorage('isZoomLocked', false)

export type Block = {
  id: string
  type: 'text' | 'image' | 'file' | 'link'
  content: string
  position: { x: number; y: number }
  size: { width: number; height: number }
}

export const blocksAtom = atomWithStorage<Block[]>('blocks', [])
```

#### src/components/ThemeSwitcher.tsx `+38 -0`

```ts
// src/components/ThemeSwitcher.tsx
import { Monitor, Moon, Sun } from 'lucide-react'
import { useAtom } from 'jotai'
import { themeAtom, type Theme } from '../store/atoms'
import { useEffect } from 'react'

export const ThemeSwitcher = () => {
  const [theme, setTheme] = useAtom(themeAtom)

  useEffect(() => {
    const isDark = theme === 'dark' || 
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', isDark)
  }, [theme])

  const options: { value: Theme; icon: JSX.Element }[] = [
    { value: 'light', icon: <Sun size={20} /> },
    { value: 'dark', icon: <Moon size={20} /> },
    { value: 'system', icon: <Monitor size={20} /> },
  ]

  return (
    <div className="absolute top-4 right-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg flex p-1 gap-1">
      {options.map(({ value, icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`p-2 rounded-lg transition-colors ${
            theme === value 
              ? 'bg-slate-100 dark:bg-slate-700' 
              : 'hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}
```

#### src/components/Block.tsx `+80 -0`

```ts
// src/components/Block.tsx
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
```

#### src/components/Toolbar.tsx `+30 -7`

```ts
// src/components/Toolbar.tsx
import { ZoomIn, ZoomOut, Maximize, Lock, Unlock, Plus } from 'lucide-react'
import { useAtom } from 'jotai'
import { isZoomLockedAtom } from '../store/atoms'

interface ToolbarProps {
  scale: number
  onZoom: (scale: number) => void
  onAddBlock: () => void
}

export const Toolbar = ({ scale, onZoom, onAddBlock }: ToolbarProps) => {
  const [isZoomLocked, setIsZoomLocked] = useAtom(isZoomLockedAtom)

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white dark:bg-slate-800 rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
      <button
        onClick={() => onZoom(scale + 0.1)}
        disabled={isZoomLocked}
        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
      >
        <ZoomIn size={20} />
      </button>
      <button
        onClick={() => onZoom(1)}
        disabled={isZoomLocked}
        className="px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium disabled:opacity-50"
      >
        {Math.round(scale * 100)}%
      </button>
      <button
        onClick={() => onZoom(scale - 0.1)}
        disabled={isZoomLocked}
        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
      >
        <ZoomOut size={20} />
      </button>
      <button
        onClick={() => onZoom(1)}
        disabled={isZoomLocked}
        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
      >
        <Maximize size={20} />
      </button>
      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
      <button
        onClick={() => setIsZoomLocked(!isZoomLocked)}
        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
      >
        {isZoomLocked ? <Lock size={20} /> : <Unlock size={20} />}
      </button>
      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
      <button
        onClick={onAddBlock}
        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
      >
        <Plus size={20} />
      </button>
    </div>
  )
}
```

#### src/components/Canvas.tsx `+77 -8`

```ts
// src/components/Canvas.tsx
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAtom } from 'jotai'
import { Grid } from './Grid'
import { Toolbar } from './Toolbar'
import { ThemeSwitcher } from './ThemeSwitcher'
import { Block } from './Block'
import { blocksAtom, isZoomLockedAtom } from '../store/atoms'
import { nanoid } from 'nanoid'

export const Canvas = () => {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [blocks, setBlocks] = useAtom(blocksAtom)
  const [isZoomLocked] = useAtom(isZoomLockedAtom)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || e.target === containerRef.current?.firstChild) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  const handleWheel = (e: React.WheelEvent) => {
    if (isZoomLocked) return
    
    // Check if Command (Meta) key is pressed
    if (!e.metaKey) return
    
    e.preventDefault()
    const delta = e.deltaY
    setScale(prev => Math.min(Math.max(0.1, prev - delta * 0.001), 5))
  }

  const handleZoom = (newScale: number) => {
    if (!isZoomLocked) {
      setScale(newScale)
    }
  }

  const handleAddBlock = () => {
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    const centerX = (-position.x + containerRect.width / 2) / scale
    const centerY = (-position.y + containerRect.height / 2) / scale

    const newBlock = {
      id: nanoid(),
      type: 'text' as const,
      content: 'New block',
      position: { x: centerX - 150, y: centerY - 100 },
      size: { width: 300, height: 200 }
    }

    setBlocks(prev => [...prev, newBlock])
  }

  const handleBlockUpdate = (id: string, newPosition: { x: number; y: number }, newSize: { width: number; height: number }) => {
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, position: newPosition, size: newSize } : block
    ))
  }

  const handleBlockDuplicate = (id: string) => {
    const blockToDuplicate = blocks.find(block => block.id === id)
    if (!blockToDuplicate) return

    const newBlock = {
      ...blockToDuplicate,
      id: nanoid(),
      position: {
        x: blockToDuplicate.position.x + 20,
        y: blockToDuplicate.position.y + 20
      }
    }

    setBlocks(prev => [...prev, newBlock])
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-900">
      <Toolbar scale={scale} onZoom={handleZoom} onAddBlock={handleAddBlock} />
      <ThemeSwitcher />
      <div
        ref={containerRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
          }}
          className="relative transition-transform duration-75"
        >
          <Grid />
          {blocks.map(block => (
            <Block
              key={block.id}
              id={block.id}
              content={block.content}
              position={block.position}
              size={block.size}
              scale={scale}
              onUpdate={handleBlockUpdate}
              onDuplicate={handleBlockDuplicate}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
```

#### src/index.css `+19 -0`

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}

.block-container {
  touch-action: none;
}

/* Hide resize handles when not hovering */
.block-container .react-resizable-handle {
  opacity: 0;
  transition: opacity 0.2s;
}

.block-container:hover .react-resizable-handle {
  opacity: 1;
}

/* Dark mode support */
.dark {
  color-scheme: dark;
}
```

#### src/tailwind.config.js `+12 -0`

```js
// src/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}
```

***

## Prompt 03

### Please fix next:

1. `ThemeSwitcher` doesn't react on clicks - no active button changed, no theme mode switching. Expected on click `ThemeSwitcher` not active button the theme mode switch accordingly with persistence in `localStorage` and the clicked button became active
2. The `React.WheelEvent` works properly while pressing and holding "Command" key but doesn't work at all in other cases. By default on `React.WheelEvent` it needs to scroll canvas vertically, while pressing and holding "Shift" key it needs to scroll canvas horizontally
3. Dragging and Panning canvas doesn't work at all but it is expected to move canvas accordingly on Dragging and Panning
4. `Block` needs to be moved on canvas accordingly its Dragging and Panning but its locked at the top of viewport and moves only horizontally

***

### The plan addresses several issues:

1. Fix theme switching by properly initializing and persisting theme state
2. Implement proper canvas scrolling behavior with both default and Shift key modes
3. Fix canvas dragging/panning by correcting mouse event handling
4. Fix Block positioning issues by adjusting the transform and position calculations

#### src/components/ThemeSwitcher.tsx `+22 -4`

```tsx
import { Monitor, Moon, Sun } from 'lucide-react'
import { useAtom } from 'jotai'
import { themeAtom, type Theme } from '../store/atoms'
import { useEffect } from 'react'

export const ThemeSwitcher = () => {
  const [theme, setTheme] = useAtom(themeAtom)

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = () => {
      if (theme === 'system') {
        document.documentElement.classList.toggle('dark', mediaQuery.matches)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // Apply theme changes
  useEffect(() => {
    const isDark = 
      theme === 'dark' || 
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    
    document.documentElement.classList.toggle('dark', isDark)
  }, [theme])

  const options: { value: Theme; icon: JSX.Element }[] = [
    { value: 'light', icon: <Sun size={20} /> },
    { value: 'dark', icon: <Moon size={20} /> },
    { value: 'system', icon: <Monitor size={20} /> },
  ]

  return (
    <div className="absolute top-4 right-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg flex p-1 gap-1 z-50">
      {options.map(({ value, icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`p-2 rounded-lg transition-colors ${
            theme === value 
              ? 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400' 
              : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
          }`}
          aria-label={`Switch to ${value} theme`}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}
```

#### src/components/Canvas.tsx `+22 -9`

```tsx
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAtom } from 'jotai'
import { Grid } from './Grid'
import { Toolbar } from './Toolbar'
import { ThemeSwitcher } from './ThemeSwitcher'
import { Block } from './Block'
import { blocksAtom, isZoomLockedAtom } from '../store/atoms'
import { nanoid } from 'nanoid'

export const Canvas = () => {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [blocks, setBlocks] = useAtom(blocksAtom)
  const [isZoomLocked] = useAtom(isZoomLockedAtom)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only initiate drag if clicking on the container or grid
    if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains('grid-background')) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
      e.preventDefault()
    }
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()

    if (e.metaKey && !isZoomLocked) {
      // Zoom behavior when Command/Meta is pressed
      const delta = e.deltaY
      setScale(prev => Math.min(Math.max(0.1, prev - delta * 0.001), 5))
    } else {
      // Regular scrolling behavior
      const scrollSpeed = 1
      const deltaX = e.shiftKey ? e.deltaY : e.deltaX
      const deltaY = e.shiftKey ? 0 : e.deltaY

      setPosition(prev => ({
        x: prev.x - deltaX * scrollSpeed,
        y: prev.y - deltaY * scrollSpeed
      }))
    }
  }

  const handleZoom = (newScale: number) => {
    if (!isZoomLocked) {
      setScale(newScale)
    }
  }

  const handleAddBlock = () => {
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    // Calculate center position in canvas coordinates
    const centerX = (-position.x + containerRect.width / 2) / scale
    const centerY = (-position.y + containerRect.height / 2) / scale

    const newBlock = {
      id: nanoid(),
      type: 'text' as const,
      content: 'New block',
      position: { x: centerX - 150, y: centerY - 100 },
      size: { width: 300, height: 200 }
    }

    setBlocks(prev => [...prev, newBlock])
  }

  const handleBlockUpdate = (id: string, newPosition: { x: number; y: number }, newSize: { width: number; height: number }) => {
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, position: newPosition, size: newSize } : block
    ))
  }

  const handleBlockDuplicate = (id: string) => {
    const blockToDuplicate = blocks.find(block => block.id === id)
    if (!blockToDuplicate) return

    const newBlock = {
      ...blockToDuplicate,
      id: nanoid(),
      position: {
        x: blockToDuplicate.position.x + 20,
        y: blockToDuplicate.position.y + 20
      }
    }

    setBlocks(prev => [...prev, newBlock])
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-900">
      <Toolbar scale={scale} onZoom={handleZoom} onAddBlock={handleAddBlock} />
      <ThemeSwitcher />
      <div
        ref={containerRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            willChange: 'transform',
          }}
          className="absolute inset-0 transition-transform duration-75"
        >
          <Grid />
          {blocks.map(block => (
            <Block
              key={block.id}
              id={block.id}
              content={block.content}
              position={block.position}
              size={block.size}
              scale={scale}
              onUpdate={handleBlockUpdate}
              onDuplicate={handleBlockDuplicate}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
```

#### src/components/Block.tsx `+2 -1`

```tsx
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
      className="block-container absolute"
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
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
```

#### src/components/Grid.tsx `+3 -1`

```tsx
export const Grid = () => {
  // Create a large enough area for the grid (50x50 cells)
  const gridSize = 5000
  const cellSize = 100

  return (
    <div
      className="absolute grid-background"
      style={{
        width: `${gridSize}px`,
        height: `${gridSize}px`,
        top: `-${gridSize / 2}px`,
        left: `-${gridSize / 2}px`,
        backgroundImage: `
          linear-gradient(to right, #ddd 1px, transparent 1px),
          linear-gradient(to bottom, #ddd 1px, transparent 1px)
        `,
        backgroundSize: `${cellSize}px ${cellSize}px`,
      }}
    />
  )
}
```

***

