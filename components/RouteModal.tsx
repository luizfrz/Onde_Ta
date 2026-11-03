"use client";

import { useRef } from "react";
import { legs, line, totalKm } from "@/lib/line";
import { routes } from "@/lib/routes";

const hm = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}` : `${m}min`);

function LegInfo({ leg }: { leg: (typeof legs)[number] }) {
  return (
    <div className="mt-2.5 rounded-lg border border-dashed border-line px-3 py-2 text-[.8rem] text-muted">
      <div className="font-semibold text-ink">
        até {leg.to} · {leg.km} km · ~{hm(leg.min)}
      </div>
      <div className="mt-0.5">Via {leg.via.join(" → ")}</div>
    </div>
  );
}

export default function RouteModal() {
  const ref = useRef<HTMLDialogElement>(null);
  const total = line[line.length - 1].offset;

  return (
    <>
      <button
        onClick={() => ref.current?.showModal()}
        className="mb-3.5 flex cursor-pointer items-center gap-2 rounded-full border border-brand bg-surface px-4 py-2 text-sm font-semibold text-accent transition hover:bg-brand hover:text-white"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        Onde ele pode passar e rotas?
      </button>

      <dialog
        ref={ref}
        onClick={(e) => e.target === ref.current && ref.current?.close()}
        className="m-auto w-[min(92vw,560px)] rounded-2xl border border-line bg-card p-0 text-ink shadow-2xl backdrop:bg-black/50"
      >
        <div className="max-h-[85vh] overflow-y-auto p-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl font-bold">Onde ele pode passar e rotas?</h3>
            <button onClick={() => ref.current?.close()} aria-label="Fechar" className="grid size-8 flex-none cursor-pointer place-items-center rounded-full bg-line text-lg leading-none">
              ×
            </button>
          </div>

          <p className="mt-3 rounded-lg bg-info-bg px-3.5 py-2.5 text-[.85rem] text-info-text">
            <b>Rota estimada.</b> O traçado sai de Fortaleza pelas avenidas até Maranguape e segue pela rodovia <b>CE-065</b> até Guaramiranga (cerca de {totalKm} km, ~{hm(total)} de Fortaleza a
            Guaramiranga). O trajeto real do ônibus pode variar.
          </p>

          <h4 className="mt-5 mb-3 text-sm font-semibold tracking-[.08em] text-muted uppercase">Paradas</h4>
          <ol className="relative ml-2 border-l-2 border-dashed border-brand/40 pl-5">
            {line.map((s) => (
              <li key={s.name} className="relative pb-5 last:pb-0">
                <span className="absolute top-1 -left-[1.82rem] size-3 rounded-full border-2 border-brand bg-surface" />
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <b>{s.name}</b>
                  <span className="text-[.8rem] text-muted tabular-nums">{s.offset === 0 ? "saída" : `~${hm(s.offset)} de Fortaleza`}</span>
                </div>
                {s.spots.length > 0 && (
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {s.spots.map((p) => (
                      <li key={p.name} className="rounded-full bg-next-bg px-2.5 py-0.5 text-[.8rem]">
                        {p.name}
                        <span className="text-muted tabular-nums"> · {p.offset === 0 ? "saída" : `~${hm(p.offset)} de Fortaleza`}</span>
                        {p.source === "osm" && <span className="text-muted"> · OSM</span>}
                      </li>
                    ))}
                  </ul>
                )}
                {legs.find((l) => l.from === s.name) && (
                  <LegInfo leg={legs.find((l) => l.from === s.name)!} />
                )}
              </li>
            ))}
          </ol>
        </div>
      </dialog>
    </>
  );
}
