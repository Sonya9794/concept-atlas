import { useMemo, useState } from 'react'
import { ConceptMapCanvas } from './components/ConceptMapCanvas'
import { sampleMap } from './data/sampleMap'
import { palette, type ConceptConnection } from './domain/map'

type Selection =
  | { kind: 'node'; id: string }
  | { kind: 'connection'; id: string }
  | null

interface ConnectionSummary {
  connection: ConceptConnection
  otherNodeTitle: string
  direction: 'outgoing' | 'incoming' | 'related'
}

interface ConnectionListProps {
  heading: string
  items: ConnectionSummary[]
  onSelect: (connectionId: string) => void
}

function ConnectionList({ heading, items, onSelect }: ConnectionListProps) {
  if (items.length === 0) return null

  return (
    <div className="connection-group">
      <h4>{heading}</h4>
      <ul>
        {items.map(({ connection, otherNodeTitle, direction }) => (
          <li key={connection.id}>
            <button
              className="connection-link"
              type="button"
              onClick={() => onSelect(connection.id)}
            >
              <span className="connection-link__route">
                {direction === 'outgoing'
                  ? `→ ${otherNodeTitle}`
                  : direction === 'incoming'
                    ? `← ${otherNodeTitle}`
                    : `↔ ${otherNodeTitle}`}
              </span>
              <span className="connection-link__label">
                {connection.label || 'Unlabelled relationship'}
              </span>
              <span className="connection-link__description">
                {connection.description}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function App() {
  const [selection, setSelection] = useState<Selection>(null)

  const selectedNode = useMemo(
    () =>
      selection?.kind === 'node'
        ? sampleMap.nodes.find((node) => node.id === selection.id)
        : undefined,
    [selection],
  )

  const selectedConnection = useMemo(
    () =>
      selection?.kind === 'connection'
        ? sampleMap.connections.find(
            (connection) => connection.id === selection.id,
          )
        : undefined,
    [selection],
  )

  const selectedNodeConnections = useMemo<ConnectionSummary[]>(() => {
    if (!selectedNode) return []

    return sampleMap.connections
      .filter(
        (connection) =>
          connection.sourceNodeId === selectedNode.id ||
          connection.targetNodeId === selectedNode.id,
      )
      .map((connection) => {
        const isSource = connection.sourceNodeId === selectedNode.id
        const otherNodeId = isSource
          ? connection.targetNodeId
          : connection.sourceNodeId

        return {
          connection,
          otherNodeTitle:
            sampleMap.nodes.find((node) => node.id === otherNodeId)?.title ??
            'Unknown concept',
          direction: connection.directed
            ? isSource
              ? 'outgoing'
              : 'incoming'
            : 'related',
        }
      })
  }, [selectedNode])

  const selectedCategory = sampleMap.categories.find(
    (category) => category.id === selectedNode?.categoryId,
  )

  const sourceTitle = sampleMap.nodes.find(
    (node) => node.id === selectedConnection?.sourceNodeId,
  )?.title
  const targetTitle = sampleMap.nodes.find(
    (node) => node.id === selectedConnection?.targetNodeId,
  )?.title

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            CA
          </div>
          <div>
            <p className="brand-kicker">Mathematics, connected</p>
            <h1>Concept Atlas</h1>
          </div>
        </div>
        <div className="stage-badge" aria-label="Current build stage">
          Foundation preview
        </div>
      </header>

      <main className="workspace">
        <section className="canvas-region" aria-labelledby="map-heading">
          <div className="canvas-toolbar">
            <div>
              <p className="section-kicker">Sample map</p>
              <h2 id="map-heading">Linear algebra foundations</h2>
            </div>
            <p className="interaction-hint">
              Select a concept or relationship. Drag the background to pan; scroll
              to zoom.
            </p>
          </div>
          <div className="canvas-frame">
            <ConceptMapCanvas
              map={sampleMap}
              onSelectNode={(id) => setSelection({ kind: 'node', id })}
              onSelectConnection={(id) =>
                setSelection({ kind: 'connection', id })
              }
              onClearSelection={() => setSelection(null)}
            />
          </div>
        </section>

        <aside className="details-panel" aria-live="polite">
          {selectedNode ? (
            <>
              <p className="section-kicker">Selected concept</p>
              <h2>{selectedNode.title}</h2>
              <span
                className="color-chip"
                style={{
                  '--chip-color': palette[selectedNode.color].border,
                } as React.CSSProperties}
              >
                {palette[selectedNode.color].name}
              </span>
              <dl className="node-summary">
                <div>
                  <dt>Category</dt>
                  <dd>{selectedCategory?.name ?? 'Uncategorized'}</dd>
                </div>
                <div>
                  <dt>Description</dt>
                  <dd>{selectedNode.description}</dd>
                </div>
              </dl>
              <div className="details-block">
                <h3>Notes</h3>
                <p>{selectedNode.notes}</p>
              </div>
              <div className="details-block connections-block">
                <h3>Connections</h3>
                <ConnectionList
                  heading="Outgoing"
                  items={selectedNodeConnections.filter(
                    (item) => item.direction === 'outgoing',
                  )}
                  onSelect={(id) => setSelection({ kind: 'connection', id })}
                />
                <ConnectionList
                  heading="Incoming"
                  items={selectedNodeConnections.filter(
                    (item) => item.direction === 'incoming',
                  )}
                  onSelect={(id) => setSelection({ kind: 'connection', id })}
                />
                <ConnectionList
                  heading="Related"
                  items={selectedNodeConnections.filter(
                    (item) => item.direction === 'related',
                  )}
                  onSelect={(id) => setSelection({ kind: 'connection', id })}
                />
              </div>
            </>
          ) : selectedConnection ? (
            <>
              <p className="section-kicker">Selected relationship</p>
              <h2>{selectedConnection.label || 'Unlabelled relationship'}</h2>
              <span
                className="color-chip"
                style={{
                  '--chip-color': palette[selectedConnection.color].border,
                } as React.CSSProperties}
              >
                {palette[selectedConnection.color].name}
              </span>
              <dl className="relationship-summary">
                <div>
                  <dt>From</dt>
                  <dd>
                    <button
                      className="relationship-node-link"
                      type="button"
                      onClick={() =>
                        setSelection({
                          kind: 'node',
                          id: selectedConnection.sourceNodeId,
                        })
                      }
                    >
                      {sourceTitle}
                    </button>
                  </dd>
                </div>
                <div>
                  <dt>To</dt>
                  <dd>
                    <button
                      className="relationship-node-link"
                      type="button"
                      onClick={() =>
                        setSelection({
                          kind: 'node',
                          id: selectedConnection.targetNodeId,
                        })
                      }
                    >
                      {targetTitle}
                    </button>
                  </dd>
                </div>
                <div>
                  <dt>Direction</dt>
                  <dd>{selectedConnection.directed ? 'Directed' : 'Undirected'}</dd>
                </div>
                <div>
                  <dt>Description</dt>
                  <dd>{selectedConnection.description}</dd>
                </div>
              </dl>
              <div className="details-block">
                <h3>Notes</h3>
                <p>{selectedConnection.notes}</p>
              </div>
            </>
          ) : (
            <div className="details-empty">
              <div className="details-empty__icon" aria-hidden="true">
                ↗
              </div>
              <p className="section-kicker">Details</p>
              <h2>Choose something on the map</h2>
              <p>
                Select a concept or relationship to inspect its information here.
              </p>
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}

export default App

