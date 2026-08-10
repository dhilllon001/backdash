import { useEffect, useState } from 'react'
import { Sidebar } from './components/Sidebar.jsx'
import { Topbar } from './components/Topbar.jsx'
import { ExceptionsPanel } from './components/ExceptionsPanel.jsx'
import { AssignDrawer, PunchDrawer } from './components/Drawers.jsx'
import { PayrollView } from './views/PayrollView.jsx'
import { JobsView, AssignView, UnitsView, ConfigView } from './views/OtherViews.jsx'
import { EXCEPTIONS } from './data/mock.js'

export default function App() {
  const [view, setView] = useState('payroll')
  const [collapsed, setCollapsed] = useState(false)
  const [location, setLocation] = useState('all')
  const [search, setSearch] = useState('')
  const [exceptionsOpen, setExceptionsOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [punchOpen, setPunchOpen] = useState(false)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setExceptionsOpen(false)
        setAssignOpen(false)
        setPunchOpen(false)
      }
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)
      ) {
        e.preventDefault()
        document.querySelector('.top-search input')?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const openAssign = () => {
    setExceptionsOpen(false)
    setPunchOpen(false)
    setAssignOpen(true)
  }

  const openPunch = () => {
    setExceptionsOpen(false)
    setAssignOpen(false)
    setPunchOpen(true)
  }

  const openExceptions = () => {
    setAssignOpen(false)
    setPunchOpen(false)
    setExceptionsOpen(true)
  }

  const handleExceptionResolve = (ex) => {
    if (ex.action === 'punch') {
      setExceptionsOpen(false)
      setPunchOpen(true)
    } else if (ex.action === 'job') {
      setExceptionsOpen(false)
      setView('jobs')
    }
  }

  return (
    <div className="app">
      <Sidebar
        view={view}
        onNavigate={setView}
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
      />
      <div className="main">
        <Topbar
          location={location}
          onLocationChange={setLocation}
          search={search}
          onSearchChange={setSearch}
          exceptionCount={EXCEPTIONS.length}
          exceptionsOpen={exceptionsOpen}
          onToggleExceptions={() =>
            exceptionsOpen ? setExceptionsOpen(false) : openExceptions()
          }
          onAssign={openAssign}
        />
        <div className="content">
          {view === 'payroll' && (
            <PayrollView
              location={location}
              search={search}
              onResolvePunch={openPunch}
              onOpenExceptions={openExceptions}
            />
          )}
          {view === 'jobs' && (
            <JobsView location={location} search={search} onAssign={openAssign} />
          )}
          {view === 'assign' && (
            <AssignView location={location} search={search} onAssign={openAssign} />
          )}
          {view === 'units' && <UnitsView location={location} search={search} />}
          {view === 'config' && <ConfigView />}
        </div>
      </div>

      <ExceptionsPanel
        open={exceptionsOpen}
        exceptions={EXCEPTIONS}
        onClose={() => setExceptionsOpen(false)}
        onResolve={handleExceptionResolve}
      />
      {(assignOpen || punchOpen) && (
        <div
          className={`scrim${assignOpen || punchOpen ? ' on' : ''}`}
          onClick={() => {
            setAssignOpen(false)
            setPunchOpen(false)
          }}
        />
      )}
      <AssignDrawer open={assignOpen} onClose={() => setAssignOpen(false)} />
      <PunchDrawer open={punchOpen} onClose={() => setPunchOpen(false)} />
    </div>
  )
}
