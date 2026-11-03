"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { holidayAlerts, type Holiday } from "@/lib/holidays";
import { serraWarning, useWeather } from "@/lib/weather";
import { routes } from "@/lib/routes";
import { cities, routeCities } from "@/lib/line";
import RouteModal from "./RouteModal";
import { countdown, formatCountdown, getNow, nextDeparture, runsToday, toHHMM, toMinutes, type Now } from "@/lib/time";

const BusMap = dynamic(() => import("./BusMap"), {
  ssr: false,
  loading: () => <div className="h-80 rounded-xl bg-card sm:h-105" />,
});

const sectionTitle =
  "mt-10 mb-6 text-center text-[1.6rem] font-bold text-ink after:mx-auto after:mt-2.5 after:block after:h-1 after:w-12 after:rounded after:bg-mint after:content-['']";

const HOT_ABOVE = 33;

function HeatAlert({ temp }: { temp: number }) {
  return (
    <div
      className="flex items-start gap-3.5 rounded-xl border border-l-[6px] border-red-300 border-l-red-500 bg-gradient-to-r from-red-50 to-orange-50 px-4.5 py-4 shadow-[0_4px_14px_rgba(239,68,68,.15)] dark:border-red-900 dark:border-l-red-500 dark:from-red-950 dark:to-orange-950"
      role="alert"
    >
      <div className="grid size-11 flex-none place-items-center rounded-full bg-red-500 text-2xl text-white" aria-hidden="true">
        🌡️
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
          <span className="rounded-full bg-red-500 px-2 py-0.5 text-[.68rem] font-bold tracking-[.08em] text-white uppercase">Calor</span>
          <strong className="text-[1.05rem] text-red-900 dark:text-red-200">Muito quente: {Math.round(temp)}°C</strong>
        </div>
        <p className="mt-1 text-[.88rem] text-red-800 dark:text-red-300">
          Cuidado com o calor: beba bastante água, evite ficar muito tempo no sol à espera do ônibus e redobre a atenção com
          crianças, idosos e pessoas com problemas de saúde.
        </p>
      </div>
    </div>
  );
}

function RainAlert({ reason }: { reason: string }) {
  return (
    <div
      className="flex items-start gap-3.5 rounded-xl border border-l-[6px] border-cyan-300 border-l-cyan-600 bg-gradient-to-r from-cyan-50 to-sky-50 px-4.5 py-4 shadow-[0_4px_14px_rgba(8,145,178,.15)] dark:border-cyan-900 dark:border-l-cyan-500 dark:from-cyan-950 dark:to-sky-950"
      role="alert"
    >
      <div className="grid size-11 flex-none place-items-center rounded-full bg-cyan-600 text-2xl text-white" aria-hidden="true">
        🌧️
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
          <span className="rounded-full bg-cyan-600 px-2 py-0.5 text-[.68rem] font-bold tracking-[.08em] text-white uppercase">Serra</span>
          <strong className="text-[1.05rem] text-cyan-900 dark:text-cyan-200">{reason}</strong>
        </div>
        <p className="mt-1 text-[.88rem] text-cyan-800 dark:text-cyan-300">
          Chuva deixa a CE-065 mais lenta em Pacoti e Guaramiranga. A Topic pode atrasar nesses trechos.
        </p>
      </div>
    </div>
  );
}

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
          <strong className="text-[1.05rem] text-al-title">
            {holiday.city ? `Feriado em ${holiday.city}` : "Feriado"}: {holiday.name}
          </strong>
        </div>
        <p className="mt-1 text-[.88rem] text-al-text">
          {holiday.city
            ? `Feriado municipal: os horários de ${holiday.city} podem ser alterados.`
            : holiday.optional
            ? "Ponto facultativo: os horários podem ser alterados."
            : "Pode haver mudança nos horários ou ônibus sem circular."}{" "}
          Confirme com a  empresa antes de sair. 
        </p>
      </div>
    </div>
  );
}

