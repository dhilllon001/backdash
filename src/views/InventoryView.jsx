import { useMemo, useState } from 'react'
import {
  Search,
  Plus,
  Minus,
  Package,
  Paperclip,
  Upload,
  X,
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react'
import {
  INITIAL_INVENTORY,
  INITIAL_MOVEMENTS,
  INITIAL_INVOICES,
  INV_CATEGORIES,
  INV_COUNTRIES,
  INV_VENDORS,
  INV_LOCATIONS,
  categoryLabel,
  rollsLabel,
} from '../data/inventory.js'
import { useActivity } from '../context/ActivityContext.jsx'

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 999)}`
}

function fmtMoney(n) {
  return `$${Number(n || 0).toFixed(2)}`
}

const EMPTY_ITEM = {
  sku: '',
  name: '',
  brand: '3M',
  category: '3m',
  color: '',
  widthIn: '48',
  rollLengthFt: '50',
  rolls: '1',
  country: 'Canada',
  location: 'Brampton',
  vendor: '3M Canada',
  costPerRoll: '',
  note: '',
}

export function InventoryView() {
  const { logActivity } = useActivity()
  const [items, setItems] = useState(INITIAL_INVENTORY)
  const [movements, setMovements] = useState(INITIAL_MOVEMENTS)
  const [invoices, setInvoices] = useState(INITIAL_INVOICES)
  const [category, setCategory] = useState('all')
  const [country, setCountry] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(INITIAL_INVENTORY[0]?.id || null)
  const [modal, setModal] = useState(null)

  const selected = items.find((i) => i.id === selectedId) || null

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      if (category !== 'all' && item.category !== category) return false
      if (country !== 'all' && item.country !== country) return false
      if (!q) return true
      const hay =
        `${item.sku} ${item.name} ${item.brand} ${item.color} ${item.vendor} ${item.location} ${item.country} ${item.note}`.toLowerCase()
      return hay.includes(q)
    })
  }, [items, category, country, query])

  const stats = useMemo(() => {
    const scope = country === 'all' ? items : items.filter((i) => i.country === country)
    const skus = scope.length
    const rolls = scope.reduce((n, i) => n + (i.rolls || 0), 0)
    const byCountry = {
      Canada: items.filter((i) => i.country === 'Canada').reduce((n, i) => n + i.rolls, 0),
      US: items.filter((i) => i.country === 'US').reduce((n, i) => n + i.rolls, 0),
      Mexico: items.filter((i) => i.country === 'Mexico').reduce((n, i) => n + i.rolls, 0),
    }
    const value = scope.reduce((n, i) => n + i.rolls * (i.costPerRoll || 0), 0)
    return { skus, rolls, byCountry, value }
  }, [items, country])

  const itemMoves = useMemo(() => {
    if (!selected) return []
    return movements
      .filter((m) => m.itemId === selected.id)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [movements, selected])

  const itemInvoices = useMemo(() => {
    if (!selected) return []
    return invoices.filter((inv) => inv.itemIds.includes(selected.id))
  }, [invoices, selected])

  const openAdjust = (itemId, mode) => {
    setSelectedId(itemId)
    setModal({ type: 'adjust', mode, itemId })
  }

  const adjustItem =
    items.find((i) => i.id === (modal?.itemId || selectedId)) || selected

  const applyAdjust = ({
    mode,
    qty,
    reason,
    note,
    vendor,
    invoiceFile,
    invoiceNumber,
    invoiceAmount,
    markPending,
  }) => {
    const target = adjustItem
    if (!target || !qty || qty <= 0) return
    const delta = mode === 'in' ? qty : -qty
    const nextRolls = Math.max(0, target.rolls + delta)

    let invoiceId = null
    let nextInvoiceStatus = target.invoiceStatus
    let nextInvoiceNumber = target.invoiceNumber

    if (mode === 'in') {
      if (invoiceFile || (invoiceNumber && invoiceNumber.trim())) {
        invoiceId = uid('invc')
        const number =
          (invoiceNumber && invoiceNumber.trim()) ||
          invoiceFile?.name.replace(/\.[^.]+$/, '') ||
          `INV-${Date.now().toString().slice(-5)}`
        nextInvoiceStatus = 'ok'
        nextInvoiceNumber = number
        setInvoices((list) => [
          {
            id: invoiceId,
            number,
            vendor: vendor || target.vendor,
            date: new Date().toISOString().slice(0, 10),
            amount: Number(invoiceAmount) || qty * (target.costPerRoll || 0),
            fileName: invoiceFile?.name || `${number}.pdf`,
            itemIds: [target.id],
            note: note || '',
          },
          ...list,
        ])
      } else if (markPending) {
        nextInvoiceStatus = 'pending'
        nextInvoiceNumber = null
      }
    }

    setItems((list) =>
      list.map((i) =>
        i.id === target.id
          ? {
              ...i,
              rolls: nextRolls,
              invoiceStatus: nextInvoiceStatus,
              invoiceNumber: nextInvoiceNumber,
            }
          : i,
      ),
    )
    setMovements((list) => [
      {
        id: uid('mov'),
        itemId: target.id,
        type: mode,
        qty,
        date: new Date().toISOString().slice(0, 10),
        by: 'Arshdeep Singh',
        reason: reason || (mode === 'in' ? 'Stock in' : 'Stock out'),
        vendor: mode === 'in' ? vendor || target.vendor : '',
        invoiceId,
        note: note || '',
      },
      ...list,
    ])
    logActivity({
      area: 'inventory',
      action: mode === 'in' ? 'stock_in' : 'stock_out',
      title: mode === 'in' ? 'Added rolls' : 'Used rolls',
      detail: `${target.name} · ${mode === 'in' ? '+' : '−'}${qty} rolls · ${target.country}${
        reason ? ` · ${reason}` : ''
      }`,
      meta: { sku: target.sku, qty },
    })
    setModal(null)
  }

  const applyNewItem = (form) => {
    const id = uid('inv')
    const rolls = Number(form.rolls) || 0
    const item = {
      id,
      sku: form.sku.trim() || `SKU-${items.length + 1}`,
      name: form.name.trim(),
      brand: form.brand.trim() || '—',
      category: form.category,
      color: form.color.trim() || '—',
      widthIn: Number(form.widthIn) || 0,
      rollLengthFt: Number(form.rollLengthFt) || 50,
      rolls,
      country: form.country,
      location: form.location,
      vendor: form.vendor,
      costPerRoll: Number(form.costPerRoll) || 0,
      note: form.note.trim(),
      invoiceStatus: rolls > 0 ? 'pending' : 'ok',
      invoiceNumber: null,
    }
    setItems((list) => [item, ...list])
    setSelectedId(id)
    if (rolls > 0) {
      setMovements((list) => [
        {
          id: uid('mov'),
          itemId: id,
          type: 'in',
          qty: rolls,
          date: new Date().toISOString().slice(0, 10),
          by: 'Arshdeep Singh',
          reason: 'Opening stock',
          vendor: item.vendor,
          invoiceId: null,
          note: 'New inventory item',
        },
        ...list,
      ])
    }
    logActivity({
      area: 'inventory',
      action: 'new_item',
      title: 'Created inventory item',
      detail: `${item.name} · ${item.color} · opening ${rolls} rolls · ${item.country}`,
      meta: { sku: item.sku },
    })
    setModal(null)
  }

  const attachInvoiceOnly = ({ file, number, amount, vendor, note }) => {
    if (!selected || !file) return
    const invoiceId = uid('invc')
    const invNumber = number || file.name.replace(/\.[^.]+$/, '')
    setInvoices((list) => [
      {
        id: invoiceId,
        number: invNumber,
        vendor: vendor || selected.vendor,
        date: new Date().toISOString().slice(0, 10),
        amount: Number(amount) || 0,
        fileName: file.name,
        itemIds: [selected.id],
        note: note || '',
      },
      ...list,
    ])
    setItems((list) =>
      list.map((i) =>
        i.id === selected.id
          ? { ...i, invoiceStatus: 'ok', invoiceNumber: invNumber }
          : i,
      ),
    )
    logActivity({
      area: 'inventory',
      action: 'invoice',
      title: 'Attached invoice',
      detail: `${invNumber} · ${vendor || selected.vendor} · ${fmtMoney(amount)} · ${selected.name}`,
      meta: { invoice: invNumber },
    })
    setModal(null)
  }

  return (
    <section className="inv">
      <div className="inv-toolbar">
        <div>
          <div className="inv-title">Inventory</div>
          <div className="inv-sub">
            Print &amp; 3M rolls by country — add or remove rolls from the grid, attach invoices.
          </div>
        </div>
        <div className="inv-toolbar-right">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModal({ type: 'new' })}>
            <Plus size={14} /> New item
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={!selected}
            onClick={() => selected && openAdjust(selected.id, 'in')}
          >
            <Plus size={14} /> Add rolls
          </button>
        </div>
      </div>

      <div className="inv-kpis">
        <div className="inv-kpi">
          <span>Items</span>
          <b>{stats.skus}</b>
        </div>
        <div className="inv-kpi">
          <span>Total rolls</span>
          <b>{stats.rolls}</b>
        </div>
        <div className="inv-kpi">
          <span>Canada</span>
          <b>{stats.byCountry.Canada}</b>
        </div>
        <div className="inv-kpi">
          <span>US</span>
          <b>{stats.byCountry.US}</b>
        </div>
        <div className="inv-kpi">
          <span>Mexico</span>
          <b>{stats.byCountry.Mexico}</b>
        </div>
      </div>

      <div className="inv-shell">
        <div className="inv-main card">
          <div className="inv-filters">
            <div className="inv-search">
              <Search size={14} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search SKU, name, brand, location…"
              />
            </div>
            <div className="inv-country-seg">
              {INV_COUNTRIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={country === c.id ? 'on' : ''}
                  onClick={() => setCountry(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="inv-cats">
            {INV_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={category === c.id ? 'on' : ''}
                onClick={() => setCategory(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="inv-table-wrap">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Country</th>
                  <th>Location</th>
                  <th>Inventory</th>
                  <th className="inv-actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className={`${selectedId === item.id ? 'on' : ''}${item.invoiceStatus === 'pending' ? ' pending-inv' : ''}`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <td>
                      {item.invoiceStatus === 'pending' || !item.invoiceNumber ? (
                        <span className="inv-inv-badge pending">Pending</span>
                      ) : (
                        <span className="inv-inv-badge ok" title={item.invoiceNumber}>
                          <FileText size={11} />
                          {item.invoiceNumber}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="inv-item-cell">
                        <b>{item.name}</b>
                        <span className="mono">
                          {item.sku} · {item.widthIn}" · {item.color}
                        </span>
                      </div>
                    </td>
                    <td>{categoryLabel(item.category)}</td>
                    <td>
                      <span className="inv-country-chip">{item.country}</span>
                    </td>
                    <td>{item.location}</td>
                    <td>
                      <strong className="inv-rolls">{rollsLabel(item.rolls)}</strong>
                    </td>
                    <td className="inv-actions-col" onClick={(e) => e.stopPropagation()}>
                      <div className="inv-row-actions">
                        <button
                          type="button"
                          className="inv-qty-btn minus"
                          title="Remove rolls"
                          disabled={item.rolls <= 0}
                          onClick={() => openAdjust(item.id, 'out')}
                        >
                          <Minus size={14} strokeWidth={2.5} />
                        </button>
                        <span className="inv-row-qty">{item.rolls}</span>
                        <button
                          type="button"
                          className="inv-qty-btn plus"
                          title="Add rolls"
                          onClick={() => openAdjust(item.id, 'in')}
                        >
                          <Plus size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="inv-empty">
                      No items match these filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="inv-detail card">
          {selected ? (
            <>
              <div className="inv-detail-head">
                <div className="inv-detail-sku mono">{selected.sku}</div>
                <h2>{selected.name}</h2>
                <div className="inv-detail-meta">
                  <span>{selected.brand}</span>
                  <span>·</span>
                  <span>{categoryLabel(selected.category)}</span>
                  <span>·</span>
                  <span>
                    {selected.country} · {selected.location}
                  </span>
                </div>
              </div>

              <div className="inv-qty-row">
                <div>
                  <span>Inventory</span>
                  <b>{rollsLabel(selected.rolls)}</b>
                </div>
                <div>
                  <span>Cost / roll</span>
                  <b>{fmtMoney(selected.costPerRoll)}</b>
                </div>
                <div>
                  <span>Line value</span>
                  <b>{fmtMoney(selected.rolls * selected.costPerRoll)}</b>
                </div>
              </div>

              <div className="inv-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => openAdjust(selected.id, 'in')}
                >
                  <Plus size={14} /> Add rolls
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => openAdjust(selected.id, 'out')}
                >
                  <Minus size={14} /> Use rolls
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setModal({ type: 'invoice' })}
                >
                  <Paperclip size={14} /> Attach invoice
                </button>
              </div>

              <div className="inv-panel">
                <div className="inv-panel-head">Recent activity</div>
                <ul className="inv-moves">
                  {itemMoves.length === 0 ? (
                    <li className="muted">No movements yet.</li>
                  ) : (
                    itemMoves.map((m) => (
                      <li key={m.id}>
                        <span className={`inv-move-icon ${m.type}`}>
                          {m.type === 'in' ? (
                            <ArrowDownLeft size={13} />
                          ) : (
                            <ArrowUpRight size={13} />
                          )}
                        </span>
                        <div className="grow">
                          <b>
                            {m.type === 'in' ? '+' : '−'}
                            {rollsLabel(m.qty)}
                          </b>
                          <span>
                            {m.reason}
                            {m.note ? ` · ${m.note}` : ''}
                          </span>
                        </div>
                        <em>{m.date}</em>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <div className="inv-panel">
                <div className="inv-panel-head">Invoices</div>
                <ul className="inv-invoices">
                  {itemInvoices.length === 0 ? (
                    <li className="muted">No invoices attached.</li>
                  ) : (
                    itemInvoices.map((inv) => (
                      <li key={inv.id}>
                        <FileText size={14} />
                        <div className="grow">
                          <b>{inv.number}</b>
                          <span>
                            {inv.vendor} · {inv.date} · {fmtMoney(inv.amount)}
                          </span>
                          <span className="file">{inv.fileName}</span>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {selected.note ? (
                <div className="inv-note">
                  <Package size={13} /> {selected.note}
                </div>
              ) : null}
            </>
          ) : (
            <div className="inv-detail-empty">Select an item to view stock and invoices.</div>
          )}
        </aside>
      </div>

      {modal?.type === 'adjust' ? (
        <AdjustModal
          mode={modal.mode}
          item={adjustItem}
          onClose={() => setModal(null)}
          onSave={applyAdjust}
        />
      ) : null}
      {modal?.type === 'new' ? (
        <NewItemModal onClose={() => setModal(null)} onSave={applyNewItem} />
      ) : null}
      {modal?.type === 'invoice' ? (
        <InvoiceModal item={selected} onClose={() => setModal(null)} onSave={attachInvoiceOnly} />
      ) : null}
    </section>
  )
}

function ModalShell({ title, onClose, children, footer }) {
  return (
    <div className="apple-scrim on" onClick={onClose}>
      <div className="apple-modal inv-modal on" onClick={(e) => e.stopPropagation()}>
        <div className="dw-head">
          <div>
            <div className="dw-title">{title}</div>
          </div>
          <button type="button" className="dw-x" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="dw-body">{children}</div>
        {footer ? (
          <div className="dw-foot" style={{ marginLeft: 'auto', justifyContent: 'flex-end' }}>
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function AdjustModal({ mode, item, onClose, onSave }) {
  const [qty, setQty] = useState('1')
  const [reason, setReason] = useState(mode === 'in' ? 'PO receive' : 'Job use')
  const [note, setNote] = useState('')
  const [vendor, setVendor] = useState(item?.vendor || '')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [invoiceAmount, setInvoiceAmount] = useState('')
  const [file, setFile] = useState(null)
  const [markPending, setMarkPending] = useState(true)

  if (!item) return null

  const n = Number(qty)
  const valid = n > 0 && (mode === 'in' || n <= item.rolls)
  const hasInvoice = !!(file || invoiceNumber.trim())

  return (
    <ModalShell
      title={mode === 'in' ? `Add rolls — ${item.name}` : `Use rolls — ${item.name}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!valid}
            onClick={() =>
              onSave({
                mode,
                qty: n,
                reason,
                note,
                vendor,
                invoiceFile: file,
                invoiceNumber,
                invoiceAmount,
                markPending: mode === 'in' && !hasInvoice && markPending,
              })
            }
          >
            {mode === 'in' ? 'Confirm add' : 'Confirm remove'}
          </button>
        </>
      }
    >
      <div className="inv-modal-item">
        <span className="mono">{item.sku}</span>
        <b>{item.name}</b>
        <em>
          {item.country} · {item.location} · {rollsLabel(item.rolls)} now
        </em>
      </div>

      <label className="fld">
        <span>Rolls to {mode === 'in' ? 'add' : 'remove'}</span>
        <input
          type="number"
          min="1"
          step="1"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          autoFocus
        />
      </label>
      <label className="fld">
        <span>Reason</span>
        <select value={reason} onChange={(e) => setReason(e.target.value)}>
          {mode === 'in' ? (
            <>
              <option>PO receive</option>
              <option>Transfer in</option>
              <option>Return</option>
              <option>Adjustment</option>
            </>
          ) : (
            <>
              <option>Job use</option>
              <option>Damaged / scrap</option>
              <option>Transfer out</option>
              <option>Adjustment</option>
            </>
          )}
        </select>
      </label>
      {mode === 'in' ? (
        <label className="fld">
          <span>Vendor</span>
          <select value={vendor} onChange={(e) => setVendor(e.target.value)}>
            {INV_VENDORS.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="fld">
        <span>Note</span>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="PO #, job #…" />
      </label>

      {mode === 'in' ? (
        <div className="inv-invoice-box">
          <div className="inv-invoice-box-head">
            <Upload size={14} /> Invoice
          </div>
          <p className="inv-modal-hint" style={{ marginBottom: 10 }}>
            Attach the vendor invoice now, or leave it pending for later.
          </p>
          <label className="fld">
            <span>Invoice file</span>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
          {file ? (
            <div className="inv-file-chip">
              <FileText size={13} /> {file.name}
            </div>
          ) : null}
          <div className="inv-two">
            <label className="fld">
              <span>Invoice #</span>
              <input
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Vendor invoice #"
              />
            </label>
            <label className="fld">
              <span>Amount</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(e.target.value)}
              />
            </label>
          </div>
          {!hasInvoice ? (
            <label className="inv-check">
              <input
                type="checkbox"
                checked={markPending}
                onChange={(e) => setMarkPending(e.target.checked)}
              />
              Mark invoice as pending in the table
            </label>
          ) : (
            <div className="inv-inv-ready">Invoice will show on this item in the table.</div>
          )}
        </div>
      ) : null}
    </ModalShell>
  )
}

