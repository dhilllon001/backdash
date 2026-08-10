export function Chip({ tone = 'neutral', children, xs }) {
  return (
    <span className={`chip ${tone}${xs ? ' xs' : ''}`}>
      <i />
      {children}
    </span>
  )
}

export function Kpi({ label, value, unit, sub, alert }) {
  return (
    <div className={`kpi${alert ? ' alert' : ''}`}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-val">
        <span className="n">{value}</span>
        {unit ? <span className="unit">{unit}</span> : null}
      </div>
      {sub ? <div className="kpi-sub">{sub}</div> : null}
    </div>
  )
}
