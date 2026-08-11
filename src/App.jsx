import { useEffect, useState } from 'react'
import { Sidebar } from './components/Sidebar.jsx'
import { Topbar } from './components/Topbar.jsx'
import { AssignDrawer, PunchDrawer } from './components/Drawers.jsx'
import { PayrollView } from './views/PayrollView.jsx'
import { ExceptionsView } from './views/ExceptionsView.jsx'
import { PersonDetailView } from './views/PersonDetailView.jsx'
import { JobsView, AssignView, UnitsView, ConfigView } from './views/OtherViews.jsx'
import { EXCEPTIONS } from './data/mock.js'

export default function App() {
  const [view, setView] = useState('payroll')
  const [personId, setPersonId] = useState(null)
  const [collapsed, setCollapsed] = useState(false)
  const [location, setLocation] = useState('all')
  const [search, setSearch] = useState('')
  const [assignOpen, setAssignOpen] = useState(false)
  const [punchOpen, setPunchOpen] = useState(false)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
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

  const navigate = (id) => {
    setPersonId(null)
    setView(id)
  }

  const openPerson = (id) => {
    setPersonId(id)
    setView('person')
  }

  const openAssign = () => {
    setPunchOpen(false)
    setAssignOpen(true)
  }

  const openPunch = () => {
    setAssignOpen(false)
    setPunchOpen(true)
  }

  const openExceptions = () => {
    setPersonId(null)
    setView('exceptions')
  }

  const handleExceptionAction = (ex) => {
    if (ex.action === 'punch' || ex.action === 'note') openPunch()
    else if (ex.action === 'job') setView('jobs')
  }

  const blockingCount = EXCEPTIONS.filter((e) => e.status === 'blocking').length

  return (
    <div className="app">
      <Sidebar
        view={view}
        onNavigate={navigate}
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
      />
      <div className="main">
        <Topbar
          location={location}
          onLocationChange={setLocation}
          search={search}
          onSearchChange={setSearch}
          exceptionCount={blockingCount}
          onOpenExceptions={openExceptions}
          onAssign={openAssign}
        />
        <div className="content">
          {view === 'payroll' && (
            <PayrollView
              location={location}
              search={search}
              onOpenPerson={openPerson}
              onOpenExceptions={openExceptions}
            />
          )}
          {view === 'person' && (
            <PersonDetailView
              personId={personId}
              onBack={() => navigate('payroll')}
              onResolvePunch={openPunch}
              onOpenExceptions={openExceptions}
            />
          )}
          {view === 'exceptions' && (
            <ExceptionsView
              location={location}
              search={search}
              onAction={handleExceptionAction}
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
