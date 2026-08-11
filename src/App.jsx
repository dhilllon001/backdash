import { useEffect, useMemo, useState } from 'react'
import { Sidebar } from './components/Sidebar.jsx'
import { Topbar } from './components/Topbar.jsx'
import { AssignDrawer } from './components/Drawers.jsx'
import { CreateJobDrawer } from './components/CreateJobDrawer.jsx'
import { ExceptionsPanel } from './components/ExceptionsPanel.jsx'
import { ApproveTimesheetModal, PunchResolveModal, ProofTimesheetModal } from './components/WorkflowModals.jsx'
import { PayrollView } from './views/PayrollView.jsx'
import { PersonDetailView } from './views/PersonDetailView.jsx'
import { JobsView } from './views/JobsView.jsx'
import { ConfigView } from './views/OtherViews.jsx'
import { StyleGuideView } from './views/StyleGuideView.jsx'
import { InventoryView } from './views/InventoryView.jsx'
import { ActivityLogView } from './views/ActivityLogView.jsx'
import { HomeView } from './views/HomeView.jsx'
import { WorkspaceDashboard } from './views/WorkspaceDashboard.jsx'
import { useActivity } from './context/ActivityContext.jsx'
import { EMPLOYEES, EXCEPTIONS } from './data/mock.js'
import { getWorkspace } from './data/workspaces.js'

