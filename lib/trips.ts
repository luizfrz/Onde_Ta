import { routes } from "./routes";
import { runsToday, toMinutes, type Now } from "./time";
import { positionAt } from "./line";

export type ActiveTrip = {
  key: string;
  label: string;
  departure: string;
  arrival: string;
  progress: number;
  pos: [number, number];
};

const hhmm = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(Math.round(m % 60)).padStart(2, "0")}`;

/** Ônibus em viagem agora, com posição estimada pelo horário de saída. */
export function activeTrips(now: Now): ActiveTrip[] {
  const cur = now.minutes + now.seconds / 60;
  const out: ActiveTrip[] = [];
  for (const r of routes) {
    const dur = Math.abs(r.toOffset - r.fromOffset);
    for (const d of r.departures) {
      if (!runsToday(d, now.isSunday)) continue;
      const start = toMinutes(d.time);
      if (cur < start || cur > start + dur) continue;
      const progress = (cur - start) / dur;
      const offset = r.fromOffset + (r.toOffset - r.fromOffset) * progress;
      out.push({
        key: `${r.id}-${d.time}`,
        label: `${r.from} → ${r.to}`,
        departure: d.time,
        arrival: hhmm(start + dur),
        progress,
        pos: positionAt(offset),
      });
    }
  }
  return out;
}
