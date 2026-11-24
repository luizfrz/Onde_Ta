"use client";

import { useState } from "react";
import HelpGroup from "./HelpGroup";
import LiveShare from "./LiveShare";
import RouteModal from "./RouteModal";
import InstallButton from "./InstallButton";

export default function Menu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Menu"
        aria-expanded={open}
        className="grid size-10 cursor-pointer place-items-center rounded-full border border-line bg-surface text-ink shadow-sm transition hover:scale-105 active:scale-95"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d={open ? "M6 6l12 12M18 6L6 18" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>
      {/* hidden (not unmounted) so the dialogs inside keep working when the menu closes */}
      <div hidden={!open} className="absolute right-0 mt-2 flex w-max flex-col items-stretch gap-2 rounded-2xl border border-line bg-card p-3 shadow-xl">
        <LiveShare />
        <RouteModal />
        <HelpGroup />
        <InstallButton />
      </div>
    </div>
  );
}
