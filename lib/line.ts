import { PATH } from "./path";

export type Stop = { name: string; lat: number; lng: number; offset: number; spots: string[] };

/**
 * Paradas principais da linha Fortaleza → Guaramiranga.
 * `offset` = minutos estimados de viagem desde Fortaleza (tempos de rodovia do OpenStreetMap, aproximados).
 */
export const line: Stop[] = [
  { name: "Fortaleza", lat: -3.7319, lng: -38.5267, offset: 0, spots: ["Centro de Fortaleza", "Aldeota"] },
  { name: "Maranguape", lat: -3.8905, lng: -38.6835, offset: 37, spots: ["Rodoviária de Maranguape"] },
  { name: "Palmácia", lat: -4.1403, lng: -38.8483, offset: 97, spots: ["Rodoviária de Palmácia"] },
  { name: "Pacoti", lat: -4.2217, lng: -38.9211, offset: 140, spots: ["Centro de Pacoti"] },
  { name: "Guaramiranga", lat: -4.2636, lng: -38.9322, offset: 160, spots: [] },
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
