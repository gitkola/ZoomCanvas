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
