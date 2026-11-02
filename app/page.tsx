import BusBoard from "@/components/BusBoard";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <>
      <div className="relative z-10 flex items-center justify-end px-6 py-2.5">
        <ThemeToggle />
      </div>

      <section className="relative min-h-70 overflow-hidden bg-hero px-4 pt-12 pb-14 text-white sm:px-6 sm:pt-18 sm:pb-28">
        <div className="mx-auto max-w-275 sm:pl-[4vw]">
          <div>
            <h1 className="text-[clamp(1.6rem,4.5vw,2.4rem)] leading-[1.35] font-medium tracking-[.12em] uppercase">
              Onde está
              <br />
              a Topic?
            </h1>
            <p className="mt-3 max-w-xl text-base font-medium tracking-[.03em] text-white sm:text-xl">
              Confira os horários e acompanhe a rota da Topic de forma rápida e prática.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-275 px-4 pb-6">
        <BusBoard />
      </main>
    </>
  );
}
