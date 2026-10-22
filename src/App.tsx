import { useMemo, useState } from 'react'
import { ConceptMapCanvas } from './components/ConceptMapCanvas'
import { sampleMap } from './data/sampleMap'
import { palette } from './domain/map'

type Selection =
  | { kind: 'node'; id: string }
  | { kind: 'connection'; id: string }
  | null

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
              <div className="details-block">
                <h3>Notes</h3>
                <p>{selectedNode.notes}</p>
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
                  <dd>{sourceTitle}</dd>
                </div>
                <div>
                  <dt>To</dt>
                  <dd>{targetTitle}</dd>
                </div>
                <div>
                  <dt>Direction</dt>
                  <dd>{selectedConnection.directed ? 'Directed' : 'Undirected'}</dd>
                </div>
              </dl>
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

