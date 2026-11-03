import { useEffect, useState } from "react";

export type Hour = { hour: number; prob: number; mm: number };

export type Place = {
  temp: number;
  feels: number;
  code: number;
  precipNow: number;
  max: number;
  min: number;
  rainChance: number;
  rainMm: number;
  hours: Hour[];
};

/** `local` = onde a pessoa está (ou Fortaleza, se a localização não foi liberada); `serra` = Pacoti/Guaramiranga. */
export type Weather = { local: Place; serra: Place; located: boolean };

const FORTALEZA: [number, number] = [-3.73, -38.53];
const SERRA: [number, number] = [-4.22, -38.92];

const url = ([la, lo]: [number, number]) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${la},${SERRA[0]}&longitude=${lo},${SERRA[1]}` +
  "&current=temperature_2m,apparent_temperature,weather_code,precipitation" +
  "&hourly=precipitation_probability,precipitation" +
  "&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum" +
  "&forecast_days=2&timezone=auto";

type Raw = {
  current: { time: string; temperature_2m: number; apparent_temperature: number; weather_code: number; precipitation: number };
  hourly: { time: string[]; precipitation_probability: number[]; precipitation: number[] };
  daily: { temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_probability_max: number[]; precipitation_sum: number[] };
};

function parse(r: Raw): Place {
  const start = Math.max(0, r.hourly.time.findIndex((t) => t >= r.current.time.slice(0, 13)));
  const hours: Hour[] = [];
  for (let i = start; i < Math.min(start + 8, r.hourly.time.length); i++) {
    hours.push({
      hour: Number(r.hourly.time[i].slice(11, 13)),
      prob: r.hourly.precipitation_probability[i] ?? 0,
      mm: r.hourly.precipitation[i] ?? 0,
    });
  }
  return {
    temp: r.current.temperature_2m,
    feels: r.current.apparent_temperature,
    code: r.current.weather_code,
    precipNow: r.current.precipitation,
    max: r.daily.temperature_2m_max[0],
    min: r.daily.temperature_2m_min[0],
    rainChance: r.daily.precipitation_probability_max[0] ?? 0,
    rainMm: r.daily.precipitation_sum[0] ?? 0,
    hours,
  };
}

export function useWeather(): Weather | null {
  const [data, setData] = useState<Weather | null>(null);
  const [coords, setCoords] = useState<[number, number] | null>(null);

  // pede a localização uma vez; se negar, usa Fortaleza. Arredonda (~1 km) antes de enviar.
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords([Math.round(p.coords.latitude * 100) / 100, Math.round(p.coords.longitude * 100) / 100]),
      () => {},
      { timeout: 10_000, maximumAge: 10 * 60 * 1000 },
    );
  }, []);

  useEffect(() => {
    const load = () =>
      fetch(url(coords ?? FORTALEZA))
        .then((r) => r.json())
        .then((d: Raw[]) => setData({ local: parse(d[0]), serra: parse(d[1]), located: coords !== null }))
        .catch(() => setData(null));
    load();
    const id = setInterval(load, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [coords]);

  return data;
}

/** Descrição e emoji do código WMO. */
export function describe(code: number): { label: string; icon: string } {
  if (code === 0) return { label: "Céu limpo", icon: "☀️" };
  if (code === 1) return { label: "Poucas nuvens", icon: "🌤️" };
  if (code === 2) return { label: "Parcialmente nublado", icon: "⛅" };
  if (code === 3) return { label: "Nublado", icon: "☁️" };
  if (code === 45 || code === 48) return { label: "Neblina", icon: "🌫️" };
  if (code >= 51 && code <= 57) return { label: "Garoa", icon: "🌦️" };
  if (code >= 61 && code <= 67) return { label: "Chuva", icon: "🌧️" };
  if (code >= 80 && code <= 82) return { label: "Pancadas de chuva", icon: "🌧️" };
  if (code >= 95) return { label: "Tempestade", icon: "⛈️" };
  return { label: "Tempo instável", icon: "🌥️" };
}

const WET = (code: number) => (code >= 51 && code <= 67) || (code >= 80 && code <= 99);

/** Retorna o aviso só quando está chovendo de fato na serra (Pacoti/Guaramiranga). */
export function serraWarning(p: Place): string | null {
  return WET(p.code) || p.precipNow > 0 ? "Chove agora na serra" : null;
}
