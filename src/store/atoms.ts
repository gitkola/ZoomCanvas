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
