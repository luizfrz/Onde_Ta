"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { positionAt } from "@/lib/line";
import { routes, type BusRoute } from "@/lib/routes";
import { getNow, toMinutes } from "@/lib/time";

const BusMap = dynamic(() => import("./BusMap"), { ssr: false, loading: () => <div className="h-80 rounded-xl bg-card sm:h-105" /> });

type Trip = { route: BusRoute; start: number };

function readTrip(): Trip | null {
  const q = new URLSearchParams(location.search);
  const route = routes.find((r) => r.id === q.get("viagem"));
  const saida = q.get("saida") ?? "";
  const dia = q.get("dia") ?? "";
  if (!route || !/^\d\d:\d\d$/.test(saida) || !/^\d{4}-\d\d-\d\d$/.test(dia)) return null;
  const day = Date.parse(dia);
  return Number.isNaN(day) ? null : { route, start: day / 60000 + toMinutes(saida) };
}

const nowAbs = () => {
  const n = getNow();
  return Date.UTC(n.year, n.month - 1, n.day) / 60000 + n.minutes + n.seconds / 60;
};

const dur = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h${String(Math.round(m % 60)).padStart(2, "0")}` : `${Math.max(1, Math.round(m))} min`);

export default function TripTracker() {
  const ref = useRef<HTMLDialogElement>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [open, setOpen] = useState(false);
  const [t, setT] = useState(0);

  useEffect(() => setTrip(readTrip()), []);

  useEffect(() => {
    if (!trip) return;
    ref.current?.showModal();
    setOpen(true);
    setT(nowAbs());
    const id = setInterval(() => setT(nowAbs()), 5000);
    return () => clearInterval(id);
  }, [trip]);

  if (!trip) return null;
  const { route: r, start } = trip;
  const total = Math.abs(r.toOffset - r.fromOffset);
  const elapsed = t - start;
  const done = elapsed >= total;
  const waiting = elapsed < 0;
  const pct = Math.min(1, Math.max(0, elapsed / total));
  const dir = r.toOffset > r.fromOffset ? 1 : -1;
  const bus = positionAt(r.fromOffset + dir * pct * total);
  const status = done ? "Chegou ao destino" : waiting ? `Sai em ${dur(-elapsed)}` : "A caminho";
  const eta = done ? null : waiting ? `Chega em ~${dur(-elapsed + total)}` : `Chega em ~${dur(total - elapsed)}`;

  return (
    <dialog
      ref={ref}
      onClose={() => setOpen(false)}
      className="m-auto w-[min(94vw,520px)] overflow-hidden rounded-2xl border border-line bg-card p-0 text-ink shadow-2xl backdrop:bg-black/50"
    >
      <div className="relative">
        {open && <BusMap bus={bus} />}
        <button onClick={() => ref.current?.close()} aria-label="Fechar" className="absolute top-3 right-3 z-10 grid size-9 cursor-pointer place-items-center rounded-full bg-white text-xl leading-none text-black shadow-lg">
          ×
        </button>
      </div>

      <div className="-mt-4 rounded-t-2xl bg-card p-5 shadow-[0_-8px_24px_var(--shadow)] relative z-10">
        <div className="mx-auto mb-3 h-1 w-10 rounded bg-line" aria-hidden="true" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className={`rounded-full px-2.5 py-0.5 text-[.7rem] font-bold tracking-[.08em] uppercase ${done ? "bg-line text-muted" : "bg-brand text-white"}`}>{status}</span>
            <h3 className="mt-2 text-2xl font-bold tabular-nums">{eta ?? `Chegou em ${r.to}`}</h3>
          </div>
          <div className="text-right text-[.8rem] text-muted">
            Saída
            <div className="text-lg font-bold text-ink tabular-nums">{new Date(start * 60000).toISOString().slice(11, 16)}</div>
          </div>
        </div>

        <div className="mt-5" role="progressbar" aria-valuenow={Math.round(pct * 100)} aria-valuemin={0} aria-valuemax={100}>
          <div className="relative h-1.5 rounded bg-line">
            <div className="h-full rounded bg-brand transition-all duration-1000" style={{ width: `${pct * 100}%` }} />
            <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-brand bg-card transition-all duration-1000" style={{ left: `${pct * 100}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-[.85rem] font-semibold">
            <span>{r.from}</span>
            <span>{r.to}</span>
          </div>
        </div>

        <p className="mt-4 rounded-lg bg-info-bg px-3 py-2 text-[.78rem] text-info-text">
          Posição <b>estimada pelo horário</b>, não é GPS. O ônibus real pode atrasar ou adiantar.
        </p>
      </div>
    </dialog>
  );
}
