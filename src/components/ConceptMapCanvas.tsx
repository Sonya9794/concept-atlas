import { useMemo, useState, type WheelEvent as ReactWheelEvent } from 'react'
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  ControlButton,
  Controls,
  MarkerType,
  MiniMap,
  Panel,
  ReactFlow,
  type Edge,
  type NodeMouseHandler,
  type EdgeMouseHandler,
  type ReactFlowInstance,
} from '@xyflow/react'
import {
  palette,
  type ConceptMap,
  type ConceptNode,
} from '../domain/map'
import {
  ConceptNodeCard,
  type ConceptFlowNode,
} from './ConceptNodeCard'
import { CategoryBubbles } from './CategoryBubbles'

interface ConceptMapCanvasProps {
  map: ConceptMap
  onSelectNode: (nodeId: string) => void
  onSelectConnection: (connectionId: string) => void
  onClearSelection: () => void
}

const nodeTypes = { concept: ConceptNodeCard }
const MIN_ZOOM = 0.35
const MAX_ZOOM = 1.8
const CONTROL_ZOOM_FACTOR = 1.35
const WHEEL_ZOOM_SENSITIVITY = 0.003

interface EdgeHandles {
  sourceHandle: string
  targetHandle: string
}

function getFacingHandles(
  source: ConceptNode,
  target: ConceptNode,
): EdgeHandles {
  const horizontalDistance = target.position.x - source.position.x
  const verticalDistance = target.position.y - source.position.y

  if (Math.abs(horizontalDistance) >= Math.abs(verticalDistance)) {
    if (horizontalDistance >= 0) {
      return verticalDistance >= 0
        ? { sourceHandle: 'right-bottom', targetHandle: 'left-top' }
        : { sourceHandle: 'right-top', targetHandle: 'left-bottom' }
    }

    return verticalDistance >= 0
      ? { sourceHandle: 'left-bottom', targetHandle: 'right-top' }
      : { sourceHandle: 'left-top', targetHandle: 'right-bottom' }
  }

  if (verticalDistance >= 0) {
    return horizontalDistance >= 0
      ? { sourceHandle: 'bottom-right', targetHandle: 'top-left' }
      : { sourceHandle: 'bottom-left', targetHandle: 'top-right' }
  }

  return horizontalDistance >= 0
    ? { sourceHandle: 'top-right', targetHandle: 'bottom-left' }
    : { sourceHandle: 'top-left', targetHandle: 'bottom-right' }
}

