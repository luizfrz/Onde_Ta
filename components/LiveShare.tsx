"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const BusMap = dynamic(() => import("./BusMap"), { ssr: false, loading: () => <div className="h-80 rounded-xl bg-card sm:h-105" /> });

const PREFIX = "ondeta-";
type Msg = { lat: number; lng: number; t: number };

export default function LiveShare() {
  const ref = useRef<HTMLDialogElement>(null);
  const stop = useRef<() => void>(() => {});
  const [mode, setMode] = useState<"idle" | "share" | "watch">("idle");
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [viewers, setViewers] = useState(0);
  const [pos, setPos] = useState<Msg | null>(null);
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [t, setT] = useState(0);

  const close = () => {
    stop.current();
    stop.current = () => {};
    setMode("idle");
    setOpen(false);
    setLink(null);
    setViewers(0);
    setPos(null);
    setMsg("");
    if (ref.current?.open) ref.current.close();
  };

  const startShare = async () => {
    setMsg("");
    if (!navigator.geolocation) return setMsg("Este aparelho não tem localização.");
    const { Peer } = await import("peerjs");
    const id = crypto.randomUUID();
    const peer = new Peer(PREFIX + id);
    const conns = new Set<{ send: (m: Msg) => void }>();
    let last: Msg | null = null;
    peer.on("open", () => setLink(`${location.origin}${location.pathname}?ao-vivo=${id}`));
    peer.on("error", (e) => setMsg(`Falha de conexão (${e.type}). Tente de novo.`));
    peer.on("connection", (c) => {
      c.on("open", () => {
        conns.add(c);
        setViewers(conns.size);
        if (last) c.send(last);
      });
      c.on("close", () => {
        conns.delete(c);
        setViewers(conns.size);
      });
    });
    const watch = navigator.geolocation.watchPosition(
      (p) => {
        last = { lat: p.coords.latitude, lng: p.coords.longitude, t: Date.now() };
        setPos(last);
        conns.forEach((c) => c.send(last!));
      },
      (e) => setMsg(e.code === e.PERMISSION_DENIED ? "Permissão de localização negada." : "Não consegui obter a localização."),
      { enableHighAccuracy: true },
    );
    const lock = navigator.wakeLock?.request("screen").catch(() => null);
    stop.current = () => {
      navigator.geolocation.clearWatch(watch);
      peer.destroy();
      lock?.then((l) => l?.release());
    };
  };

  const startWatch = async (id: string) => {
    const { Peer } = await import("peerjs");
    const peer = new Peer();
    peer.on("open", () => {
      const c = peer.connect(PREFIX + id);
      c.on("data", (d) => {
        setPos(d as Msg);
        setMsg("");
      });
      c.on("close", () => setMsg("O compartilhamento foi encerrado."));
    });
    peer.on("error", (e) => setMsg(e.type === "peer-unavailable" ? "Esse link não está mais ativo." : `Falha de conexão (${e.type}).`));
    stop.current = () => peer.destroy();
  };

  useEffect(() => {
    const id = new URLSearchParams(location.search).get("ao-vivo");
    if (id && /^[\w-]{8,64}$/.test(id)) {
      setMode("watch");
      startWatch(id);
    }
    return () => stop.current();
  }, []);

  useEffect(() => {
    if (mode === "idle") return;
    ref.current?.showModal();
    setOpen(true);
    const id = setInterval(() => setT(Date.now()), 1000);
    return () => clearInterval(id);
  }, [mode]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link!);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
    }
  };

  const ago = pos ? Math.max(0, Math.round((t - pos.t) / 1000)) : 0;
  const btn = "w-full cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition";

  return (
    <>
      <button
        onClick={() => setMode("share")}
        className="mx-auto mb-3.5 flex cursor-pointer items-center gap-2 rounded-full border border-brand bg-surface px-4 py-2 text-sm font-semibold text-accent transition hover:bg-brand hover:text-white"
      >
        Veja onde estou
      </button>

      <dialog
        ref={ref}
        onClose={close}
        onClick={(e) => e.target === ref.current && ref.current?.close()}
        className="m-auto w-[min(94vw,520px)] overflow-hidden rounded-2xl border border-line bg-card p-0 text-ink shadow-2xl backdrop:bg-black/50"
      >
        <div className="max-h-[90vh] overflow-y-auto p-5">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl font-bold">{mode === "watch" ? "Localização ao vivo" : "Veja onde estou"}</h3>
            <button onClick={() => ref.current?.close()} aria-label="Fechar" className="grid size-8 flex-none cursor-pointer place-items-center rounded-full bg-line text-lg leading-none">
              ×
            </button>
          </div>

          {open && pos && (
            <div className="mt-3">
              <BusMap bus={[pos.lat, pos.lng]} />
              <p className="mt-2 text-[.85rem] font-semibold text-accent">{ago < 60 ? `Ao vivo · atualizado há ${ago}s` : "Sem atualização há mais de 1 min"}</p>
            </div>
          )}

          {mode === "watch" && !pos && !msg && <p className="mt-3 text-muted">Aguardando a localização…</p>}

          {mode === "share" && (
            <div className="mt-3">
              {link ? (
                <>
                  <p className="text-[.85rem] text-muted">
                    Mande o link para quem vai te acompanhar. Mantenha esta aba aberta: ao fechar, o compartilhamento para.
                  </p>
                  <pre className="mt-3 rounded-lg bg-info-bg px-3.5 py-2.5 font-sans text-[.8rem] break-all whitespace-pre-wrap text-info-text select-all">{link}</pre>
                  <p className="mt-2 text-[.85rem] font-semibold">{viewers} {viewers === 1 ? "pessoa vendo" : "pessoas vendo"}{!pos && " · buscando sua localização…"}</p>
                  <div className="mt-3 flex flex-col gap-2">
                    <button onClick={copy} className={`${btn} bg-brand text-white hover:opacity-90`} aria-live="polite">
                      {copied ? "Copiado!" : "Copiar link"}
                    </button>
                    <button onClick={() => ref.current?.close()} className={`${btn} border border-line hover:border-brand`}>
                      Parar de compartilhar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[.85rem] text-muted">
                    Compartilha sua localização em tempo real direto com quem receber o link, sem passar por servidor. Só fica ativo enquanto esta aba estiver aberta, e você pode parar quando quiser.
                  </p>
                  <button onClick={startShare} className={`${btn} mt-3 bg-brand text-white hover:opacity-90`}>
                    Começar a compartilhar
                  </button>
                </>
              )}
            </div>
          )}

          {msg && <p className="mt-3 rounded-lg bg-info-bg px-3 py-2 text-[.85rem] text-info-text" role="alert">{msg}</p>}
        </div>
      </dialog>
    </>
  );
}
