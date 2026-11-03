"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { line, PATH_LINE } from "@/lib/line";

export default function BusMap() {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, { scrollWheelZoom: false });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 18,
    }).addTo(m);
    const pts = PATH_LINE;
    L.polyline(pts, { color: "#fff", weight: 9, opacity: 0.9, lineCap: "round", lineJoin: "round" }).addTo(m);
    L.polyline(pts, { color: "#0b5fb8", weight: 5, opacity: 0.95, lineCap: "round", lineJoin: "round" }).addTo(m);
    line.forEach((s) =>
      L.circleMarker([s.lat, s.lng], { radius: 7, color: "#0f766e", fillColor: "#fff", fillOpacity: 1, weight: 3 })
        .bindTooltip(s.name, { permanent: true, direction: "right", offset: [8, 0] })
        .addTo(m),
    );
    // rótulo "CE-065" sobre o trecho Maranguape → Palmácia
    const mid: [number, number] = [(line[1].lat + line[2].lat) / 2, (line[1].lng + line[2].lng) / 2];
    const onRoad = pts.reduce((best, p) => (Math.hypot(p[0] - mid[0], p[1] - mid[1]) < Math.hypot(best[0] - mid[0], best[1] - mid[1]) ? p : best));
    L.tooltip({ permanent: true, direction: "left", offset: [-8, 0], className: "ce065-label" }).setLatLng(onRoad).setContent("CE-065").addTo(m);
    m.fitBounds(L.latLngBounds(pts), { padding: [30, 30] });
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
    };
  }, []);

  return <div ref={el} className="z-0 h-80 rounded-xl bg-card shadow-[0_8px_24px_var(--shadow)] sm:h-105" />;
}