export function ConceptMapCanvas({
  map,
  onSelectNode,
  onSelectConnection,
  onClearSelection,
}: ConceptMapCanvasProps) {
  const [zoom, setZoom] = useState(1)
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance<
    ConceptFlowNode,
    Edge
  > | null>(null)
  const [isMiniMapVisible, setIsMiniMapVisible] = useState(true)
  const labelsVisible = zoom >= 0.55
  const labelFontSize = zoom < 1 ? 12 + (1 - zoom) * 5 : 12

  const nodes = useMemo<ConceptFlowNode[]>(
    () =>
      map.nodes.map((node) => ({
        id: node.id,
        type: 'concept',
        position: node.position,
        data: {
          title: node.title,
          description: node.description,
          color: node.color,
        },
        ariaLabel: `Concept: ${node.title}`,
      })),
    [map.nodes],
  )

  const edges = useMemo<Edge[]>(
    () =>
      map.connections.map((connection) => {
        const colors = palette[connection.color]
        const sourceNode = map.nodes.find(
          (node) => node.id === connection.sourceNodeId,
        )
        const targetNode = map.nodes.find(
          (node) => node.id === connection.targetNodeId,
        )
        const handles =
          sourceNode && targetNode
            ? getFacingHandles(sourceNode, targetNode)
            : undefined

        return {
          id: connection.id,
          source: connection.sourceNodeId,
          target: connection.targetNodeId,
          sourceHandle: handles?.sourceHandle,
          targetHandle: handles?.targetHandle,
          type: 'default',
          pathOptions: { curvature: 0.32 },
          label:
            labelsVisible && connection.label ? connection.label : undefined,
          ariaLabel: `Relationship from ${sourceNode?.title} to ${targetNode?.title}${
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
          labelStyle: {
            fill: colors.ink,
            fontSize: labelFontSize,
            fontWeight: 700,
          },
          labelBgStyle: { fill: '#ffffff', fillOpacity: 0.92 },
          labelBgPadding: [6, 4] as [number, number],
          labelBgBorderRadius: 5,
        }
      }),
    [labelFontSize, labelsVisible, map.connections, map.nodes],
  )

  const handleNodeClick: NodeMouseHandler<ConceptFlowNode> = (_, node) => {
    onSelectNode(node.id)
  }

  const handleEdgeClick: EdgeMouseHandler = (_, edge) => {
    onSelectConnection(edge.id)
  }

  const handleWheelZoom = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (!flowInstance) return

    const target = event.target as HTMLElement
    if (
      target.closest(
        '.react-flow__controls, .react-flow__minimap, .minimap-toggle',
      )
    ) {
      return
    }

    event.preventDefault()
    const bounds = event.currentTarget.getBoundingClientRect()
    const pointer = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    }
    const viewport = flowInstance.getViewport()
    const nextZoom = Math.min(
      MAX_ZOOM,
      Math.max(
        MIN_ZOOM,
        viewport.zoom * Math.exp(-event.deltaY * WHEEL_ZOOM_SENSITIVITY),
      ),
    )
    const flowPoint = {
      x: (pointer.x - viewport.x) / viewport.zoom,
      y: (pointer.y - viewport.y) / viewport.zoom,
    }

    void flowInstance.setViewport({
      x: pointer.x - flowPoint.x * nextZoom,
      y: pointer.y - flowPoint.y * nextZoom,
      zoom: nextZoom,
    })
  }

  return (
    <div className="map-canvas" onWheelCapture={handleWheelZoom}>
      <ReactFlow<ConceptFlowNode, Edge>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        connectionMode={ConnectionMode.Loose}
        elementsSelectable
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        zoomOnScroll={false}
        onInit={setFlowInstance}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onPaneClick={onClearSelection}
        onMove={(_, viewport) => setZoom(viewport.zoom)}
        aria-label="Mathematical concept map"
        colorMode="light"
      >
        <CategoryBubbles
          categories={map.categories}
          nodes={map.nodes}
          connections={map.connections}
          visible={zoom <= 0.5}
        />
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.3} />
        <Controls
          showZoom={false}
          showInteractive={false}
          position="bottom-left"
        >
          <ControlButton
            onClick={() =>
              void flowInstance?.zoomTo(
                Math.min(MAX_ZOOM, zoom * CONTROL_ZOOM_FACTOR),
                { duration: 160 },
              )
            }
            title="Zoom in"
            aria-label="Zoom in"
          >
            <span aria-hidden="true">+</span>
          </ControlButton>
          <ControlButton
            onClick={() =>
              void flowInstance?.zoomTo(
                Math.max(MIN_ZOOM, zoom / CONTROL_ZOOM_FACTOR),
                { duration: 160 },
              )
            }
            title="Zoom out"
            aria-label="Zoom out"
          >
            <span aria-hidden="true">−</span>
          </ControlButton>
        </Controls>
        {isMiniMapVisible ? (
          <MiniMap
            id="concept-map-minimap"
            pannable
            zoomable
            position="bottom-right"
            nodeColor={(node) =>
              palette[(node.data?.color as keyof typeof palette) ?? 'slate']
                .surface
            }
            nodeStrokeColor={(node) =>
              palette[(node.data?.color as keyof typeof palette) ?? 'slate']
                .border
            }
            maskColor="rgba(241, 245, 249, 0.72)"
          />
        ) : null}
        <Panel
          position="bottom-right"
          className={`minimap-toggle ${
            isMiniMapVisible ? 'minimap-toggle--open' : ''
          }`}
        >
          <button
            type="button"
            onClick={() => setIsMiniMapVisible((visible) => !visible)}
            aria-expanded={isMiniMapVisible}
            aria-controls="concept-map-minimap"
          >
            <span aria-hidden="true">{isMiniMapVisible ? '−' : '+'}</span>{' '}
            Overview
          </button>
        </Panel>
      </ReactFlow>
    </div>
  )
}

