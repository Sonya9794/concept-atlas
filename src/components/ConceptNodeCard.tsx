import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { palette, type PaletteColor } from '../domain/map'

export interface ConceptNodeData extends Record<string, unknown> {
  title: string
  description: string
  color: PaletteColor
}

export type ConceptFlowNode = Node<ConceptNodeData, 'concept'>

const connectionPoints = [
  { id: 'top-left', position: Position.Top, style: { left: '35%' } },
  { id: 'top-right', position: Position.Top, style: { left: '65%' } },
  { id: 'right-top', position: Position.Right, style: { top: '35%' } },
  { id: 'right-bottom', position: Position.Right, style: { top: '65%' } },
  { id: 'bottom-left', position: Position.Bottom, style: { left: '35%' } },
  { id: 'bottom-right', position: Position.Bottom, style: { left: '65%' } },
  { id: 'left-top', position: Position.Left, style: { top: '35%' } },
  { id: 'left-bottom', position: Position.Left, style: { top: '65%' } },
] as const

export function ConceptNodeCard({ data, selected }: NodeProps<ConceptFlowNode>) {
  const colors = palette[data.color]

  return (
    <div
      className={`concept-node${selected ? ' concept-node--selected' : ''}`}
      style={{
        '--node-surface': colors.surface,
        '--node-border': colors.border,
        '--node-ink': colors.ink,
      } as React.CSSProperties}
    >
      {connectionPoints.map((point) => (
        <Handle
          key={point.id}
          id={point.id}
          type="source"
          position={point.position}
          style={point.style}
          className="concept-node__handle"
          aria-label={`${point.id.replace('-', ' ')} connection point for ${data.title}`}
        />
      ))}
      <span className="concept-node__eyebrow">Concept</span>
      <strong>{data.title}</strong>
      <span className="concept-node__description">{data.description}</span>
    </div>
  )
}

