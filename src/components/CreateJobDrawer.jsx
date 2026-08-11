import { useEffect, useMemo, useState } from 'react'
import { X, Check, ChevronRight, Plus } from 'lucide-react'
import { DEPARTMENTS, UNITS, CREW_AVAILABLE, EMPLOYEES } from '../data/mock.js'

const STEPS = [
  { id: 'details', label: 'Details' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'assign', label: 'Assign' },
  { id: 'review', label: 'Review' },
]

const JOB_TYPES = [
  { id: 'DEC-WRAP', label: 'Partial wrap' },
  { id: 'DEC-INST', label: 'Decal install' },
  { id: 'DEC-REP', label: 'Decal repair' },
  { id: 'DEC-PRINT', label: 'Decal print' },
  { id: 'IFTA', label: 'IFTA renewal' },
  { id: 'INSPECT', label: 'Graphics inspection' },
  { id: 'CLEAN', label: 'Unit cleaning' },
  { id: 'SEC', label: 'Yard security sweep' },
]

const EMPTY = {
  type: 'DEC-WRAP',
  title: 'Partial wrap',
  unit: 'TRL-88421',
  yard: 'Brampton',
  department: 'decals',
  priority: 'High',
  dueDate: '2026-07-22',
  dueTime: '17:00',
  estHours: '3:00',
  assignee: '',
  notify: true,
  startNow: false,
  note: '',
}

function nextJobId() {
  return `DEC-${1068 + Math.floor(Math.random() * 20)}`
}

