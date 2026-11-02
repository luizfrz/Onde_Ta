<h1 align="center">Onde está a Topic?</h1>


<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-20232A?logo=react&logoColor=61DAFB" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img alt="Leaflet" src="https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&logoColor=white" />
  <img alt="OpenStreetMap" src="https://img.shields.io/badge/OpenStreetMap-Mapa-7EBC6F?logo=openstreetmap&logoColor=white" />
  <img alt="Montserrat" src="https://img.shields.io/badge/Montserrat-Fonte-4285F4?logo=googlefonts&logoColor=white" />
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-22-5FA04E?logo=nodedotjs&logoColor=white" />
</p>

## Como rodar

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev      # desenvolvimento em http://localhost:3000
```

## Estrutura

```
app/
  layout.tsx        fonte, metadados e script do tema
  page.tsx          cabeçalho, banner e página principal
  globals.css       Tailwind, cores do tema claro/escuro
components/
  BusBoard.tsx      status, alertas, mapa e cartões de horário
  BusMap.tsx        mapa Leaflet com a linha e os ônibus em viagem
  ThemeToggle.tsx   botão de modo escuro
lib/
  routes.ts         horários de cada linha (edite aqui)
  line.ts           paradas, coordenadas e tempos de viagem
  trips.ts          calcula os ônibus em viagem agora
  holidays.ts       feriados nacionais, do Ceará e de Fortaleza
  time.ts           hora local de Fortaleza e contagem regressiva
docs/
  preview-*.png     imagens do README
```
