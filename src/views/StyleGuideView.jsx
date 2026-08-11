import { useEffect, useMemo, useState } from 'react'
import { Download, FileText, ExternalLink, AlertCircle, Search } from 'lucide-react'
import { STYLE_GUIDE, SG_EQUIPMENT, firstAvailableFile } from '../data/styleGuide.js'

export function StyleGuideView() {
  const [kind, setKind] = useState('trailers') // trucks | trailers
  const [equipment, setEquipment] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(STYLE_GUIDE.trailers[0]?.id)
  const [fileId, setFileId] = useState(null)

  const divisions = useMemo(() => {
    const list = STYLE_GUIDE[kind] || []
    const q = query.trim().toLowerCase()
    return list.filter((d) => {
      if (equipment !== 'all' && !(d.equipment || []).includes(equipment)) return false
      if (!q) return true
      const hay = [
        d.company,
        d.name,
        d.region,
        d.description,
        d.numbers?.usDot,
        d.numbers?.svor,
        d.numbers?.mcdot,
        ...(d.equipment || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [kind, equipment, query])

  useEffect(() => {
    if (divisions.some((d) => d.id === selectedId)) return
    const first = divisions[0]
    setSelectedId(first?.id)
    setFileId(firstAvailableFile(first)?.id || null)
  }, [kind, equipment, divisions, selectedId])

  const selected = useMemo(
    () => divisions.find((d) => d.id === selectedId) || divisions[0],
    [divisions, selectedId],
  )

  const activeFile = useMemo(() => {
    if (!selected) return null
    return selected.files.find((f) => f.id === fileId) || firstAvailableFile(selected)
  }, [selected, fileId])

  const selectDivision = (id) => {
    const d = divisions.find((x) => x.id === id)
    setSelectedId(id)
    setFileId(firstAvailableFile(d)?.id || d?.files?.[0]?.id || null)
  }

  const switchKind = (next) => {
    setKind(next)
    setEquipment('all')
    setQuery('')
  }

  const equipOptions = SG_EQUIPMENT[kind] || []
  const numbers = selected?.numbers

  return (
    <section className="sg">
      <div className="sg-shell">
        <aside className="sg-list">
          <div className="side-tabs" role="tablist" aria-label="Unit type">
            <button
              type="button"
              role="tab"
              aria-selected={kind === 'trailers'}
              className={kind === 'trailers' ? 'on' : ''}
              onClick={() => switchKind('trailers')}
            >
              Trailer
              <em>{STYLE_GUIDE.trailers.length}</em>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={kind === 'trucks'}
              className={kind === 'trucks' ? 'on' : ''}
              onClick={() => switchKind('trucks')}
            >
              Truck
              <em>{STYLE_GUIDE.trucks.length}</em>
            </button>
          </div>

          <div className="sg-list-tools">
            <label className="sg-filter">
              <Search size={14} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter companies…"
                aria-label="Filter companies"
              />
            </label>
            <select
              className="sg-equip-select"
              value={equipment}
              aria-label="Equipment type"
              onChange={(e) => setEquipment(e.target.value)}
            >
              {equipOptions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.id === 'all' ? 'All equipment' : e.label}
                </option>
              ))}
            </select>
          </div>

          <div className="side-table-wrap">
            <table className="side-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {divisions.map((d) => {
                  const ready = d.files.some((f) => f.available)
                  const equipLabel = (d.equipment || [])
                    .map((id) => equipOptions.find((e) => e.id === id)?.label || id)
                    .join(', ')
                  return (
                    <tr
                      key={d.id}
                      className={selected?.id === d.id ? 'on' : ''}
                      onClick={() => selectDivision(d.id)}
                      aria-selected={selected?.id === d.id}
                    >
                      <td className="side-name">{d.company || d.name}</td>
                      <td className="side-meta">{equipLabel || d.region}</td>
                      <td className={`side-status${ready ? ' ok' : ''}`}>
                        {ready ? 'Ready' : 'Sync'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {divisions.length === 0 ? (
              <div className="sg-list-empty">No companies match this filter.</div>
            ) : null}
          </div>
        </aside>

        <div className="sg-preview">
          {!selected ? (
            <div className="sg-empty">Select a company</div>
          ) : (
            <>
              <div className="sg-preview-head">
                <div>
                  <div className="sg-preview-kicker">
                    {kind === 'trucks' ? 'Truck' : 'Trailer'} · {selected.region}
                  </div>
                  <h2>{selected.company || selected.name}</h2>
                  <p>{selected.description}</p>
                </div>
                {activeFile?.available ? (
                  <a
                    className="sg-download"
                    href={activeFile.file}
                    download
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download size={15} />
                    Download
                  </a>
                ) : null}
              </div>

              {(() => {
                const offline = selected.files.filter((f) => !f.available).length
                const ready = selected.files.length - offline
                if (!offline) return null
                return (
                  <div className="sg-alerts">
                    <div className="sg-alert warn">
                      <AlertCircle size={15} />
                      <div>
                        <b>
                          {offline} file{offline === 1 ? '' : 's'} need sync
                        </b>
                        <p>
                          {ready} ready · {offline} still cloud-only on this machine. Keep them
                          available offline to preview here.
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {numbers ? (
                <div className="sg-numbers">
                  <div>
                    <span>USDOT</span>
                    <b>{numbers.usDot || '—'}</b>
                  </div>
                  <div>
                    <span>SVOR</span>
                    <b>{numbers.svor || '—'}</b>
                  </div>
                  <div>
                    <span>MCDOT / MC</span>
                    <b>{numbers.mcdot || '—'}</b>
                  </div>
                </div>
              ) : null}

              <div className="sg-file-tabs">
                {selected.files.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={activeFile?.id === f.id ? 'on' : ''}
                    onClick={() => setFileId(f.id)}
                  >
                    {f.label}
                    {!f.available ? <em>offline</em> : null}
                  </button>
                ))}
              </div>

              <div className="sg-viewer">
                {!activeFile ? (
                  <div className="sg-empty">No file selected</div>
                ) : !activeFile.available ? (
                  <div className="sg-offline">
                    <AlertCircle size={28} />
                    <h3>PDF not available offline</h3>
                    <p>
                      This file is still in OneDrive cloud-only storage on this machine. Right-click
                      it in Finder → <b>Always Keep on This Device</b>, then we can load the preview.
                    </p>
                    {activeFile.source ? <code>{activeFile.source}</code> : null}
                    <p className="sg-offline-hint">
                      Local copies that are ready already preview here. Ask to re-sync once OneDrive
                      finishes downloading.
                    </p>
                  </div>
                ) : activeFile.type === 'image' ? (
                  <div className="sg-image-wrap">
                    <img src={activeFile.file} alt={activeFile.label} />
                  </div>
                ) : (
                  <iframe
                    key={activeFile.file}
                    title={activeFile.label}
                    src={`${activeFile.file}#view=FitH`}
                    className="sg-iframe"
                  />
                )}
              </div>

              {activeFile?.available ? (
                <div className="sg-preview-foot">
                  <span>
                    <FileText size={13} />
                    {activeFile.label}
                  </span>
                  <a href={activeFile.file} target="_blank" rel="noreferrer">
                    Open in new tab <ExternalLink size={13} />
                  </a>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