export default function App() {
  const { logActivity } = useActivity()
  const [workspaceId, setWorkspaceId] = useState(null) // null = home
  const [view, setView] = useState('payroll')
  const [personId, setPersonId] = useState(null)
  const [collapsed, setCollapsed] = useState(false)
  const [location, setLocation] = useState('Brampton')
  const [search, setSearch] = useState('')
  const [employees, setEmployees] = useState(EMPLOYEES)
  const [assignOpen, setAssignOpen] = useState(false)
  const [createJobOpen, setCreateJobOpen] = useState(false)
  const [createJobPerson, setCreateJobPerson] = useState(null)
  const [proofOpen, setProofOpen] = useState(false)
  const [excOpen, setExcOpen] = useState(false)
  const [workflow, setWorkflow] = useState(null) // { type: 'punch'|'approve', employeeId }

  const workspace = getWorkspace(workspaceId)
  const isDecals = workspaceId === 'decals'
  const onHome = () => {
    setWorkspaceId(null)
    setPersonId(null)
    setView('payroll')
    setExcOpen(false)
    setAssignOpen(false)
    setCreateJobOpen(false)
    setProofOpen(false)
    setWorkflow(null)
    setSearch('')
  }

  const openWorkspace = (id) => {
    setWorkspaceId(id)
    setPersonId(null)
    setView('payroll')
    setExcOpen(false)
    setSearch('')
    logActivity({
      area: 'payroll',
      action: 'open_workspace',
      title: `Opened ${getWorkspace(id)?.label || id}`,
      detail: 'Switched workspace from home',
    })
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setAssignOpen(false)
        setCreateJobOpen(false)
        setCreateJobPerson(null)
        setProofOpen(false)
        setExcOpen(false)
        setWorkflow(null)
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
    setExcOpen(false)
    setView(id)
  }

  const openPerson = (id) => {
    setPersonId(id)
    setExcOpen(false)
    setView('person')
  }

  const openAssign = () => {
    setWorkflow(null)
    setExcOpen(false)
    setCreateJobOpen(false)
    setAssignOpen(true)
  }

  const openCreateJob = (person = null) => {
    setAssignOpen(false)
    setWorkflow(null)
    setExcOpen(false)
    setProofOpen(false)
    setCreateJobPerson(person)
    setCreateJobOpen(true)
  }

  const openProofTimesheet = () => {
    if (!emp) return
    setAssignOpen(false)
    setCreateJobOpen(false)
    setCreateJobPerson(null)
    setWorkflow(null)
    setExcOpen(false)
    setProofOpen(true)
  }

  const sharePersonTimesheet = async () => {
    if (!emp) return
    setProofOpen(true)
    logActivity({
      area: 'payroll',
      action: 'share_timesheet',
      title: 'Shared proof of timesheet',
      detail: `${emp.name} · Pay period Jul 7 – 20`,
    })
  }

  const openExceptionsPanel = () => {
    setAssignOpen(false)
    setCreateJobOpen(false)
    setWorkflow(null)
    setExcOpen(true)
  }

  const emp = useMemo(
    () => (personId ? employees.find((e) => e.id === personId) : null),
    [employees, personId],
  )

  const workflowEmp = useMemo(
    () => (workflow ? employees.find((e) => e.id === workflow.employeeId) : null),
    [employees, workflow],
  )

  const openPunch = (employeeId) => {
    const id = employeeId || personId || employees.find((e) => e.status?.tone === 'dang')?.id
    if (!id) return
    setAssignOpen(false)
    setCreateJobOpen(false)
    setExcOpen(false)
    setWorkflow({ type: 'punch', employeeId: id })
  }

  const openApprove = (employeeId) => {
    const id = employeeId || personId
    if (!id) return
    const target = employees.find((e) => e.id === id)
    if (!target) return
    // Blocked / open punch → resolve punch first
    if (target.status?.tone === 'dang' || /punch/i.test(target.status?.label || '')) {
      setWorkflow({ type: 'punch', employeeId: id })
      return
    }
    setAssignOpen(false)
    setCreateJobOpen(false)
    setExcOpen(false)
    setWorkflow({ type: 'approve', employeeId: id })
  }

  const handleExceptionAction = (ex) => {
    setExcOpen(false)
    if (ex.action === 'punch' || ex.action === 'note') {
      const match =
        employees.find((e) => e.name === ex.person) ||
        employees.find((e) => e.status?.tone === 'dang')
      openPunch(match?.id)
    } else if (ex.action === 'job') setView('jobs')
  }

  const savePunchResolve = (payload) => {
    if (!workflowEmp) return
    setEmployees((list) =>
      list.map((e) =>
        e.id === workflowEmp.id
          ? {
              ...e,
              status: { tone: 'info', label: 'Ready' },
              canApprove: true,
            }
          : e,
      ),
    )
    logActivity({
      area: 'punch',
      action: 'punch_out',
      title: 'Resolved missed punch-out',
      detail: `${workflowEmp.name} · ${payload.date} · punch-out ${payload.time} · ${payload.reason}${
        payload.note ? ` · ${payload.note}` : ''
      }`,
      meta: { person: workflowEmp.name, hours: payload.hours },
    })
    setWorkflow(null)
  }

  const saveApprove = (payload) => {
    if (!workflowEmp) return
    const when = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    setEmployees((list) =>
      list.map((e) =>
        e.id === workflowEmp.id
          ? {
              ...e,
              status: { tone: 'ok', label: 'Approved' },
              canApprove: false,
              approvedBy: `A. Singh · ${when}`,
              otApproved: payload.approveOt,
            }
          : e,
      ),
    )
    if (payload.approveOt && workflowEmp.ot) {
      logActivity({
        area: 'payroll',
        action: 'approve_ot',
        title: 'Approved timesheet with OT',
        detail: `${workflowEmp.name} · OT ${workflowEmp.ot} approved · period Jul 7 – 20${
          payload.otNote ? ` · ${payload.otNote}` : ''
        }`,
        meta: { person: workflowEmp.name, ot: workflowEmp.ot },
      })
    } else {
      logActivity({
        area: 'payroll',
        action: 'approve',
        title: 'Approved timesheet',
        detail: `${workflowEmp.name} · ${
          workflowEmp.ot && !payload.approveOt ? `OT ${workflowEmp.ot} excluded` : 'OT none'
        } · period Jul 7 – 20${payload.periodNote ? ` · ${payload.periodNote}` : ''}`,
        meta: { person: workflowEmp.name, otApproved: false },
      })
    }
    setWorkflow(null)
  }

  const blockingCount = EXCEPTIONS.filter((e) => e.status === 'blocking').length
  const needsPunch = emp?.status?.tone === 'dang' || /punch/i.test(emp?.status?.label || '')

  if (!workspaceId) {
    return <HomeView onSelect={openWorkspace} />
  }

  return (
    <div className="app">
      <Sidebar
        view={view}
        onNavigate={navigate}
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        workspaceLabel={workspace?.label || 'Decals'}
        onHome={onHome}
        isDecals={isDecals}
      />
      <div className="main">
        <Topbar
          mode={view === 'person' && isDecals ? 'person' : 'default'}
          showLocation={view === 'payroll'}
          location={location}
          onLocationChange={setLocation}
          search={search}
          onSearchChange={setSearch}
          exceptionCount={isDecals ? blockingCount : workspace?.exceptions || 0}
          onOpenExceptions={isDecals ? openExceptionsPanel : () => {}}
          onCreateJob={
            view === 'person' && isDecals
              ? () => openCreateJob(emp)
              : () => openCreateJob(null)
          }
          onProofTimesheet={openProofTimesheet}
          onShare={sharePersonTimesheet}
          onBack={() => navigate('payroll')}
          personName={emp?.name}
          personLabel={emp?.role?.match(/EMP-\d+/)?.[0] || emp?.id}
          personMeta="Pay period Jul 7 – 20"
          canApprove={!!emp?.canApprove}
          needsPunch={needsPunch}
          onResolvePunch={() => openPunch(emp?.id)}
          onApprove={() => openApprove(emp?.id)}
        />
        <div className="content">
          {view === 'payroll' && isDecals && (
            <PayrollView
              employees={employees}
              location={location}
              search={search}
              onOpenPerson={openPerson}
              onApprove={(id) => openApprove(id)}
              onResolvePunch={(id) => openPunch(id)}
            />
          )}
          {view === 'payroll' && !isDecals && (
            <WorkspaceDashboard workspaceId={workspaceId} />
          )}
          {view === 'person' && isDecals && (
            <PersonDetailView
              personId={personId}
              employee={emp}
              onResolvePunch={() => openPunch(personId)}
            />
          )}
          {view === 'jobs' && isDecals && <JobsView />}
          {view === 'jobs' && !isDecals && (
            <WorkspaceDashboard workspaceId={workspaceId} />
          )}
          {view === 'inventory' && isDecals && <InventoryView />}
          {view === 'activity' && <ActivityLogView />}
          {view === 'styleguide' && isDecals && <StyleGuideView />}
          {view === 'config' && isDecals && <ConfigView />}
        </div>
      </div>

      {assignOpen && (
        <div className="scrim on" onClick={() => setAssignOpen(false)} />
      )}
      {assignOpen ? <AssignDrawer open onClose={() => setAssignOpen(false)} /> : null}
      {createJobOpen ? (
        <CreateJobDrawer
          open
          defaultPerson={createJobPerson}
          onClose={() => {
            setCreateJobOpen(false)
            setCreateJobPerson(null)
          }}
          onCreated={(job) => {
            logActivity({
              area: 'jobs',
              action: 'create_job',
              title: createJobPerson
                ? `Created job for ${createJobPerson.name}`
                : 'Created job',
              detail: `${job?.id || 'New job'}${job?.title ? ` · ${job.title}` : ''}${
                job?.unit ? ` · ${job.unit}` : ''
              }${createJobPerson ? ` · ${createJobPerson.name}` : ''}`,
            })
          }}
        />
      ) : null}

      {proofOpen && emp ? (
        <ProofTimesheetModal
          employee={emp}
          onClose={() => setProofOpen(false)}
          onShare={() => {
            logActivity({
              area: 'payroll',
              action: 'share_timesheet',
              title: 'Shared proof of timesheet',
              detail: `${emp.name} · Pay period Jul 7 – 20`,
            })
          }}
        />
      ) : null}

      {workflow?.type === 'punch' && workflowEmp ? (
        <PunchResolveModal
          employee={workflowEmp}
          onClose={() => setWorkflow(null)}
          onSave={savePunchResolve}
        />
      ) : null}
      {workflow?.type === 'approve' && workflowEmp ? (
        <ApproveTimesheetModal
          employee={workflowEmp}
          onClose={() => setWorkflow(null)}
          onSave={saveApprove}
        />
      ) : null}

      <ExceptionsPanel
        open={excOpen}
        exceptions={EXCEPTIONS.filter((e) => e.status !== 'resolved')}
        onClose={() => setExcOpen(false)}
        onResolve={handleExceptionAction}
      />
    </div>
  )
}
