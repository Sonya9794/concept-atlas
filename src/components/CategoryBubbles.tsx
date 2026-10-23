import { useMemo, useState, type MouseEvent } from 'react'
import { ViewportPortal } from '@xyflow/react'
import type {
  ConceptCategory,
  ConceptConnection,
  ConceptNode,
} from '../domain/map'

interface Point {
  x: number
  y: number
}

interface CategoryShape {
  category: ConceptCategory
  path: string
  connectedCategoryNames: string[]
}

interface CategoryBubblesProps {
  categories: ConceptCategory[]
  nodes: ConceptNode[]
  connections: ConceptConnection[]
  visible: boolean
}

const NODE_WIDTH = 210
const NODE_HEIGHT = 92
const HORIZONTAL_PADDING = 72
const VERTICAL_PADDING = 58

function cross(origin: Point, first: Point, second: Point) {
  return (
    (first.x - origin.x) * (second.y - origin.y) -
    (first.y - origin.y) * (second.x - origin.x)
  )
}

function convexHull(points: Point[]) {
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y)

  if (sorted.length <= 2) return sorted

  const lower: Point[] = []
  for (const point of sorted) {
    while (
      lower.length >= 2 &&
      cross(lower.at(-2)!, lower.at(-1)!, point) <= 0
    ) {
      lower.pop()
    }
    lower.push(point)
  }

  const upper: Point[] = []
  for (const point of [...sorted].reverse()) {
    while (
      upper.length >= 2 &&
      cross(upper.at(-2)!, upper.at(-1)!, point) <= 0
    ) {
      upper.pop()
    }
    upper.push(point)
  }

  lower.pop()
  upper.pop()
  return [...lower, ...upper]
}

function roundedHullPath(nodes: ConceptNode[]) {
  const perimeterPoints = nodes.flatMap((node) => {
    const left = node.position.x - HORIZONTAL_PADDING
    const right = node.position.x + NODE_WIDTH + HORIZONTAL_PADDING
    const top = node.position.y - VERTICAL_PADDING
    const bottom = node.position.y + NODE_HEIGHT + VERTICAL_PADDING

    return [
      { x: left, y: top },
      { x: right, y: top },
      { x: right, y: bottom },
      { x: left, y: bottom },
    ]
  })

  const hull = convexHull(perimeterPoints)
  if (hull.length < 3) return ''

  const midpoint = (a: Point, b: Point): Point => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  })
  const start = midpoint(hull.at(-1)!, hull[0])
  const commands = [`M ${start.x} ${start.y}`]

  hull.forEach((point, index) => {
    const next = hull[(index + 1) % hull.length]
    const end = midpoint(point, next)
    commands.push(`Q ${point.x} ${point.y} ${end.x} ${end.y}`)
  })

  commands.push('Z')
  return commands.join(' ')
}

export function CategoryBubbles({
  categories,
  nodes,
  connections,
  visible,
}: CategoryBubblesProps) {
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(
    null,
  )
  const [pointer, setPointer] = useState({ x: 0, y: 0 })

  const shapes = useMemo<CategoryShape[]>(() => {
    const nodeById = new Map(nodes.map((node) => [node.id, node]))
    const categoryById = new Map(
      categories.map((category) => [category.id, category]),
    )

    return categories.flatMap((category) => {
      const categoryNodes = nodes.filter(
        (node) => node.categoryId === category.id,
      )
      if (categoryNodes.length === 0) return []

      const connectedCategoryIds = new Set<string>()
      connections.forEach((connection) => {
        const sourceCategoryId = nodeById.get(connection.sourceNodeId)?.categoryId
        const targetCategoryId = nodeById.get(connection.targetNodeId)?.categoryId

        if (
          sourceCategoryId === category.id &&
          targetCategoryId &&
          targetCategoryId !== category.id
        ) {
          connectedCategoryIds.add(targetCategoryId)
        }
        if (
          targetCategoryId === category.id &&
          sourceCategoryId &&
          sourceCategoryId !== category.id
        ) {
          connectedCategoryIds.add(sourceCategoryId)
        }
      })

      return [
        {
          category,
          path: roundedHullPath(categoryNodes),
          connectedCategoryNames: [...connectedCategoryIds]
            .map((id) => categoryById.get(id)?.name)
            .filter((name): name is string => Boolean(name))
            .sort(),
        },
      ]
    })
  }, [categories, connections, nodes])

  const hoveredShape = shapes.find(
    (shape) => shape.category.id === hoveredCategoryId,
  )

  const updatePointer = (event: MouseEvent<SVGPathElement>) => {
    setPointer({ x: event.clientX + 14, y: event.clientY + 14 })
  }

  if (!visible) return null

  return (
    <>
      <ViewportPortal>
        <svg
          className="category-bubble-layer"
          width="1800"
          height="1200"
          aria-label="Concept categories"
        >
          {shapes.map((shape) => (
            <g key={shape.category.id}>
              <path
                d={shape.path}
                className={`category-bubble${
                  hoveredCategoryId === shape.category.id
                    ? ' category-bubble--hovered'
                    : ''
                }`}
              />
              <path
                d={shape.path}
                className="category-bubble-hitbox"
                onMouseEnter={(event) => {
                  setHoveredCategoryId(shape.category.id)
                  updatePointer(event)
                }}
                onMouseMove={updatePointer}
                onMouseLeave={() => setHoveredCategoryId(null)}
                aria-label={`${shape.category.name} category`}
              />
            </g>
          ))}
        </svg>
      </ViewportPortal>

      {hoveredShape ? (
        <div
          className="category-tooltip"
          style={{ left: pointer.x, top: pointer.y }}
          role="tooltip"
        >
          <strong>{hoveredShape.category.name}</strong>
          <span>
            Connected to:{' '}
            {hoveredShape.connectedCategoryNames.length > 0
              ? hoveredShape.connectedCategoryNames.join(', ')
              : 'No other categories'}
          </span>
        </div>
      ) : null}
    </>
  )
}
