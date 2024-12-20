import { ZoomIn, ZoomOut, Maximize } from 'lucide-react'

interface ToolbarProps {
  scale: number
  onZoom: (scale: number) => void
}

export const Toolbar = ({ scale, onZoom }: ToolbarProps) => {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
      <button
        onClick={() => onZoom(scale + 0.1)}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <ZoomIn size={20} />
      </button>
      <button
        onClick={() => onZoom(1)}
        className="px-3 py-1 hover:bg-slate-100 rounded-lg transition-colors font-medium"
      >
        {Math.round(scale * 100)}%
      </button>
      <button
        onClick={() => onZoom(scale - 0.1)}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <ZoomOut size={20} />
      </button>
      <button
        onClick={() => onZoom(1)}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <Maximize size={20} />
      </button>
    </div>
  )
}
