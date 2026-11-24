"use client";

import { useRef } from "react";

const GROUP = "https://chat.whatsapp.com/DPkVAvIaehO018Sa8EbiJx?s=cl&p=i&ilr=4&amv=1";

export default function HelpGroup() {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        onClick={() => dialog.current?.showModal()}
        className="cursor-pointer rounded-full border border-brand bg-surface px-4 py-2 text-sm font-semibold text-accent transition hover:bg-brand hover:text-white"
      >
        Tire sua dúvida no grupo
      </button>

      <dialog
        ref={dialog}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-auto w-[min(92vw,420px)] rounded-2xl border border-line bg-card p-0 text-ink shadow-2xl backdrop:bg-black/50"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl font-bold">Tire sua dúvida no grupo</h3>
            <button onClick={() => dialog.current?.close()} aria-label="Fechar" className="grid size-8 flex-none cursor-pointer place-items-center rounded-full bg-line text-lg leading-none">
              ×
            </button>
          </div>
          <p className="mt-2 text-[.9rem] text-muted">
            Quer saber se um horário ou rota está funcionando hoje? Pergunte no grupo do WhatsApp e quem usa a Topic todo dia pode te ajudar.
          </p>
          <div className="mt-6 flex flex-wrap justify-end gap-2.5">
            <button onClick={() => dialog.current?.close()} className="cursor-pointer rounded-full border border-line px-4 py-2 text-sm font-semibold">
              Agora não
            </button>
            <a href={GROUP} target="_blank" rel="noopener noreferrer" className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:brightness-110">
              Entrar no grupo
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}
