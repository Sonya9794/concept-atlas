import { useMemo } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  type Edge,
  type NodeMouseHandler,
  type EdgeMouseHandler,
} from '@xyflow/react'
import { palette, type ConceptMap } from '../domain/map'
import {
  ConceptNodeCard,
  type ConceptFlowNode,
} from './ConceptNodeCard'

interface ConceptMapCanvasProps {
  map: ConceptMap
  onSelectNode: (nodeId: string) => void
  onSelectConnection: (connectionId: string) => void
  onClearSelection: () => void
}

const nodeTypes = { concept: ConceptNodeCard }

export function ConceptMapCanvas({
  map,
  onSelectNode,
  onSelectConnection,
  onClearSelection,
}: ConceptMapCanvasProps) {
  const nodes = useMemo<ConceptFlowNode[]>(
    () =>
      map.nodes.map((node) => ({
        id: node.id,
        type: 'concept',
        position: node.position,
        data: { title: node.title, color: node.color },
        ariaLabel: `Concept: ${node.title}`,
      })),
    [map.nodes],
  )

  const edges = useMemo<Edge[]>(
    () =>
      map.connections.map((connection) => {
        const colors = palette[connection.color]
        const sourceTitle = map.nodes.find(
          (node) => node.id === connection.sourceNodeId,
        )?.title
        const targetTitle = map.nodes.find(
          (node) => node.id === connection.targetNodeId,
        )?.title

        return {
          id: connection.id,
          source: connection.sourceNodeId,
          target: connection.targetNodeId,
          label: connection.label || undefined,
          ariaLabel: `Relationship from ${sourceTitle} to ${targetTitle}${
            connection.label ? `: ${connection.label}` : ''
          }`,
          focusable: true,
          markerEnd: connection.directed
            ? {
                type: MarkerType.ArrowClosed,
                color: colors.border,
                width: 20,
                height: 20,
              }
            : undefined,
          style: { stroke: colors.border, strokeWidth: 2 },
          labelStyle: { fill: colors.ink, fontWeight: 700 },
          labelBgStyle: { fill: '#ffffff', fillOpacity: 0.92 },
          labelBgPadding: [6, 4] as [number, number],
          labelBgBorderRadius: 5,
        }
      }),
    [map.connections, map.nodes],
  )

  const handleNodeClick: NodeMouseHandler<ConceptFlowNode> = (_, node) => {
    onSelectNode(node.id)
  }

  const handleEdgeClick: EdgeMouseHandler = (_, edge) => {
    onSelectConnection(edge.id)
  }

  return (
    <ReactFlow<ConceptFlowNode, Edge>
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.35}
      maxZoom={1.8}
      onNodeClick={handleNodeClick}
      onEdgeClick={handleEdgeClick}
      onPaneClick={onClearSelection}
      aria-label="Mathematical concept map"
      colorMode="light"
    >
      <Background variant={BackgroundVariant.Dots} gap={22} size={1.3} />
      <Controls showInteractive={false} position="bottom-left" />
      <MiniMap
        pannable
        zoomable
        position="bottom-right"
        nodeColor={(node) =>
          palette[(node.data?.color as keyof typeof palette) ?? 'slate'].surface
        }
        nodeStrokeColor={(node) =>
          palette[(node.data?.color as keyof typeof palette) ?? 'slate'].border
        }
        maskColor="rgba(241, 245, 249, 0.72)"
      />
    </ReactFlow>
  )
}

