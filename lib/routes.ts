export type Departure = {
  time: string; // "HH:MM"
  note?: string;
  noSunday?: boolean;
};

export type BusRoute = {
  id: string;
  from: string;
  to: string;
  /** Minutes from Fortaleza along the line (see lib/line.ts) */
  fromOffset: number;
  toOffset: number;
  departures: Departure[];
};

const t = (time: string, extra: Partial<Departure> = {}): Departure => ({ time, ...extra });

export const routes: BusRoute[] = [
  {
    id: "palmacia-fortaleza",
    fromOffset: 97,
    toOffset: 0,
    from: "Palmácia",
    to: "Fortaleza",
    departures: [
      t("04:30"),
      t("05:30"),
      t("06:30", { noSunday: true }),
      t("09:30"),
      t("10:20"),
      t("12:00", { noSunday: true }),
      t("13:00"),
      t("14:40"),
      t("17:20"),
    ],
  },
  {
    id: "fortaleza-palmacia",
    fromOffset: 0,
    toOffset: 97,
    from: "Centro de Fortaleza",
    to: "Palmácia",
    departures: [
      t("06:40"),
      t("08:50", { noSunday: true }),
      t("12:00"),
      t("13:50", { noSunday: true }),
      t("17:20"),
    ],
  },
  {
    id: "guaramiranga-fortaleza",
    fromOffset: 160,
    toOffset: 0,
    from: "Guaramiranga",
    to: "Fortaleza",
    departures: [t("04:30"), t("09:00"), t("11:20"), t("16:00")],
  },
  {
    id: "pacoti-fortaleza",
    fromOffset: 140,
    toOffset: 0,
    from: "Pacoti",
    to: "Fortaleza",
    departures: [t("05:00"), t("09:30"), t("12:00"), t("16:30")],
  },
  {
    id: "fortaleza-guaramiranga",
    fromOffset: 0,
    toOffset: 160,
    from: "Fortaleza",
    to: "Guaramiranga",
    departures: [t("05:00"), t("08:00"), t("12:40"), t("16:00")],
  },
];
