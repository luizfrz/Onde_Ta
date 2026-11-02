import type { Now } from "./time";

export type Holiday = { month: number; day: number; name: string; optional?: boolean };

function easter(year: number): Date {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

const shift = (base: Date, days: number, name: string, optional = false): Holiday => {
  const d = new Date(base.getTime() + days * 86400000);
  return { month: d.getUTCMonth() + 1, day: d.getUTCDate(), name, optional };
};

/** Feriados nacionais, estaduais (CE), de Fortaleza e pontos facultativos. */
export function holidaysOf(year: number): Holiday[] {
  const e = easter(year);
  return [
    { month: 1, day: 1, name: "Confraternização Universal" },
    shift(e, -48, "Carnaval (ponto facultativo)", true),
    shift(e, -47, "Carnaval (ponto facultativo)", true),
    { month: 3, day: 25, name: "Data Magna do Ceará" },
    shift(e, -2, "Sexta-feira Santa"),
    { month: 4, day: 21, name: "Tiradentes" },
    { month: 5, day: 1, name: "Dia do Trabalhador" },
    shift(e, 60, "Corpus Christi (ponto facultativo)", true),
    { month: 8, day: 15, name: "Assunção de Nossa Senhora (Fortaleza)" },
    { month: 9, day: 7, name: "Independência do Brasil" },
    { month: 10, day: 12, name: "Nossa Senhora Aparecida" },
    { month: 11, day: 2, name: "Finados" },
    { month: 11, day: 15, name: "Proclamação da República" },
    { month: 11, day: 20, name: "Consciência Negra" },
    { month: 12, day: 25, name: "Natal" },
  ];
}

export function holidayOn(year: number, month: number, day: number): Holiday | undefined {
  return holidaysOf(year).find((h) => h.month === month && h.day === day);
}

/** Feriado hoje e amanhã (fuso de Fortaleza). */
export function holidayAlerts(now: Now) {
  const t = new Date(Date.UTC(now.year, now.month - 1, now.day + 1));
  return {
    today: holidayOn(now.year, now.month, now.day),
    tomorrow: holidayOn(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()),
  };
}
