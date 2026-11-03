"use client";

import { useEffect, useRef, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void> };

const reasons = [
  { icon: "⚡", title: "Abre mais rápido", text: "Fica na tela inicial do celular, como qualquer aplicativo, sem digitar o endereço." },
  { icon: "📶", title: "Funciona sem internet", text: "Mostra os horários da última vez que você abriu, mesmo na serra, onde o sinal costuma falhar." },
  { icon: "🪶", title: "Leve e sem loja", text: "Não precisa de Play Store nem cadastro, e quase não ocupa espaço no aparelho." },
  { icon: "🔄", title: "Sempre atualizado", text: "Quando há mudança de horário, o app se atualiza sozinho na próxima vez que abrir com internet." },
];

export default function InstallButton() {
  const [evt, setEvt] = useState<InstallEvent | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as InstallEvent);
    };
    const onInstalled = () => setEvt(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!evt) return null;

  const install = () => {
    dialog.current?.close();
    evt.prompt().then(() => setEvt(null));
  };

  return (
    <>
      <button
        onClick={() => dialog.current?.showModal()}
        className="mr-3 cursor-pointer rounded-full border border-brand bg-surface px-4 py-2 text-sm font-semibold text-accent transition hover:bg-brand hover:text-white"
      >
        Instalar app
      </button>

      <dialog
        ref={dialog}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-auto w-[min(92vw,460px)] rounded-2xl border border-line bg-card p-0 text-ink shadow-2xl backdrop:bg-black/50"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl font-bold">Instalar o app da Topic?</h3>
            <button onClick={() => dialog.current?.close()} aria-label="Fechar" className="grid size-8 flex-none cursor-pointer place-items-center rounded-full bg-line text-lg leading-none">
              ×
            </button>
          </div>
          <p className="mt-2 text-[.9rem] text-muted">
            Instalar não baixa nada pesado: é o próprio site salvo no seu aparelho, para consultar os horários com mais facilidade.
          </p>

          <ul className="mt-4 grid gap-3">
            {reasons.map((r) => (
              <li key={r.title} className="flex items-start gap-3">
                <span className="grid size-9 flex-none place-items-center rounded-lg bg-next-bg text-lg" aria-hidden="true">
                  {r.icon}
                </span>
                <div>
                  <b className="text-[.95rem]">{r.title}</b>
                  <p className="text-[.85rem] text-muted">{r.text}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap justify-end gap-2.5">
            <button onClick={() => dialog.current?.close()} className="cursor-pointer rounded-full border border-line px-4 py-2 text-sm font-semibold">
              Agora não
            </button>
            <button onClick={install} className="cursor-pointer rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:brightness-110">
              Instalar agora
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
