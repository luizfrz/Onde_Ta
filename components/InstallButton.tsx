"use client";

import { useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void> };

export default function InstallButton() {
  const [evt, setEvt] = useState<InstallEvent | null>(null);

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
  return (
    <button
      onClick={() => evt.prompt().then(() => setEvt(null))}
      className="mr-3 cursor-pointer rounded-full border border-brand bg-surface px-4 py-2 text-sm font-semibold text-accent transition hover:bg-brand hover:text-white"
    >
      Instalar app
    </button>
  );
}
