"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { line } from "@/lib/line";
import type { ActiveTrip } from "@/lib/trips";

const busIcon = L.divIcon({ className: "bus-pin", html: "🚌", iconSize: [34, 34], iconAnchor: [17, 17] });

export default function BusMap({ trips }: { trips: ActiveTrip[] }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const buses = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, { scrollWheelZoom: false });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 18,
    }).addTo(m);
    const pts = line.map((s) => [s.lat, s.lng] as [number, number]);
    L.polyline(pts, { color: "#0f766e", weight: 4, opacity: 0.7, dashArray: "6 8" }).addTo(m);
    line.filter((s) => s.main).forEach((s) =>
      L.circleMarker([s.lat, s.lng], { radius: 7, color: "#0f766e", fillColor: "#fff", fillOpacity: 1, weight: 3 })
        .bindTooltip(s.name, { permanent: true, direction: "right", offset: [8, 0] })
        .addTo(m),
    );
    m.fitBounds(L.latLngBounds(pts), { padding: [30, 30] });
    buses.current = L.layerGroup().addTo(m);
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const g = buses.current;
    if (!g) return;
    g.clearLayers();
    trips.forEach((t) =>
      L.marker(t.pos, { icon: busIcon, zIndexOffset: 1000 })
        .bindPopup(`<b>${t.label}</b><br>Saída ${t.departure} · chegada prev. ${t.arrival}<br>${Math.round(t.progress * 100)}% do trajeto`)
        .addTo(g),
    );
  }, [trips]);

  return <div ref={el} className="z-0 h-80 rounded-xl bg-card shadow-[0_8px_24px_var(--shadow)] sm:h-105" />;
}
