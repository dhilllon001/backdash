import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const defaultIcon = L.divIcon({
  className: 'bd-map-pin',
  html: '<span class="bd-map-pin-dot"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

const activeIcon = L.divIcon({
  className: 'bd-map-pin active',
  html: '<span class="bd-map-pin-dot"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

export function LocationMap({
  pings = [],
  activeId = null,
  onSelect,
  className = '',
  fitPadding = [28, 28],
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false,
    }).setView([43.7315, -79.7624], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)

    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    const onResize = () => map.invalidateSize()
    window.addEventListener('resize', onResize)
    const t = setTimeout(() => map.invalidateSize(), 80)

    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', onResize)
      map.remove()
      mapRef.current = null
      layerRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return

    layer.clearLayers()
    const latLngs = []

    pings.forEach((p) => {
      if (p.lat == null || p.lng == null) return
      const ll = L.latLng(p.lat, p.lng)
      latLngs.push(ll)
      const marker = L.marker(ll, {
        icon: p.id === activeId ? activeIcon : defaultIcon,
        title: p.label || p.address || 'Location',
      })
      marker.on('click', () => onSelect?.(p.id))
      marker.bindTooltip(
        `<strong>${p.time || ''}</strong><br/>${p.address || p.label || ''}<br/><span class="mono">${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}</span>`,
        { direction: 'top', opacity: 0.95 },
      )
      layer.addLayer(marker)
    })

    if (latLngs.length > 1) {
      const line = L.polyline(latLngs, {
        color: '#2B4FD3',
        weight: 3,
        opacity: 0.65,
        dashArray: '4 6',
      })
      layer.addLayer(line)
      map.fitBounds(L.latLngBounds(latLngs).pad(0.2), { padding: fitPadding })
    } else if (latLngs.length === 1) {
      map.setView(latLngs[0], 15)
    }

    setTimeout(() => map.invalidateSize(), 40)
  }, [pings, activeId, onSelect, fitPadding])

  return <div ref={containerRef} className={`bd-map ${className}`} />
}