export function CreateJobDrawer({ open, onClose, onCreated }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(EMPTY)
  const [jobId, setJobId] = useState(() => nextJobId())
  const [created, setCreated] = useState(false)

  useEffect(() => {
    if (!open) return
    setStep(0)
    setForm(EMPTY)
    setJobId(nextJobId())
    setCreated(false)
  }, [open])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const typeMeta = JOB_TYPES.find((t) => t.id === form.type)
  const unitMeta = UNITS.find((u) => u.id === form.unit)
  const assigneeMeta =
    CREW_AVAILABLE.find((c) => c.initials === form.assignee) ||
    EMPLOYEES.find((e) => e.initials === form.assignee)

  const canNext = useMemo(() => {
    if (step === 0) return !!(form.type && form.title.trim() && form.unit && form.yard)
    if (step === 1) return !!(form.dueDate && form.dueTime && form.priority && form.estHours)
    return true
  }, [step, form])

  const goNext = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1)
  }
  const goBack = () => {
    if (step > 0) setStep((s) => s - 1)
  }

  const handleCreate = () => {
    setCreated(true)
    onCreated?.({
      id: jobId,
      ...form,
      title: form.title || typeMeta?.label,
    })
  }

  const handleTypeChange = (typeId) => {
    const t = JOB_TYPES.find((x) => x.id === typeId)
    setForm((f) => ({
      ...f,
      type: typeId,
      title: t?.label || f.title,
      department:
        typeId === 'CLEAN' ? 'cleaning' : typeId === 'SEC' ? 'security' : 'decals',
    }))
  }

  return (
    <>
      <div className={`apple-scrim${open ? ' on' : ''}`} onClick={onClose} />
      <div
        className={`apple-modal create-job-modal${open ? ' on' : ''}`}
        role="dialog"
        aria-label="Create job"
      >
      <div className="dw-head">
        <div>
          <div className="h3">Create job</div>
          <div style={{ marginTop: 2, fontSize: 12, fontWeight: 500, color: 'var(--text-3)' }}>
            {created ? 'Job created' : `${STEPS[step].label} · ${jobId}`}
          </div>
        </div>
        <button className="dw-x" type="button" onClick={onClose} aria-label="Close">
          <X size={14} />
        </button>
      </div>

      {!created ? (
        <div className="cj-steps">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`cj-step${i === step ? ' on' : ''}${i < step ? ' done' : ''}`}
              onClick={() => i < step && setStep(i)}
            >
              <span className="cj-step-num">
                {i < step ? <Check size={11} strokeWidth={3} /> : i + 1}
              </span>
              <span className="cj-step-label">{s.label}</span>
              {i < STEPS.length - 1 ? <ChevronRight size={12} className="cj-step-sep" /> : null}
            </button>
          ))}
        </div>
      ) : null}

      <div className="dw-body">
        {created ? (
          <div className="cj-success">
            <div className="cj-success-icon">
              <Check size={22} strokeWidth={2.5} />
            </div>
            <h3>{jobId} created</h3>
            <p>
              {form.title} · {form.unit} · {form.yard}
              {form.assignee
                ? ` · assigned to ${assigneeMeta?.name || form.assignee}`
                : ' · unassigned'}
            </p>
            <ul className="cj-success-meta">
              <li>
                <span>Priority</span>
                <b>{form.priority}</b>
              </li>
              <li>
                <span>Due</span>
                <b>
                  {form.dueDate} {form.dueTime}
                </b>
              </li>
              <li>
                <span>Est. hours</span>
                <b>{form.estHours}</b>
              </li>
              <li>
                <span>Department</span>
                <b>{DEPARTMENTS.find((d) => d.id === form.department)?.label}</b>
              </li>
            </ul>
          </div>
        ) : null}

        {!created && step === 0 ? (
          <>
            <div className="dw-sec">
              <label className="f-label">Job type</label>
              <div className="cj-type-grid">
                {JOB_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`cj-type${form.type === t.id ? ' on' : ''}`}
                    onClick={() => handleTypeChange(t.id)}
                  >
                    <b>{t.label}</b>
                    <span className="mono">{t.id}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="dw-sec">
              <label className="f-label">Title</label>
              <input
                className="f-input"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Job title"
              />
            </div>
            <div className="f-row">
              <div>
                <label className="f-label">Unit</label>
                <select
                  className="f-select"
                  value={form.unit}
                  onChange={(e) => set('unit', e.target.value)}
                >
                  {UNITS.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.id} · {u.yard}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="f-label">Yard</label>
                <select
                  className="f-select"
                  value={form.yard}
                  onChange={(e) => set('yard', e.target.value)}
                >
                  <option>Brampton</option>
                  <option>Laredo</option>
                  <option>Nuevo Laredo</option>
                </select>
              </div>
            </div>
            <div className="dw-sec">
              <label className="f-label">Department</label>
              <select
                className="f-select"
                value={form.department}
                onChange={(e) => set('department', e.target.value)}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            {unitMeta ? (
              <div className="cj-hint">
                {unitMeta.sub} · Marking{' '}
                <b>{unitMeta.marking?.label || '—'}</b>
              </div>
            ) : null}
          </>
        ) : null}

        {!created && step === 1 ? (
          <>
            <div className="f-row">
              <div>
                <label className="f-label">Due date</label>
                <input
                  className="f-input mono"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => set('dueDate', e.target.value)}
                />
              </div>
              <div>
                <label className="f-label">Due time</label>
                <input
                  className="f-input mono"
                  type="time"
                  value={form.dueTime}
                  onChange={(e) => set('dueTime', e.target.value)}
                />
              </div>
            </div>
            <div className="f-row">
              <div>
                <label className="f-label">Priority</label>
                <select
                  className="f-select"
                  value={form.priority}
                  onChange={(e) => set('priority', e.target.value)}
                >
                  <option>Urgent</option>
                  <option>High</option>
                  <option>Normal</option>
                  <option>Low</option>
                </select>
              </div>
              <div>
                <label className="f-label">Est. hours</label>
                <input
                  className="f-input mono"
                  value={form.estHours}
                  onChange={(e) => set('estHours', e.target.value)}
                  placeholder="3:00"
                />
              </div>
            </div>
            <div className="dw-sec">
              <label className="f-label">Instructions (optional)</label>
              <textarea
                className="f-input"
                rows={3}
                value={form.note}
                onChange={(e) => set('note', e.target.value)}
                placeholder="Prep notes, materials, customer requirements…"
              />
            </div>
          </>
        ) : null}

        {!created && step === 2 ? (
          <>
            <div className="dw-sec">
              <label className="f-label">Assign to (optional)</label>
              <div className="cj-crew">
                <button
                  type="button"
                  className={`cj-crew-item${form.assignee === '' ? ' on' : ''}`}
                  onClick={() => set('assignee', '')}
                >
                  <div className="pav" style={{ background: '#EFF2F8', color: '#49516A' }}>
                    —
                  </div>
                  <div>
                    <b>Leave unassigned</b>
                    <span>Add to open board</span>
                  </div>
                </button>
                {CREW_AVAILABLE.map((c) => (
                  <button
                    key={c.initials}
                    type="button"
                    className={`cj-crew-item${form.assignee === c.initials ? ' on' : ''}`}
                    onClick={() => set('assignee', c.initials)}
                  >
                    <div className="pav" style={{ background: c.bg, color: c.color }}>
                      {c.initials}
                    </div>
                    <div>
                      <b>{c.name}</b>
                      <span>
                        {c.role} · {c.yard} · {c.load}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div
              className={`cb${form.notify ? ' on' : ''}`}
              onClick={() => set('notify', !form.notify)}
              role="checkbox"
              aria-checked={form.notify}
            >
              <i>{form.notify ? '✓' : ''}</i>
              Notify worker in the app
            </div>
            <div
              className={`cb${form.startNow ? ' on' : ''}`}
              onClick={() => set('startNow', !form.startNow)}
              role="checkbox"
              aria-checked={form.startNow}
            >
              <i>{form.startNow ? '✓' : ''}</i>
              Start immediately if worker is on shift
            </div>
          </>
        ) : null}

        {!created && step === 3 ? (
          <div className="cj-review">
            <div className="cj-review-card">
              <div className="cj-review-id mono">{jobId}</div>
              <h4>{form.title}</h4>
              <p>
                {form.unit} · {form.yard} ·{' '}
                {DEPARTMENTS.find((d) => d.id === form.department)?.label}
              </p>
            </div>
            <dl className="cj-review-dl">
              <div>
                <dt>Type</dt>
                <dd>{typeMeta?.label}</dd>
              </div>
              <div>
                <dt>Priority</dt>
                <dd>{form.priority}</dd>
              </div>
              <div>
                <dt>Due</dt>
                <dd>
                  {form.dueDate} · {form.dueTime}
                </dd>
              </div>
              <div>
                <dt>Est. hours</dt>
                <dd>{form.estHours}</dd>
              </div>
              <div>
                <dt>Assignee</dt>
                <dd>{assigneeMeta?.name || 'Unassigned'}</dd>
              </div>
              <div>
                <dt>Notify</dt>
                <dd>{form.notify ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
            {form.note ? (
              <div className="cj-review-note">
                <span>Instructions</span>
                <p>{form.note}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="dw-foot">
        {created ? (
          <>
            <button type="button" className="btn btn-sm" onClick={onClose}>
              Close
            </button>
            <div className="spacer" />
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => {
                setCreated(false)
                setStep(0)
                setForm(EMPTY)
                setJobId(nextJobId())
              }}
            >
              <Plus size={13} strokeWidth={2.4} />
              Create another
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn-sm" onClick={step === 0 ? onClose : goBack}>
              {step === 0 ? 'Cancel' : 'Back'}
            </button>
            <div className="spacer" />
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                className="btn btn-sm btn-primary"
                disabled={!canNext}
                onClick={goNext}
              >
                Continue
              </button>
            ) : (
              <button type="button" className="btn btn-sm btn-primary" onClick={handleCreate}>
                Create job
              </button>
            )}
          </>
        )}
      </div>
    </div>
    </>
  )
}
