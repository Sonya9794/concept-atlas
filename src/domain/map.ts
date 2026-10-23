export const MAP_FORMAT_VERSION = 1 as const

export const palette = {
  blue: {
    name: 'Blue',
    surface: '#dbeafe',
    border: '#2563eb',
    ink: '#172554',
  },
  violet: {
    name: 'Violet',
    surface: '#ede9fe',
    border: '#7c3aed',
    ink: '#2e1065',
  },
  green: {
    name: 'Green',
    surface: '#dcfce7',
    border: '#16a34a',
    ink: '#052e16',
  },
  amber: {
    name: 'Amber',
    surface: '#fef3c7',
    border: '#d97706',
    ink: '#451a03',
  },
  rose: {
    name: 'Rose',
    surface: '#ffe4e6',
    border: '#e11d48',
    ink: '#4c0519',
  },
  slate: {
    name: 'Slate',
    surface: '#e2e8f0',
    border: '#475569',
    ink: '#0f172a',
  },
} as const

export type PaletteColor = keyof typeof palette

export interface CanvasPosition {
  x: number
  y: number
}

export interface ConceptNode {
  id: string
  title: string
  description: string
  notes: string
  position: CanvasPosition
  color: PaletteColor
  categoryId: string
}

export interface ConceptCategory {
  id: string
  name: string
}

export interface ConceptConnection {
  id: string
  sourceNodeId: string
  targetNodeId: string
  label: string
  description: string
  notes: string
  color: PaletteColor
  directed: boolean
}

export interface MapViewport {
  x: number
  y: number
  zoom: number
}

export interface ConceptMap {
  version: typeof MAP_FORMAT_VERSION
  categories: ConceptCategory[]
  nodes: ConceptNode[]
  connections: ConceptConnection[]
  viewport?: MapViewport
}

