import { PATH } from "./path";

export type Spot = { name: string; offset: number; source: "informado" | "osm" };
export type Stop = { name: string; lat: number; lng: number; offset: number; spots: Spot[] };

/**
 * Paradas principais da linha Fortaleza → Guaramiranga.
 * `offset` = minutos estimados de viagem desde Fortaleza (tempos de rodovia do OpenStreetMap, aproximados).
 */
export const line: Stop[] = [
  {
    name: "Fortaleza",
    lat: -3.7319,
    lng: -38.5267,
    offset: 0,
    spots: [
      { name: "Centro de Fortaleza", offset: 0, source: "informado" },
      { name: "Aldeota", offset: 0, source: "informado" },
      { name: "Rodoviária Eng. João Tomé (Av. Borges de Melo, 1630)", offset: 0, source: "informado" },
      { name: "Ginásio Poliesportivo da Parangaba (embarque via Palmácia)", offset: 0, source: "informado" },
    ],
  },
  {
    name: "Maranguape",
    lat: -3.88287,
    lng: -38.67773,
    offset: 35,
    spots: [
      { name: "Rodoviária de Maranguape", offset: 35, source: "informado" },
      { name: "Paradas no centro (OpenStreetMap)", offset: 35, source: "osm" },
    ],
  },
  { name: "Palmácia", lat: -4.14697, lng: -38.84897, offset: 85, spots: [{ name: "Rodoviária de Palmácia", offset: 85, source: "informado" }] },
  { name: "Pacoti", lat: -4.22493, lng: -38.92047, offset: 124, spots: [{ name: "Centro de Pacoti", offset: 124, source: "informado" }] },
  {
    name: "Guaramiranga",
    lat: -4.26109,
    lng: -38.92923,
    offset: 138,
    spots: [
      { name: "Rodoviária (Agência Fretcar)", offset: 138, source: "osm" },
      { name: "Parada de ônibus na CE-065", offset: 138, source: "osm" },
    ],
  },
];

/** Trechos entre paradas, com as vias principais (OpenStreetMap). Valores aproximados. */
export const legs = [
  {
    from: "Fortaleza",
    to: "Maranguape",
    km: 25,
    min: 35,
    via: ["Av. José Bastos", "Av. Américo Barreira", "Av. Augusto dos Anjos", "Av. General Osório de Paiva", "CE-065 (Av. Senador Almir Pinto)"],
  },
  { from: "Maranguape", to: "Palmácia", km: 47, min: 50, via: ["CE-065 (Rod. Senador Carlos Jereissati)"] },
  { from: "Palmácia", to: "Pacoti", km: 19, min: 39, via: ["CE-065 (Rod. Senador Carlos Jereissati)"] },
  { from: "Pacoti", to: "Guaramiranga", km: 8, min: 15, via: ["CE-065"] },
];

export const PATH_LINE = PATH;

const dist = (a: [number, number], b: [number, number]) =>
  Math.hypot(b[0] - a[0], (b[1] - a[1]) * Math.cos((a[0] * Math.PI) / 180)) * 111_000;

const cum: number[] = [0];
for (let i = 1; i < PATH.length; i++) cum.push(cum[i - 1] + dist(PATH[i - 1], PATH[i]));

/** Distância (m) ao longo do trajeto do ponto mais próximo de cada parada. */
const stopDist = line.map((s) => {
  let best = 0;
  let bd = Infinity;
  PATH.forEach((p, i) => {
    const d = dist([s.lat, s.lng], p);
    if (d < bd) {
      bd = d;
      best = i;
    }
  });
  return cum[best];
});

export const totalKm = Math.round(cum[cum.length - 1] / 1000);

function pointAtDistance(d: number): [number, number] {
  for (let i = 1; i < PATH.length; i++) {
    if (d <= cum[i]) {
      const f = (d - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
      return [PATH[i - 1][0] + (PATH[i][0] - PATH[i - 1][0]) * f, PATH[i - 1][1] + (PATH[i][1] - PATH[i - 1][1]) * f];
    }
  }
  return PATH[PATH.length - 1];
}

/** Posição estimada (sobre a estrada) após `offset` minutos desde Fortaleza. */
export function positionAt(offset: number): [number, number] {
  for (let i = 0; i < line.length - 1; i++) {
    const a = line[i];
    const b = line[i + 1];
    if (offset <= b.offset) {
      const f = (offset - a.offset) / (b.offset - a.offset);
      return pointAtDistance(stopDist[i] + (stopDist[i + 1] - stopDist[i]) * f);
    }
  }
  return PATH[PATH.length - 1];
}

/** Cidades usadas no filtro (paradas principais da linha). */
export const cities = line.map((s) => ({ name: s.name, offset: s.offset }));

/** Cidades por onde a rota passa, entre a origem e o destino. */
export function routeCities(fromOffset: number, toOffset: number) {
  const lo = Math.min(fromOffset, toOffset);
  const hi = Math.max(fromOffset, toOffset);
  return cities.filter((c) => c.offset >= lo && c.offset <= hi).map((c) => c.name);
}
