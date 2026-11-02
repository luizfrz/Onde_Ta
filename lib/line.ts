export type Stop = { name: string; lat: number; lng: number; offset: number; main?: boolean };

/**
 * Linha Fortaleza → Guaramiranga. `offset` = minutos estimados de viagem desde Fortaleza.
 * Coordenadas e tempos são aproximados (sem GPS real).
 */
export const line: Stop[] = [
  { name: "Centro de Fortaleza", lat: -3.7319, lng: -38.5267, offset: 0, main: true },
  { name: "Maracanaú", lat: -3.8767, lng: -38.6256, offset: 25 },
  { name: "Maranguape", lat: -3.8914, lng: -38.6828, offset: 45 },
  { name: "Palmácia", lat: -4.1403, lng: -38.8483, offset: 90, main: true },
  { name: "Pacoti", lat: -4.2217, lng: -38.9211, offset: 115, main: true },
  { name: "Guaramiranga", lat: -4.2636, lng: -38.9322, offset: 130, main: true },
];

export function positionAt(offset: number): [number, number] {
  for (let i = 0; i < line.length - 1; i++) {
    const a = line[i];
    const b = line[i + 1];
    if (offset <= b.offset) {
      const f = (offset - a.offset) / (b.offset - a.offset);
      return [a.lat + (b.lat - a.lat) * f, a.lng + (b.lng - a.lng) * f];
    }
  }
  const last = line[line.length - 1];
  return [last.lat, last.lng];
}
