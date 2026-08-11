import { useMemo, useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import {
  SEC_YARDS,
  SEC_TASKS,
  SEC_SHIFTS,
  SEC_YARD_SHIFT_TASKS,
  getSecTask,
} from '../../data/security.js'

export function SecurityConfigView() {
  const [yardId, setYardId] = useState('brampton')
  const [shiftId, setShiftId] = useState('morning')
  const [assignments, setAssignments] = useState(SEC_YARD_SHIFT_TASKS)

  const yard = SEC_YARDS.find((y) => y.id === yardId)
  const taskIds = assignments[yardId]?.[shiftId] || []
  const assignedTasks = taskIds.map((id) => getSecTask(id)).filter(Boolean)

  const totalAssignments = useMemo(() => {
    return Object.values(assignments).reduce((n, shifts) => {
      return n + Object.values(shifts).reduce((m, list) => m + list.length, 0)
    }, 0)
  }, [assignments])

  const removeTask = (taskId) => {
    setAssignments((prev) => ({
      ...prev,
      [yardId]: {
        ...prev[yardId],
        [shiftId]: prev[yardId][shiftId].filter((id) => id !== taskId),
      },
    }))
  }

  const addTask = (taskId) => {
    if (taskIds.includes(taskId)) return
    setAssignments((prev) => ({
      ...prev,
      [yardId]: {
        ...prev[yardId],
        [shiftId]: [...(prev[yardId]?.[shiftId] || []), taskId],
      },
    }))
  }

  const unassigned = SEC_TASKS.filter((t) => !taskIds.includes(t.id))

  return (
    <section className="scfg page">
      <div className="scfg-kpis">
        <div className="scfg-kpi">
          <span>Yards</span>
          <b>{SEC_YARDS.length}</b>
        </div>
        <div className="scfg-kpi">
          <span>Library tasks</span>
          <b>{SEC_TASKS.length}</b>
        </div>
        <div className="scfg-kpi">
          <span>Assignments</span>
          <b>{totalAssignments}</b>
        </div>
        <div className="scfg-kpi">
          <span>Photo / video rules</span>
          <b>12</b>
          <em>Gate + ID required</em>
        </div>
      </div>

      <div className="scfg-grid">
        <div className="scfg-col card">
          <h3>Yards</h3>
          <ul className="scfg-yard-list">
            {SEC_YARDS.map((y) => (
              <li key={y.id}>
                <button
                  type="button"
                  className={`scfg-yard${yardId === y.id ? ' on' : ''}`}
                  onClick={() => setYardId(y.id)}
                >
                  <b>{y.name}</b>
                  <span className="num">{y.code}</span>
                  <span className="muted scfg-yard-addr">{y.address}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="scfg-col card">
          <h3>Task library</h3>
          <ul className="scfg-task-lib">
            {SEC_TASKS.map((t) => (
              <li key={t.id} className="scfg-lib-item">
                <div>
                  <b>{t.name}</b>
                  <span className="num scfg-dur">{t.duration} min</span>
                  <p className="muted">{t.description}</p>
                </div>
                <button
                  type="button"
                  className="btn btn-sm scfg-add"
                  title="Add to shift"
                  onClick={() => addTask(t.id)}
                >
                  <Plus size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="scfg-col card scfg-shift-col">
          <div className="scfg-shift-head">
            <h3>{yard?.name} · Shift config</h3>
            <div className="scfg-shift-tabs">
              {SEC_SHIFTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={shiftId === s.id ? 'on' : ''}
                  onClick={() => setShiftId(s.id)}
                >
                  {s.label}
                  <small className="num">
                    {s.start}–{s.end}
                  </small>
                </button>
              ))}
            </div>
          </div>

          <div className="scfg-assigned">
            <div className="scfg-assigned-head">
              <span>Assigned tasks</span>
              <span className="muted">{assignedTasks.length} on this shift</span>
            </div>
            {assignedTasks.length === 0 ? (
              <p className="scfg-empty">No tasks assigned. Add from the library.</p>
            ) : (
              <ul className="scfg-assigned-list">
                {assignedTasks.map((t) => (
                  <li key={t.id} className="scfg-assigned-item">
                    <div>
                      <b>{t.name}</b>
                      <span className="muted num">{t.duration} min</span>
                    </div>
                    <div className="scfg-assigned-actions">
                      <button type="button" className="btn btn-sm" aria-label="Edit">
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger-soft"
                        aria-label="Remove"
                        onClick={() => removeTask(t.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {unassigned.length > 0 ? (
            <div className="scfg-suggest">
              <span className="muted">Quick add:</span>
              {unassigned.slice(0, 3).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="scfg-suggest-btn"
                  onClick={() => addTask(t.id)}
                >
                  + {t.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
