import { useEffect, useState } from 'react'
import { getBackendStatus, type BackendStatus } from './api'

type State =
  | { kind: 'loading' }
  | { kind: 'ok'; data: BackendStatus }
  | { kind: 'error' }

function App() {
  const [state, setState] = useState<State>({ kind: 'loading' })

  useEffect(() => {
    let active = true
    getBackendStatus().then((result) => {
      if (!active) return
      if (result.ok && result.data) {
        setState({ kind: 'ok', data: result.data })
      } else {
        setState({ kind: 'error' })
      }
    })
    return () => {
      active = false
    }
  }, [])

  function retry() {
    setState({ kind: 'loading' })
    getBackendStatus().then((result) => {
      if (result.ok && result.data) {
        setState({ kind: 'ok', data: result.data })
      } else {
        setState({ kind: 'error' })
      }
    })
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Backoffice</h1>
      <h2>Estado de conexion</h2>

      {state.kind === 'loading' && <p>Comprobando...</p>}
      {state.kind === 'error' && (
        <p style={{ color: '#cc0000' }}>API: no disponible</p>
      )}
      {state.kind === 'ok' && (
        <ul>
          <li>API: {state.data.api}</li>
          <li>Database: {state.data.database}</li>
        </ul>
      )}

      <button type="button" onClick={retry}>
        Re-probar
      </button>
    </main>
  )
}

export default App