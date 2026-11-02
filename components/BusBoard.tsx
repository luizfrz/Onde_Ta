"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { holidayAlerts, type Holiday } from "@/lib/holidays";
import { activeTrips } from "@/lib/trips";
import { routes } from "@/lib/routes";
import { countdown, formatCountdown, getNow, nextDeparture, runsToday, toMinutes, type Now } from "@/lib/time";

const BusMap = dynamic(() => import("./BusMap"), {
  ssr: false,
  loading: () => <div className="h-80 rounded-xl bg-card sm:h-105" />,
});

const sectionTitle =
  "mt-10 mb-6 text-center text-[1.6rem] font-bold text-ink after:mx-auto after:mt-2.5 after:block after:h-1 after:w-12 after:rounded after:bg-mint after:content-['']";

function HolidayAlert({ when, holiday }: { when: "Hoje" | "Amanhã"; holiday: Holiday }) {
  return (
    <div
      className="flex items-start gap-3.5 rounded-xl border border-l-[6px] border-al-line border-l-amber-500 bg-gradient-to-r from-al-bg1 to-al-bg2 px-4.5 py-4 shadow-[0_4px_14px_rgba(245,158,11,.15)]"
      role="alert"
    >
      <div className="grid size-11 flex-none place-items-center rounded-full bg-amber-500 text-white" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
          <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[.68rem] font-bold tracking-[.08em] text-[#1c1100] uppercase">
            {when}
          </span>
          <strong className="text-[1.05rem] text-al-title">Feriado: {holiday.name}</strong>
        </div>
        <p className="mt-1 text-[.88rem] text-al-text">
          {holiday.optional
            ? "Ponto facultativo: os horários podem ser alterados."
            : "Pode haver mudança nos horários ou ônibus sem circular."}{" "}
          Confirme com a empresa antes de sair.
        </p>
      </div>
    </div>
  );
}

export default function BusBoard() {
  const [now, setNow] = useState<Now | null>(null);

  useEffect(() => {
    setNow(getNow());
    const id = setInterval(() => setNow(getNow()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return <p className="text-center text-muted">Carregando horários…</p>;

  const clock = `${String(Math.floor(now.minutes / 60)).padStart(2, "0")}:${String(now.minutes % 60).padStart(2, "0")}`;

  const { today, tomorrow } = holidayAlerts(now);
  const trips = activeTrips(now);

  const statusItem = "flex flex-col gap-0.5 p-3 sm:px-5 sm:py-4 not-first:border-l not-first:border-line";
  const statusLabel = "text-[.72rem] tracking-[.08em] text-muted uppercase";
  const statusValue = "text-[1.1rem] font-bold tabular-nums sm:text-2xl";

  return (
    <>
      <div className="relative z-30 -mt-14 grid grid-cols-3 overflow-hidden rounded-xl bg-surface shadow-[0_10px_30px_var(--shadow)]">
        <div className={statusItem}>
          <span className={statusLabel}>Agora em Fortaleza/CE</span>
          <strong className={statusValue}>{clock}</strong>
        </div>
        <div className={statusItem}>
          <span className={statusLabel}>Hoje</span>
          <strong className={statusValue}>{now.isSunday ? "Domingo" : "Dia normal"}</strong>
        </div>
        <div className={statusItem}>
          <span className={statusLabel}>Em viagem</span>
          <strong className={`${statusValue} ${trips.length ? "text-emerald-600" : ""}`}>
            {trips.length ? `${trips.length} ônibus` : "Nenhum"}
          </strong>
        </div>
      </div>

      {(today || tomorrow) && (
        <div className="mt-5 grid gap-3">
          {today && <HolidayAlert when="Hoje" holiday={today} />}
          {tomorrow && <HolidayAlert when="Amanhã" holiday={tomorrow} />}
        </div>
      )}

      <section className="mt-2 mb-5" id="mapa">
        <h2 className={sectionTitle}>Mapa da linha</h2>
        <div
          className="mb-3.5 flex items-center gap-3 rounded-xl border border-l-[6px] border-info-line border-l-blue-500 bg-info-bg px-4 py-3.5 text-info-text"
          role="note"
        >
          <svg className="flex-none text-blue-500" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <p className="text-[.92rem]">
            <b className="block text-[1.02rem]">Posição estimada pelo horário, não é GPS.</b> O ônibus no mapa é calculado a
            partir do horário de saída e pode diferir da localização real.
          </p>
        </div>
        <div className="relative">
          <BusMap trips={trips} />
          <div className="absolute top-3 right-3 z-500 flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-[.78rem] font-semibold text-ink shadow-md">
            <i className={`inline-block size-2.25 rounded-full ${trips.length ? "dot-live bg-emerald-500" : "bg-slate-400"}`} />
            {trips.length ? `${trips.length} em viagem` : "Sem ônibus em viagem"}
          </div>
        </div>
      </section>

      <h2 className={sectionTitle} id="horarios">
        Horários
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
        {routes.map((r) => {
          const next = nextDeparture(r.departures, now);
          const c = next && countdown(next, now);
          const soon = !!c && c.total <= 600;
          return (
            <section key={r.id} className="flex flex-col overflow-hidden rounded-xl bg-card shadow-[0_8px_24px_var(--shadow)]">
              <header className="flex items-center gap-2.5 bg-brand px-4.5 py-3.5 text-[.95rem] font-semibold text-white">
                <span className="max-w-[40%] flex-none leading-tight">{r.from}</span>
                <span className="track relative h-0.5 min-w-6 flex-1" aria-hidden="true" />
                <span className="max-w-[40%] flex-none leading-tight">{r.to}</span>
              </header>

              <div className={`mx-4.5 mt-4 mb-3 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 rounded-md p-3 ${soon ? "bg-soon-bg" : "bg-next-bg"}`}>
                {next && c ? (
                  <>
                    <span className="w-full text-[.7rem] tracking-[.08em] text-muted uppercase">Próximo ônibus</span>
                    <div className="flex flex-wrap items-baseline gap-2.5">
                      <strong className={`text-[2rem] font-bold tabular-nums ${soon ? "text-soon" : "text-accent"}`}>{next.time}</strong>
                      <span className={`font-semibold tabular-nums ${soon ? "text-soon" : ""}`}>em {formatCountdown(c)}</span>
                    </div>
                    {next.note && <span className="w-full text-[.85rem] text-muted">{next.note}</span>}
                  </>
                ) : (
                  <>
                    <span className="w-full text-[.7rem] tracking-[.08em] text-muted uppercase">Sem mais saídas hoje</span>
                    <span className="font-semibold">
                      Primeira de amanhã: <b>{r.departures[0].time}</b>
                    </span>
                  </>
                )}
              </div>

              <ul className="flex flex-wrap gap-2 px-4.5 pb-4.5">
                {r.departures.map((d) => {
                  const off = !runsToday(d, now.isSunday);
                  const past = !off && toMinutes(d.time) * 60 < now.minutes * 60 + now.seconds;
                  const isNext = next?.time === d.time;
                  return (
                    <li
                      key={d.time}
                      className={`flex flex-col rounded-md border px-2.5 py-1 tabular-nums ${
                        isNext ? "border-mint bg-cur-bg" : "border-line"
                      } ${off || past ? "opacity-45 dark:opacity-50" : ""} ${off ? "line-through" : ""}`}
                    >
                      <b>{d.time}</b>
                      {d.note && <small className="text-[.68rem] text-muted">{d.note}</small>}
                      {off && <small className="text-[.68rem] text-muted no-underline">não circula hoje</small>}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
