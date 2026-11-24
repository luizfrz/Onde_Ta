"use client";

import { useRef, useState } from "react";
import { line } from "@/lib/line";
import type { BusRoute } from "@/lib/routes";
import { getNow, toHHMM, toMinutes } from "@/lib/time";

export default function ShareTrip({ r, time, tomorrow }: { r: BusRoute; time: string; tomorrow: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  const spots = line.find((c) => c.name === r.from)?.spots.filter((s) => s.source === "informado").map((s) => s.name) ?? [];
  const arrival = toHHMM(toMinutes(time) + Math.abs(r.toOffset - r.fromOffset));
  const n = getNow();
  const dia = new Date(Date.UTC(n.year, n.month - 1, n.day + (tomorrow ? 1 : 0))).toISOString().slice(0, 10);
  const link = `${location.origin}${location.pathname}?viagem=${r.id}&saida=${time}&dia=${dia}`;
  const text = [
    `Estou indo de ${r.from} para ${r.to}${tomorrow ? " amanhã" : ""}.`,
    `Saída: ${time} · chegada estimada: ~${arrival} (pode atrasar).`,
    spots.length ? `Embarque: ${spots.join(" / ")}.` : "",
    `Acompanhe: ${link}`,
  ]
    .filter(Boolean)
    .join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
    }
  };

  const shareImage = async () => {
    const W = 900, top = 440, rowH = 52;
    const H = top + (spots.length ? 110 + spots.length * rowH : 0) + 140;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d")!;
    const brand = getComputedStyle(document.documentElement).getPropertyValue("--blue").trim() || "#1d4ed8";
    const font = (w: number, px: number) => (g.font = `${w} ${px}px system-ui, sans-serif`);
    const text_ = (t: string, x: number, y: number, color: string, align: CanvasTextAlign = "center", max?: number) => {
      g.fillStyle = color;
      g.textAlign = align;
      g.fillText(t, x, y, max);
    };
    g.textBaseline = "middle";
    g.fillStyle = "#fff";
    g.fillRect(0, 0, W, H);

    g.fillStyle = brand;
    g.fillRect(0, 0, W, 250);
    font(600, 24);
    text_("MINHA VIAGEM DE TOPIC", W / 2, 50, "rgba(255,255,255,.8)");
    font(700, 50);
    text_(r.from, 50, 140, "#fff", "left", 330);
    text_(r.to, W - 50, 140, "#fff", "right", 330);
    g.fillStyle = "#fff";
    g.fillRect(W / 2 - 60, 138, 100, 5);
    g.beginPath();
    g.moveTo(W / 2 + 30, 124);
    g.lineTo(W / 2 + 60, 140);
    g.lineTo(W / 2 + 30, 156);
    g.fill();
    if (tomorrow) {
      font(600, 24);
      text_("AMANHÃ", W / 2, 205, "rgba(255,255,255,.85)");
    }

    // time cards overlapping the header
    [[50, "Saída", time], [W / 2 + 15, "Chegada estimada", arrival]].forEach(([x, label, v]) => {
      const w = W / 2 - 65;
      g.fillStyle = "#fff";
      g.shadowColor = "rgba(0,0,0,.18)";
      g.shadowBlur = 20;
      g.beginPath();
      g.roundRect(x as number, 210, w, 190, 24);
      g.fill();
      g.shadowColor = "transparent";
      font(600, 24);
      text_(String(label).toUpperCase(), (x as number) + w / 2, 255, "#64748b");
      font(800, 100);
      text_(String(v), (x as number) + w / 2, 330, brand);
    });

    if (spots.length) {
      font(700, 26);
      text_("LOCAL DE EMBARQUE", 50, top + 40, "#64748b", "left");
      spots.forEach((name, i) => {
        const y = top + 80 + i * rowH;
        g.fillStyle = brand;
        g.beginPath();
        g.arc(66, y + rowH / 2 - 4, 9, 0, Math.PI * 2);
        g.fill();
        font(600, 34);
        text_(name, 96, y + rowH / 2 - 4, "#0f172a", "left", W - 150);
      });
    }

    font(400, 22);
    text_("Horário estimado, pode atrasar", W / 2, H - 92, "#64748b");
    font(700, 24);
    text_("Onde está a Topic?", W / 2, H - 58, brand);
    font(400, 20);
    text_("Desenvolvido por Luiz França", W / 2, H - 26, "#94a3b8");

    const blob = await new Promise<Blob | null>((res) => c.toBlob(res, "image/png"));
    if (!blob) return;
    const file = new File([blob], "viagem.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text });
      } catch {
        // user cancelled
      }
      return;
    }
    // shortcut: no native file share (desktop), so download the image instead
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "viagem.png";
    a.click();
    URL.revokeObjectURL(a.href);
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
                <span className="text-muted">Embarque: </span>
                {spots.join(" / ")}
              </p>
            )}
          </div>

          <pre className="mt-3 rounded-lg bg-info-bg px-3.5 py-2.5 font-sans text-[.82rem] whitespace-pre-wrap text-info-text select-all">{text}</pre>

          <div className="mt-4 grid gap-2">
            <button onClick={shareImage} className={`${btn} w-full bg-brand text-white hover:opacity-90`}>
              Compartilhar como imagem
            </button>
            <button onClick={copy} className={`${btn} w-full border border-line hover:border-brand`} aria-live="polite">
              {copied ? "Copiado!" : "Copiar mensagem"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
