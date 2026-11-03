import type { Departure } from "./routes";

export type Now = { minutes: number; seconds: number; isSunday: boolean; year: number; month: number; day: number };

const fmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Fortaleza",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

export function getNow(date = new Date()): Now {
  const p = Object.fromEntries(fmt.formatToParts(date).map((x) => [x.type, x.value]));
  return {
    minutes: Number(p.hour) * 60 + Number(p.minute),
    seconds: Number(p.second),
    isSunday: p.weekday === "Sun",
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
  };
}

export const toHHMM = (m: number) =>
  `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export const runsToday = (d: Departure, isSunday: boolean) => !(isSunday && d.noSunday);

/** Next departure today, or null if none are left. */
export function nextDeparture(deps: Departure[], now: Now) {
  return (
    deps.find((d) => runsToday(d, now.isSunday) && toMinutes(d.time) * 60 >= now.minutes * 60 + now.seconds) ??
    null
  );
}

export function countdown(d: Departure, now: Now) {
  const total = toMinutes(d.time) * 60 - (now.minutes * 60 + now.seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return { total, h, m, s };
}

export function formatCountdown(c: { total: number; h: number; m: number; s: number }) {
  if (c.total < 60) return `${c.s}s`;
  if (c.h > 0) return `${c.h}h ${String(c.m).padStart(2, "0")}min`;
  return `${c.m}min ${String(c.s).padStart(2, "0")}s`;
}
