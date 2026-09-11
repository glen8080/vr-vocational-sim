/** WebSocket transport + REST bootstrap for the AI coach service. */

const API_BASE = import.meta.env.VITE_API_ORIGIN || ''

export async function fetchScenarios() {
  const r = await fetch(`${API_BASE}/api/scenarios`)
  if (!r.ok) throw new Error(`scenarios: HTTP ${r.status}`)
  return (await r.json()).scenarios
}

export async function createSession(scenarioId) {
  const r = await fetch(`${API_BASE}/api/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario: scenarioId }),
  })
  if (!r.ok) throw new Error(`session: HTTP ${r.status}`)
  return await r.json()
}

export function openSocket(sessionId, handlers) {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws'
  const base = API_BASE
    ? `${API_BASE.replace(/^http/, 'ws')}`
    : `${proto}://${location.host}`
  const ws = new WebSocket(`${base}/ws/${sessionId}`)
  let closedByUs = false

  ws.onopen = () => handlers.onOpen?.()
  ws.onmessage = (evt) => {
    try {
      handlers.onMessage?.(JSON.parse(evt.data))
    } catch (e) {
      console.warn('bad frame', e)
    }
  }
  ws.onerror = () => handlers.onError?.(new Error('websocket error'))
  ws.onclose = () => {
    if (!closedByUs) handlers.onClose?.()
  }

  return {
    send: (obj) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj))
    },
    close: () => {
      closedByUs = true
      ws.close()
    },
  }
}
