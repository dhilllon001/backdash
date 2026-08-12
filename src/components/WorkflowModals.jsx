import { useMemo, useState } from 'react'
import {
  X,
  AlertTriangle,
  Clock,
  CheckCircle2,
  CalendarDays,
  MessageSquare,
  Share2,
  Download,
  FileCheck2,
  Copy,
  Check,
} from 'lucide-react'
import { buildShiftLedger, getPersonShifts } from '../data/mock.js'
import { formatClock, formatShiftId } from './ui.jsx'

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

/** Proof of timesheet — printable / shareable summary for a person */
export function ProofTimesheetModal({ employee, onClose, onShare, loadShifts }) {
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)

  const ledger = useMemo(() => {
    if (!employee) return []
    const shifts = loadShifts ? loadShifts(employee.id) : getPersonShifts(employee.id)
    return buildShiftLedger(shifts, '2026-07-07', '2026-07-20')
  }, [employee, loadShifts])

  const worked = ledger.filter((s) => !s.dayOff)
  const openCount = worked.filter((s) => s.open).length

  const proofText = useMemo(() => {
    if (!employee) return ''
    const lines = [
      `Decals · Proof of timesheet`,
      `${employee.name} · ${employee.role}`,
      `Pay period: Jul 7 – 20, 2026`,
      `Payable: ${employee.payable} · Regular: ${employee.reg} · OT: ${employee.ot || '—'}`,
      `Jobs: ${employee.jobs || '—'} · Job hrs: ${employee.jobHrs || '—'} · Util: ${employee.util ?? '—'}%`,
      '',
      'Shifts:',
      ...worked.map((s) => {
        const range = s.open
          ? `${formatClock(s.in)} → open`
          : `${formatClock(s.in)} → ${formatClock(s.out)}`
        return `· ${s.day} · ${range} · ${s.totalHours || s.hoursLabel || '—'} · ${s.yard}`
      }),
    ]
    return lines.join('\n')
  }, [employee, worked])

  const copyProof = async () => {
    try {
      await navigator.clipboard.writeText(proofText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* ignore */
    }
  }

  const shareProof = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Timesheet · ${employee?.name}`,
          text: proofText,
        })
      } else {
        await navigator.clipboard.writeText(proofText)
      }
      setShared(true)
      setTimeout(() => setShared(false), 1800)
      onShare?.(proofText)
    } catch {
      /* user cancelled share */
    }
  }

  if (!employee) return null

  return (
    <div className="apple-scrim on" onClick={onClose}>
      <div
        className="apple-modal on wf-modal proof-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Proof of timesheet"
      >
        <div className="dw-head">
          <div>
            <div className="dw-title">Proof of timesheet</div>
            <div className="wf-sub">
              {employee.name} · Pay period Jul 7 – 20
            </div>
          </div>
          <button type="button" className="dw-x" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="dw-body">
          <div className={`wf-banner ${openCount ? 'warn' : 'ok'}`}>
            <FileCheck2 size={15} />
            <div>
              <b>{openCount ? 'Draft proof · open punches remaining' : 'Ready to share'}</b>
              <span>
                {worked.length} worked days · {ledger.length - worked.length} day off
                {openCount ? ` · ${openCount} open punch` : ' · no open punches'}
              </span>
            </div>
          </div>

          <div className="proof-person">
            <div className="pav" style={{ background: employee.bg, color: employee.color }}>
              {employee.initials}
            </div>
            <div>
              <b>{employee.name}</b>
              <span>
                {employee.role} · {employee.yards?.join(', ') || '—'}
              </span>
            </div>
            <em className="mono">PROOF-{String(employee.id).toUpperCase()}-0720</em>
          </div>

          <div className="wf-stats">
            <div>
              <span>Payable</span>
              <b className="mono">{employee.payable}</b>
            </div>
            <div>
              <span>Regular</span>
              <b className="mono">{employee.reg}</b>
            </div>
            <div>
              <span>OT</span>
              <b className="mono">{employee.ot || '—'}</b>
            </div>
            <div>
              <span>Job hrs</span>
              <b className="mono">{employee.jobHrs || '—'}</b>
            </div>
          </div>

          <div className="proof-table-wrap">
            <table className="proof-table">
              <thead>
                <tr>
                  <th>Shift ID</th>
                  <th>Day</th>
                  <th>Clock</th>
                  <th className="num">Hours</th>
                  <th>Yard</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((s) => (
                  <tr key={s.id} className={s.dayOff ? 'off' : s.open ? 'open' : ''}>
                    <td className="mono">{formatShiftId(s, employee.id) || '—'}</td>
                    <td>{s.day}</td>
                    <td className="mono">
                      {s.dayOff
                        ? '—'
                        : s.open
                          ? `${formatClock(s.in)} → open`
                          : `${formatClock(s.in)} → ${formatClock(s.out)}`}
                    </td>
                    <td className="num mono">
                      {s.dayOff ? '—' : s.totalHours || s.hoursLabel || '—'}
                    </td>
                    <td>{s.dayOff ? '—' : s.yard}</td>
                    <td>
                      {s.dayOff ? 'Day off' : s.open ? 'Open punch' : s.ot ? 'OT' : 'Closed'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dw-foot proof-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn btn-sm" onClick={copyProof}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button type="button" className="btn btn-sm" onClick={() => window.print()}>
            <Download size={13} />
            Print / PDF
          </button>
          <button type="button" className="btn btn-sm btn-primary" onClick={shareProof}>
            {shared ? <Check size={13} /> : <Share2 size={13} />}
            {shared ? 'Shared' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  )
}
