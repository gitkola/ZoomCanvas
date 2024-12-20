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
