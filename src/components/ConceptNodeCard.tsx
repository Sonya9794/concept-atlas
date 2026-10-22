import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { palette, type PaletteColor } from '../domain/map'

export interface ConceptNodeData extends Record<string, unknown> {
  title: string
  color: PaletteColor
}

export type ConceptFlowNode = Node<ConceptNodeData, 'concept'>

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
      <Handle
        type="target"
        position={Position.Left}
        className="concept-node__handle"
        aria-label={`Incoming relationships for ${data.title}`}
      />
      <span className="concept-node__eyebrow">Concept</span>
      <strong>{data.title}</strong>
      <Handle
        type="source"
        position={Position.Right}
        className="concept-node__handle"
        aria-label={`Outgoing relationships for ${data.title}`}
      />
    </div>
  )
}

