import { useEffect } from 'react'
import { useStore } from './store'
import HUD from './components/HUD'
import TaskPanel from './components/TaskPanel'
import CoachPanel from './components/CoachPanel'
import Toolbelt from './components/Toolbelt'
import Scene from './components/Scene'
import StartScreen from './components/StartScreen'
import ReportModal from './components/ReportModal'

export default function App() {
  const boot = useStore((s) => s.boot)
  const sessionId = useStore((s) => s.sessionId)
  const state = useStore((s) => s.state)

  useEffect(() => { boot() }, [boot])

  const active = sessionId && state

  return (
    <div className="app">
      {active && <HUD />}
      {!active && <div className="header"><div className="brand"><span className="mark">TS</span><span>TradeSim<small>AI-coached vocational simulator</small></span></div></div>}

      {!active ? (
        <StartScreen />
      ) : (
        <>
          <div className="main">
            <TaskPanel />
            <div className="col center"><Scene /></div>
            <CoachPanel />
          </div>
          <Toolbelt />
        </>
      )}
      <ReportModal />
    </div>
  )
}