function NewItemModal({ onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_ITEM)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const locations = INV_LOCATIONS[form.country] || []
  const valid = form.name.trim().length > 1

  return (
    <ModalShell
      title="New inventory item"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" disabled={!valid} onClick={() => onSave(form)}>
            Create item
          </button>
        </>
      }
    >
      <div className="inv-two">
        <label className="fld">
          <span>SKU</span>
          <input value={form.sku} onChange={(e) => set('sku', e.target.value)} placeholder="3M-8518" />
        </label>
        <label className="fld">
          <span>Category</span>
          <select value={form.category} onChange={(e) => set('category', e.target.value)}>
            {INV_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="fld">
        <span>Name</span>
        <input
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="3M 8518 Gloss Overlaminate"
          autoFocus
        />
      </label>
      <div className="inv-two">
        <label className="fld">
          <span>Brand</span>
          <input value={form.brand} onChange={(e) => set('brand', e.target.value)} />
        </label>
        <label className="fld">
          <span>Color</span>
          <input value={form.color} onChange={(e) => set('color', e.target.value)} />
        </label>
      </div>
      <div className="inv-two">
        <label className="fld">
          <span>Country</span>
          <select
            value={form.country}
            onChange={(e) => {
              const next = e.target.value
              set('country', next)
              set('location', (INV_LOCATIONS[next] || [])[0] || '')
            }}
          >
            {INV_COUNTRIES.filter((c) => c.id !== 'all').map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="fld">
          <span>Location</span>
          <select value={form.location} onChange={(e) => set('location', e.target.value)}>
            {locations.map((loc) => (
              <option key={loc}>{loc}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="inv-two">
        <label className="fld">
          <span>Opening rolls</span>
          <input value={form.rolls} onChange={(e) => set('rolls', e.target.value)} />
        </label>
        <label className="fld">
          <span>Cost / roll</span>
          <input value={form.costPerRoll} onChange={(e) => set('costPerRoll', e.target.value)} />
        </label>
      </div>
      <label className="fld">
        <span>Vendor</span>
        <select value={form.vendor} onChange={(e) => set('vendor', e.target.value)}>
          {INV_VENDORS.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </label>
      <label className="fld">
        <span>Note</span>
        <input value={form.note} onChange={(e) => set('note', e.target.value)} />
      </label>
    </ModalShell>
  )
}

function InvoiceModal({ item, onClose, onSave }) {
  const [file, setFile] = useState(null)
  const [number, setNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [vendor, setVendor] = useState(item?.vendor || '')
  const [note, setNote] = useState('')

  if (!item) return null

  return (
    <ModalShell
      title={`Attach invoice — ${item.sku}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!file}
            onClick={() => onSave({ file, number, amount, vendor, note })}
          >
            Save invoice
          </button>
        </>
      }
    >
      <label className="fld">
        <span>Invoice file</span>
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </label>
      {file ? (
        <div className="inv-file-chip">
          <FileText size={13} /> {file.name}
        </div>
      ) : null}
      <div className="inv-two">
        <label className="fld">
          <span>Invoice #</span>
          <input value={number} onChange={(e) => setNumber(e.target.value)} />
        </label>
        <label className="fld">
          <span>Amount</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
      </div>
      <label className="fld">
        <span>Vendor</span>
        <select value={vendor} onChange={(e) => setVendor(e.target.value)}>
          {INV_VENDORS.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </label>
      <label className="fld">
        <span>Note</span>
        <input value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
    </ModalShell>
  )
}
