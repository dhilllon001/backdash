import { useMemo, useState } from 'react'
import { X, AlertTriangle, Clock, CheckCircle2, CalendarDays, MessageSquare } from 'lucide-react'

function calcHours(date, time, punchInHint) {
  if (!date || !time) return '—'
  if (!punchInHint || punchInHint === '—') return '—'
  const [ah, am] = String(punchInHint).split(':').map(Number)
  const [bh, bm] = String(time).split(':').map(Number)
  if ([ah, am, bh, bm].some((n) => Number.isNaN(n))) return '—'
  let diff = bh * 60 + bm - (ah * 60 + am)
  if (diff < 0) diff += 24 * 60
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return `${h}:${String(m).padStart(2, '0')}`
}

/** Resolve open / missed punch */
export function PunchResolveModal({ employee, onClose, onSave }) {
  const openLabel = employee?.status?.label || 'Missed punch'
  const [date, setDate] = useState('2026-07-20')
  const [time, setTime] = useState('15:56')
  const [reason, setReason] = useState('FORGOT_PUNCH_OUT')
  const [breakMins, setBreakMins] = useState('0:30')
  const [note, setNote] = useState('')
  const punchInHint = '06:52'
  const hours = useMemo(
    () => calcHours(date, time, punchInHint),
    [date, time, punchInHint],
  )

  return (
    <div className="apple-scrim on" onClick={onClose}>
      <div
        className="apple-modal on wf-modal wf-punch"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Resolve punch"
      >
        <div className="dw-head">
          <div>
            <div className="dw-title">Resolve punch</div>
            <div className="wf-sub">
              {employee?.name} · {employee?.role}
            </div>
          </div>
          <button type="button" className="dw-x" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="dw-body">
          <div className="wf-banner warn">
            <AlertTriangle size={15} />
            <div>
              <b>{openLabel}</b>
              <span>Hours stay unpaid until punch-out is recorded and saved.</span>
            </div>
          </div>

          <section className="wf-sec">
            <div className="wf-sec-label">
              <Clock size={13} />
              Current shift
            </div>
            <div className="wf-sec-body wf-punch-summary">
              <div>
                <span>Punch in</span>
                <b className="mono">{punchInHint}</b>
              </div>
              <div>
                <span>Punch out</span>
                <b className="mono missing">Missing</b>
              </div>
              <div>
                <span>Est. hours</span>
                <b className="mono">{hours}</b>
              </div>
            </div>
          </section>

          <section className="wf-sec">
            <div className="wf-sec-label">
              <CalendarDays size={13} />
              Set punch-out
            </div>
            <div className="wf-sec-body">
              <div className="inv-two">
                <label className="fld">
                  <span>Date</span>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </label>
                <label className="fld">
                  <span>Time</span>
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </label>
              </div>
              <div className="inv-two">
                <label className="fld">
                  <span>Reason</span>
                  <select value={reason} onChange={(e) => setReason(e.target.value)}>
                    <option value="FORGOT_PUNCH_OUT">Forgot punch-out</option>
                    <option value="DEVICE_OFFLINE">Device offline</option>
                    <option value="DEVICE_BATTERY_DEAD">Battery dead</option>
                    <option value="APP_ERROR">App error</option>
                    <option value="SUPERVISOR_CORRECTION">Supervisor correction</option>
                  </select>
                </label>
                <label className="fld">
                  <span>Break</span>
                  <input
                    className="mono"
                    value={breakMins}
                    onChange={(e) => setBreakMins(e.target.value)}
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="wf-sec">
            <div className="wf-sec-label">
              <MessageSquare size={13} />
              Verification note
            </div>
            <div className="wf-sec-body">
              <label className="fld" style={{ marginBottom: 0 }}>
                <span>How was this verified?</span>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Phone confirm, gate read, supervisor call…"
                />
              </label>
            </div>
          </section>
        </div>

        <div className="dw-foot" style={{ justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!date || !time}
            onClick={() =>
              onSave({
                date,
                time,
                reason,
                breakMins,
                note,
                punchIn: punchInHint,
                hours,
              })
            }
          >
            Save punch-out
          </button>
        </div>
      </div>
    </div>
  )
}

/** Approve timesheet — includes overtime approval */
export function ApproveTimesheetModal({ employee, onClose, onSave }) {
  const hasOt = !!employee?.ot
  const [approveOt, setApproveOt] = useState(hasOt)
  const [otNote, setOtNote] = useState('')
  const [periodNote, setPeriodNote] = useState('')

  return (
    <div className="apple-scrim on" onClick={onClose}>
      <div
        className="apple-modal on wf-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Approve timesheet"
      >
        <div className="dw-head">
          <div>
            <div className="dw-title">Approve timesheet</div>
            <div className="wf-sub">
              {employee?.name} · Pay period Jul 7 – 20
            </div>
          </div>
          <button type="button" className="dw-x" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="dw-body">
          <div className="wf-banner ok">
            <CheckCircle2 size={15} />
            <div>
              <b>Ready to approve</b>
              <span>No open punches. Review hours and overtime before locking payroll.</span>
            </div>
          </div>

          <div className="wf-stats">
            <div>
              <span>Payable</span>
              <b className="mono">{employee?.payable}</b>
            </div>
            <div>
              <span>Regular</span>
              <b className="mono">{employee?.reg}</b>
            </div>
            <div>
              <span>OT</span>
              <b className="mono">{employee?.ot || '—'}</b>
            </div>
            <div>
              <span>Job hrs</span>
              <b className="mono">{employee?.jobHrs}</b>
            </div>
          </div>

          {hasOt ? (
            <div className={`wf-ot${approveOt ? ' on' : ''}`}>
              <div className="wf-ot-head">
                <Clock size={15} />
                <div>
                  <b>Overtime · {employee.ot}</b>
                  <span>Approve OT to include in payroll export</span>
                </div>
                <label className="wf-switch">
                  <input
                    type="checkbox"
                    checked={approveOt}
                    onChange={(e) => setApproveOt(e.target.checked)}
                  />
                  <i />
                </label>
              </div>
              {approveOt ? (
                <label className="fld" style={{ marginTop: 10 }}>
                  <span>OT note (optional)</span>
                  <input
                    value={otNote}
                    onChange={(e) => setOtNote(e.target.value)}
                    placeholder="Pre-approved weekend wrap / rush job…"
                  />
                </label>
              ) : (
                <p className="wf-ot-warn">OT will be excluded from payable until approved.</p>
              )}
            </div>
          ) : (
            <div className="wf-card">
              <div className="wf-card-row">
                <span>Overtime</span>
                <b>None this period</b>
              </div>
            </div>
          )}

          <label className="fld">
            <span>Approval note (optional)</span>
            <input
              value={periodNote}
              onChange={(e) => setPeriodNote(e.target.value)}
              placeholder="Any payroll note…"
            />
          </label>
        </div>

        <div className="dw-foot" style={{ justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              onSave({
                approveOt: hasOt ? approveOt : false,
                otNote,
                periodNote,
              })
            }
          >
            {hasOt && approveOt ? 'Approve with OT' : 'Approve timesheet'}
          </button>
        </div>
      </div>
    </div>
  )
}
