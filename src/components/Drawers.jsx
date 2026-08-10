import { useState } from 'react'
import { X } from 'lucide-react'

export function AssignDrawer({ open, onClose }) {
  const [notify, setNotify] = useState(true)
  const [startNow, setStartNow] = useState(true)

  return (
    <aside className={`drawer${open ? ' on' : ''}`} role="dialog" aria-label="Assign work">
      <div className="dw-head">
        <div>
          <div className="h3">Assign work</div>
          <div style={{ marginTop: 2, fontSize: 12, fontWeight: 500, color: 'var(--text-3)' }}>
            Pick a job and assign it to a crew member
          </div>
        </div>
        <button className="dw-x" type="button" onClick={onClose} aria-label="Close">
          <X size={14} />
        </button>
      </div>
      <div className="dw-body">
        <div className="dw-sec">
          <label className="f-label">Job</label>
          <select className="f-select" defaultValue="DEC-1061">
            <option value="DEC-1061">DEC-1061 · Decal install · TRK-5120</option>
            <option value="DEC-1064">DEC-1064 · Partial wrap · TRL-90110</option>
            <option value="DEC-1066">DEC-1066 · IFTA renewal · TRL-77201</option>
            <option value="DEC-1043">DEC-1043 · Partial wrap · TRL-88421</option>
          </select>
        </div>
        <div className="dw-sec">
          <label className="f-label">Assign to</label>
          <select className="f-select" defaultValue="UP">
            <option value="UP">Ujwal Patel · Brampton · 1 active job</option>
            <option value="AV">Adarsh Verma · Brampton · 2 active jobs</option>
            <option value="KD">Kamal Dhillon · Brampton · available</option>
            <option value="JM">John Macías · Laredo · 1 active job</option>
          </select>
        </div>
        <div className="f-row">
          <div>
            <label className="f-label">Priority</label>
            <select className="f-select" defaultValue="High">
              <option>Urgent</option>
              <option>High</option>
              <option>Normal</option>
              <option>Low</option>
            </select>
          </div>
          <div>
            <label className="f-label">Due</label>
            <input className="f-input mono" defaultValue="2026-07-22 17:00" />
          </div>
        </div>
        <div className="f-row wide">
          <div>
            <label className="f-label">Note (optional)</label>
            <textarea className="f-input" rows={2} placeholder="Any instructions for the installer…" />
          </div>
        </div>
        <div
          className={`cb${notify ? ' on' : ''}`}
          onClick={() => setNotify((v) => !v)}
          role="checkbox"
          aria-checked={notify}
        >
          <i>{notify ? '✓' : ''}</i>
          Notify worker in the app
        </div>
        <div
          className={`cb${startNow ? ' on' : ''}`}
          onClick={() => setStartNow((v) => !v)}
          role="checkbox"
          aria-checked={startNow}
        >
          <i>{startNow ? '✓' : ''}</i>
          Start immediately if worker is on shift
        </div>
      </div>
      <div className="dw-foot">
        <button type="button" className="btn btn-sm" onClick={onClose}>
          Cancel
        </button>
        <div className="spacer" />
        <button type="button" className="btn btn-sm btn-primary" onClick={onClose}>
          Assign job
        </button>
      </div>
    </aside>
  )
}

export function PunchDrawer({ open, onClose }) {
  return (
    <aside className={`drawer${open ? ' on' : ''}`} role="dialog" aria-label="Resolve open punch">
      <div className="dw-head">
        <div>
          <div className="h3">Resolve open punch</div>
          <div style={{ marginTop: 2, fontSize: 12, fontWeight: 500, color: 'var(--text-3)' }}>
            Adarsh Verma · EMP-0114 · Mon, Jul 20 · Brampton
          </div>
        </div>
        <button className="dw-x" type="button" onClick={onClose} aria-label="Close">
          <X size={14} />
        </button>
      </div>
      <div className="dw-body">
        <div className="note warn" style={{ marginBottom: 15 }}>
          Clocked in 21h 04m ago with no punch-out. This day is excluded from payable hours until
          resolved.
        </div>
        <div className="f-row">
          <div>
            <label className="f-label">Date</label>
            <input className="f-input mono" defaultValue="2026-07-20" />
          </div>
          <div>
            <label className="f-label">Time (EDT)</label>
            <input className="f-input mono" defaultValue="15:56" />
          </div>
        </div>
        <div className="f-row">
          <div>
            <label className="f-label">Reason code</label>
            <select className="f-select" defaultValue="FORGOT_PUNCH_OUT">
              <option>FORGOT_PUNCH_OUT</option>
              <option>DEVICE_OFFLINE</option>
              <option>DEVICE_BATTERY_DEAD</option>
              <option>APP_ERROR</option>
              <option>SUPERVISOR_CORRECTION</option>
            </select>
          </div>
          <div>
            <label className="f-label">Break to record</label>
            <input className="f-input mono" defaultValue="0:30" />
          </div>
        </div>
        <div className="f-row wide">
          <div>
            <label className="f-label">Note</label>
            <textarea
              className="f-input"
              rows={2}
              defaultValue="Set to gate-exit read 15:56. Worker confirmed by phone +1 (905) 555-0142."
            />
          </div>
        </div>
      </div>
      <div className="dw-foot">
        <button type="button" className="btn btn-sm" onClick={onClose}>
          Cancel
        </button>
        <div className="spacer" />
        <button type="button" className="btn btn-sm btn-primary" onClick={onClose}>
          Save punch-out
        </button>
      </div>
    </aside>
  )
}
