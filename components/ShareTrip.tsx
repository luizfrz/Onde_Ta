"use client";

import { useRef, useState } from "react";
import { line } from "@/lib/line";
import type { BusRoute } from "@/lib/routes";
import { toHHMM, toMinutes } from "@/lib/time";

export default function ShareTrip({ r, time, tomorrow }: { r: BusRoute; time: string; tomorrow: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  const spots = line.find((c) => c.name === r.from)?.spots.filter((s) => s.source === "informado").map((s) => s.name) ?? [];
  const arrival = toHHMM(toMinutes(time) + Math.abs(r.toOffset - r.fromOffset));
  const text = [
    `🚌 Estou indo de ${r.from} para ${r.to}${tomorrow ? " amanhã" : ""}.`,
    `Saída: ${time} · chegada estimada: ~${arrival} (pode atrasar).`,
    spots.length ? `Embarque: ${spots.join(" / ")}.` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard bloqueado (http ou permissão): o texto continua selecionável no cartão
    }
  };

  const btn = "cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition";

  return (
    <>
      <button
        onClick={() => ref.current?.showModal()}
        className="w-full cursor-pointer rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-semibold text-ink transition hover:border-brand"
      >
        Compartilhar viagem
      </button>

      <dialog
        ref={ref}
        onClick={(e) => e.target === ref.current && ref.current?.close()}
        className="m-auto w-[min(92vw,420px)] rounded-2xl border border-line bg-card p-0 text-ink shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Compartilhar viagem</h3>
              <p className="mt-0.5 text-[.85rem] text-muted">Avise quem vai te buscar no destino.</p>
            </div>
            <button onClick={() => ref.current?.close()} aria-label="Fechar" className="grid size-8 flex-none cursor-pointer place-items-center rounded-full bg-line text-lg leading-none">
              ×
            </button>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-line">
            <div className="flex items-center gap-2.5 bg-brand px-4 py-3 text-[.95rem] font-semibold text-white">
              <span>{r.from}</span>
              <span className="h-0.5 flex-1 rounded bg-white/50" aria-hidden="true" />
              <span>{r.to}</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-line bg-next-bg text-center">
              <div className="p-3">
                <div className="text-[.7rem] tracking-[.08em] text-muted uppercase">Saída{tomorrow && " (amanhã)"}</div>
                <strong className="text-2xl tabular-nums text-accent">{time}</strong>
              </div>
              <div className="p-3">
                <div className="text-[.7rem] tracking-[.08em] text-muted uppercase">Chegada ~</div>
                <strong className="text-2xl tabular-nums text-accent">{arrival}</strong>
              </div>
            </div>
            {spots.length > 0 && (
              <p className="border-t border-line px-4 py-3 text-[.85rem]">
                <span className="text-muted">📍 Embarque: </span>
                {spots.join(" / ")}
              </p>
            )}
          </div>

          <pre className="mt-3 rounded-lg bg-info-bg px-3.5 py-2.5 font-sans text-[.82rem] whitespace-pre-wrap text-info-text select-all">{text}</pre>

          <div className="mt-4">
            <button onClick={copy} className={`${btn} w-full bg-brand text-white hover:opacity-90`} aria-live="polite">
              {copied ? "✅ Copiado!" : "📋 Copiar mensagem"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
