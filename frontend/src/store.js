import { create } from 'zustand'
import { createSession, fetchScenarios, openSocket } from './net'

let socket = null

export const useStore = create((set, get) => ({
  // --- connection -------------------------------------------------
  scenarios: [],
  connected: false,
  connError: null,
  sessionId: null,
  loading: false,

  // --- session ----------------------------------------------------
  state: null,        // authoritative server state
  coachLog: [],       // coach utterances
  report: null,       // competency report (on completion)
  reportOpen: false,
  alarm: 0,           // increments on a critical breach -> screen flash

  // --- local interaction ------------------------------------------
  selectedTool: 'hands',
  selectedWire: null,
  showAffordances: true,
  cameraPreset: 'overview',
  hovered: null,
  toast: null,          // transient local guidance (never sent to the coach)
  _toastTimer: null,

  // ---------------------------------------------------------------
  async boot() {
    try {
      const scenarios = await fetchScenarios()
      set({ scenarios, connError: null })
    } catch (e) {
      set({ connError: 'Cannot reach the coach service. Start the Python backend on :8000.' })
    }
  },

  async start(scenarioId) {
    set({ loading: true, report: null, coachLog: [], state: null, alarm: 0 })
    socket?.close()
    const { sessionId } = await createSession(scenarioId)
    socket = openSocket(sessionId, {
      onOpen: () => set({ connected: true, connError: null }),
      onClose: () => set({ connected: false }),
      onError: () => set({ connected: false, connError: 'WebSocket error.' }),
      onMessage: (msg) => get()._onMessage(msg),
    })
    set({ sessionId, loading: false, selectedTool: 'hands', selectedWire: null })
  },

  _onMessage(msg) {
    const { type, payload } = msg
    if (type === 'state') {
      set({ state: payload })
    } else if (type === 'coach') {
      set((s) => ({ coachLog: [...s.coachLog, payload].slice(-80) }))
      if (payload.severity === 'critical') set((s) => ({ alarm: s.alarm + 1 }))
    } else if (type === 'complete') {
      set({ report: payload, reportOpen: true })
    } else if (type === 'error') {
      console.warn('server error', payload)
    }
  },

  act(action) {
    if (!action) return
    // Local-only sentinel: picking up a tool from the bench.
    if (action.startsWith('__select_tool:')) {
      set({ selectedTool: action.split(':')[1] })
      return
    }
    socket?.send({ type: 'action', action })
  },

  hint() {
    socket?.send({ type: 'hint' })
  },

  reset() {
    socket?.send({ type: 'reset' })
    set({ report: null, reportOpen: false, selectedWire: null, selectedTool: 'hands' })
  },

  setTool: (t) => set({ selectedTool: t }),
  setWire: (w) => set((s) => ({ selectedWire: s.selectedWire === w ? null : w })),
  setCamera: (cameraPreset) => set({ cameraPreset }),
  setHovered: (hovered) => set({ hovered }),
  toggleAffordances: () => set((s) => ({ showAffordances: !s.showAffordances })),
  dismissReport: () => set({ reportOpen: false }),
  openReport: () => set({ reportOpen: true }),

  toast(msg) {
    clearTimeout(get()._toastTimer)
    set({ toast: msg })
    const t = setTimeout(() => set({ toast: null }), 2600)
    set({ _toastTimer: t })
  },
}))

/** Convenience selector: current flags (empty object before first state frame). */
export const useFlags = () => useStore((s) => s.state?.flags ?? {})
export const useScenarioId = () => useStore((s) => s.state?.scenario?.id)