export default function BusBoard() {
  const [now, setNow] = useState<Now | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const weatherData = useWeather();
  const weather = weatherData?.local ?? null;

  useEffect(() => {
    setNow(getNow());
    const id = setInterval(() => setNow(getNow()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return <p className="text-center text-muted">Carregando horários…</p>;

  const clock = `${String(Math.floor(now.minutes / 60)).padStart(2, "0")}:${String(now.minutes % 60).padStart(2, "0")}`;

  const { today, tomorrow } = holidayAlerts(now);
  const serraAlert = weatherData ? serraWarning(weatherData.serra) : null;
  const cityOffset = city ? (cities.find((c) => c.name === city)?.offset ?? null) : null;
  const visible = routes.filter((r) => !city || routeCities(r.fromOffset, r.toOffset).includes(city));

  const statusItem = "flex flex-col gap-0.5 p-3 sm:px-5 sm:py-4 not-first:border-l not-first:border-line";
  const statusLabel = "text-[.72rem] tracking-[.08em] text-muted uppercase";
  const statusValue = "text-[1.1rem] font-bold tabular-nums sm:text-2xl";

  return (
    <>
      <div className="relative z-30 -mt-14 grid grid-cols-3 overflow-hidden rounded-xl bg-surface shadow-[0_10px_30px_var(--shadow)]">
        <div className={statusItem}>
          <span className={statusLabel}>Agora</span>
          <strong className={statusValue}>{clock}</strong>
        </div>
        <div className={statusItem}>
          <span className={statusLabel}>Hoje</span>
          <strong className={statusValue}>{now.isSunday ? "Domingo" : "Dia normal"}</strong>
        </div>
        <div className={statusItem}>
          <span className={statusLabel}>{weatherData?.located ? "Temperatura · sua localização" : "Temperatura · Fortaleza"}</span>
          <strong className={`${statusValue} ${weather && weather.temp > HOT_ABOVE ? "text-red-500" : ""}`}>
            {weather ? `${Math.round(weather.temp)}°C` : "—"}
          </strong>
          {weather && <span className="text-[.7rem] text-muted">sensação {Math.round(weather.feels)}°C</span>}
        </div>
      </div>

      {((weather && weather.temp > HOT_ABOVE) || serraAlert || today.length > 0 || tomorrow.length > 0) && (
        <div className="mt-5 grid gap-3">
          {weather && weather.temp > HOT_ABOVE && <HeatAlert temp={weather.temp} />}
          {serraAlert && <RainAlert reason={serraAlert} />}
          {today.map((h) => <HolidayAlert key={h.name} when="Hoje" holiday={h} />)}
          {tomorrow.map((h) => <HolidayAlert key={h.name} when="Amanhã" holiday={h} />)}
        </div>
      )}

      <section className="mt-2 mb-5" id="mapa">
        <h2 className={sectionTitle}>Mapa da linha</h2>
        <RouteModal />
        <div className="relative">
          <BusMap />
          <div className="absolute top-3 right-3 z-500 flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-[.78rem] font-semibold text-ink shadow-md">
            <i className="inline-block h-1.5 w-5 rounded-full bg-brand" />
            Trajeto pela CE-065
          </div>
        </div>
      </section>

      <h2 className={sectionTitle} id="horarios">
        Horários
      </h2>
      <div className="mb-6 rounded-xl border border-info-line bg-info-bg px-4.5 py-4 text-center text-info-text" role="note">
        <div className="flex items-center justify-center gap-2">
          <svg className="flex-none text-blue-500" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <b className="text-[1.05rem]">Atenção!</b>
        </div>
        <p className="mt-1 text-[.92rem]">Confira no grupo se horário informado está circulando.</p>
      </div>
      <div className="-mt-2 mb-6 flex flex-wrap justify-center gap-2" role="group" aria-label="Filtrar por cidade">
        {[null, ...cities.map((c) => c.name)].map((c) => (
          <button
            key={c ?? "todas"}
            onClick={() => setCity(c)}
            aria-pressed={city === c}
            className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              city === c ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink hover:border-brand"
            }`}
          >
            {c ?? "Todas"}
          </button>
        ))}
      </div>
      {visible.length === 0 && <p className="text-center text-muted">Nenhuma rota para esta cidade.</p>}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
        {visible.map((r) => {
          // com uma cidade escolhida, mostra o horário estimado de saída/passagem/chegada nela
          const delta = cityOffset === null ? 0 : Math.abs(cityOffset - r.fromOffset);
          const deps = delta === 0 ? r.departures : r.departures.map((d) => ({ ...d, time: toHHMM(toMinutes(d.time) + delta) }));
          const next = nextDeparture(deps, now);
          const ref = next ?? deps[0];
          const orig = r.departures[deps.indexOf(ref)];
          const dayHint = next ? "" : " (amanhã)";
          const cityLine =
            cityOffset === null
              ? null
              : delta === 0
                ? `Sai de ${city} às ${ref.time}${dayHint}`
                : `${cityOffset === r.toOffset ? "Chega em" : "Passa por"} ${city} por volta de ${ref.time}${dayHint} · sai de ${r.from} às ${orig.time} (+${delta} min)`;
          const c = next && countdown(next, now);
          const soon = !!c && c.total <= 600;
          return (
            <section key={r.id} className="flex flex-col overflow-hidden rounded-xl bg-card shadow-[0_8px_24px_var(--shadow)]">
              <header className="flex items-center gap-2.5 bg-brand px-4.5 py-3.5 text-[.95rem] font-semibold text-white">
                <span className="max-w-[40%] flex-none leading-tight">{r.from}</span>
                <span className="track relative h-0.5 min-w-6 flex-1" aria-hidden="true" />
                <span className="max-w-[40%] flex-none leading-tight">{r.to}</span>
              </header>

              {cityLine && <p className="mx-4.5 mt-3 text-[.82rem] font-semibold text-accent">{cityLine}</p>}

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
                      Primeira de amanhã: <b>{deps[0].time}</b>
                    </span>
                  </>
                )}
              </div>

              <ul className="flex flex-wrap gap-2 px-4.5 pb-4.5">
                {deps.map((d) => {
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
