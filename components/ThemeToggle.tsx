"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const svg = {
  viewBox: "0 0 24 24",
  width: 20,
  height: 20,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };

  const dark = theme === "dark";

  return (
    <button
      onClick={toggle}
      role="switch"
      aria-checked={dark}
      aria-label="Alternar modo escuro"
      title={dark ? "Modo claro" : "Modo escuro"}
      className="grid size-10 cursor-pointer place-items-center rounded-full border border-line bg-surface text-ink shadow-sm transition hover:scale-105 hover:shadow-md active:scale-95"
    >
      {dark ? (
        <svg {...svg} className="text-amber-300">
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg {...svg} className="text-brand">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" fill="currentColor" fillOpacity=".15" />
        </svg>
      )}
    </button>
  );
}
