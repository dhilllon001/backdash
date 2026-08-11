import { useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import {
  SEC_YARDS,
  SEC_SHIFTS,
  SEC_TASKS,
  SECURITY_PEOPLE,
  SEC_YARD_SHIFT_TASKS,
  getSecTask,
} from '../../data/security.js'

function defaultRoster(yardName) {
  return SECURITY_PEOPLE.filter((p) => p.yards.includes(yardName)).slice(0, 3)
}

function defaultTaskAssignees(yardId, shiftId, roster) {
  const taskIds = SEC_YARD_SHIFT_TASKS[yardId]?.[shiftId] || []
  return taskIds.map((tid, i) => ({
    taskId: tid,
    personId: roster[i % roster.length]?.id || '',
  }))
}

export function SecurityAssignmentsView() {
  const [yardId, setYardId] = useState('brampton')
  const [date, setDate] = useState('2026-07-21')
  const [shiftId, setShiftId] = useState('morning')
  const [saved, setSaved] = useState(false)

  const yard = SEC_YARDS.find((y) => y.id === yardId)
  const roster = useMemo(
    () => defaultRoster(yard?.name || 'Brampton'),
    [yard?.name],
  )
  const [people, setPeople] = useState(() => defaultRoster('Brampton'))
  const [taskAssignees, setTaskAssignees] = useState(() =>
    defaultTaskAssignees('brampton', 'morning', defaultRoster('Brampton')),
  )

  const available = SECURITY_PEOPLE.filter(
    (p) => p.yards.includes(yard?.name) && !people.some((x) => x.id === p.id),
  )

  const loadYardShift = (yId, sId) => {
    const y = SEC_YARDS.find((yr) => yr.id === yId)
    const r = defaultRoster(y?.name || 'Brampton')
    setPeople(r)
    setTaskAssignees(defaultTaskAssignees(yId, sId, r))
    setSaved(false)
  }

  const selectYard = (id) => {
    setYardId(id)
    loadYardShift(id, shiftId)
  }

  const selectShift = (id) => {
    setShiftId(id)
    loadYardShift(yardId, id)
  }

  const addPerson = (personId) => {
    const p = SECURITY_PEOPLE.find((x) => x.id === personId)
    if (p) setPeople((list) => [...list, p])
  }

  const removePerson = (personId) => {
    setPeople((list) => list.filter((p) => p.id !== personId))
    setTaskAssignees((list) =>
      list.map((a) => (a.personId === personId ? { ...a, personId: '' } : a)),
    )
  }

  const setAssignee = (taskId, personId) => {
    setTaskAssignees((list) =>
      list.map((a) => (a.taskId === taskId ? { ...a, personId } : a)),
    )
    setSaved(false)
  }

  const resetDraft = () => loadYardShift(yardId, shiftId)

  const taskRows = taskAssignees.map((a) => ({
    ...a,
    task: getSecTask(a.taskId),
  }))

  return (
    <section className="sass page">
      <header className="sass-head">
        <div>
          <h1>Assignments</h1>
          <p className="muted">Roster guards onto shifts and assign security tasks.</p>
        </div>
        <div className="sass-head-actions">
          <label className="sass-date">
            <span>Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <button type="button" className="btn btn-sm" onClick={resetDraft}>
            Reset
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => setSaved(true)}
          >
            Save draft
          </button>
          {saved ? <span className="sass-saved">Draft saved</span> : null}
        </div>
      </header>

      <div className="sass-layout">
        <aside className="sass-yards card">
          <h3>Yards</h3>
          {SEC_YARDS.map((y) => (
            <button
              key={y.id}
              type="button"
              className={`sass-yard${yardId === y.id ? ' on' : ''}`}
              onClick={() => selectYard(y.id)}
            >
              <b>{y.name}</b>
              <span className="num">{y.code}</span>
            </button>
          ))}
        </aside>

        <div className="sass-main">
          <div className="sass-shift-tabs">
            {SEC_SHIFTS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`sass-shift-tab${shiftId === s.id ? ' on' : ''}`}
                onClick={() => selectShift(s.id)}
              >
                {s.label}
                <small className="num">
                  {s.start} – {s.end}
                </small>
              </button>
            ))}
          </div>

          <div className="sass-card card">
            <div className="sass-section">
              <div className="sass-section-head">
                <h3>People on this shift</h3>
                {available.length > 0 ? (
                  <div className="sass-add-wrap">
                    <select
                      className="sass-add-select"
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) {
                          addPerson(e.target.value)
                          e.target.value = ''
                        }
                      }}
                    >
                      <option value="">Add from roster…</option>
                      {available.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <Plus size={14} />
                  </div>
                ) : null}
              </div>
              <div className="sass-people">
                {people.map((p) => (
                  <div key={p.id} className="sass-person">
                    <span
                      className="pav"
                      style={{ background: p.bg, color: p.color }}
                    >
                      {p.initials}
                    </span>
                    <span>
                      <b>{p.name}</b>
                      <span className="muted">{p.role}</span>
                    </span>
                    <button
                      type="button"
                      className="sass-remove"
                      aria-label={`Remove ${p.name}`}
                      onClick={() => removePerson(p.id)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {people.length === 0 ? (
                  <p className="muted sass-empty">No guards assigned to this shift.</p>
                ) : null}
              </div>
            </div>

            <div className="sass-section">
              <h3>Shift tasks</h3>
              <ul className="sass-tasks">
                {taskRows.map(({ taskId, task, personId }) => (
                  <li key={taskId} className="sass-task-row">
                    <div className="sass-task-info">
                      <b>{task?.name || taskId}</b>
                      <span className="muted num">{task?.duration} min</span>
                    </div>
                    <select
                      className="sass-assignee"
                      value={personId}
                      onChange={(e) => setAssignee(taskId, e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {people.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
