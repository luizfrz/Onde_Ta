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
    L.polyline(pts, { color: "#0f766e", weight: 4, opacity: 0.7, dashArray: "6 8" }).addTo(m);
    line.forEach((s) =>
      L.circleMarker([s.lat, s.lng], { radius: 7, color: "#0f766e", fillColor: "#fff", fillOpacity: 1, weight: 3 })
        .bindTooltip(s.name, { permanent: true, direction: "right", offset: [8, 0] })
        .addTo(m),
    );
    m.fitBounds(L.latLngBounds(pts), { padding: [30, 30] });
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
    };
  }, []);

  return <div ref={el} className="z-0 h-80 rounded-xl bg-card shadow-[0_8px_24px_var(--shadow)] sm:h-105" />;
}
