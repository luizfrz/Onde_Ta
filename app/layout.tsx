import type { Metadata, Viewport } from "next";
import "@fontsource/montserrat/latin-300.css";
import "@fontsource/montserrat/latin-400.css";
import "@fontsource/montserrat/latin-500.css";
import "@fontsource/montserrat/latin-600.css";
import "@fontsource/montserrat/latin-700.css";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "Onde está a Topic?",
  description: "Horários do ônibus Palmácia, Guaramiranga, Pacoti e Fortaleza, com contagem para a próxima saída.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0b5fb8" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="manifest" href={`${base}/manifest.webmanifest`} />
        <link rel="icon" href={`${base}/icon-192.png`} type="image/png" />
        <link rel="apple-touch-icon" href={`${base}/apple-touch-icon.png`} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Topic" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(!t)t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-page font-sans leading-normal text-ink antialiased">{children}
        <PwaRegister />
      </body>
    </html>
  );
}
