import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Decorative blurred shapes */}
      <div
        className="pointer-events-none absolute top-0 left-1/4 w-[500px] h-[500px] opacity-30"
        style={{
          background: "radial-gradient(circle, oklch(0.55 0.20 280 / 0.4) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-20 right-1/4 w-[400px] h-[400px] opacity-25"
        style={{
          background: "radial-gradient(circle, oklch(0.60 0.25 320 / 0.35) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        aria-hidden="true"
      />
      
      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, oklch(0.50 0.15 305 / 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, oklch(0.50 0.15 305 / 0.06) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left side - Text content */}
          <div className="flex flex-col gap-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-[0.15em] uppercase text-primary border border-primary/25 bg-primary/8 w-fit animate-fade-up" style={{ animationDelay: "0.05s" }}>
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              SmartCardio
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.08] tracking-[-0.03em] animate-fade-up" style={{ animationDelay: "0.1s" }}>
              <span className="text-balance">Телемедицина</span>
              <br />
              <span className="text-primary">нового поколения</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-lg leading-relaxed animate-fade-up" style={{ animationDelay: "0.15s" }}>
              Профессиональные консультации кардиологов и терапевтов онлайн. Без очередей и ожидания.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <Link
                href="/appointment"
                className="inline-flex items-center justify-center gap-2 text-[15px] font-semibold text-primary-foreground bg-primary px-8 py-4 rounded-xl shadow-lg shadow-primary/25 hover:brightness-110 hover:shadow-primary/40 transition-all duration-200"
              >
                Записаться на приём
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right side - Video placeholder */}
          <div className="relative animate-fade-up" style={{ animationDelay: "0.25s" }}>
            <div className="aspect-video rounded-2xl bg-card border border-border shadow-2xl shadow-primary/10 overflow-hidden flex items-center justify-center relative">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
              
              {/* Play button placeholder */}
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                  <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
                </div>
                <span className="text-muted-foreground text-sm font-medium">Видео</span>
              </div>

              {/* Corner decorations */}
              <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-primary/20 rounded-tl-lg" />
              <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-primary/20 rounded-br-lg" />
            </div>

            {/* Decorative dots */}
            <div className="absolute -bottom-4 -left-4 w-24 h-24 opacity-50" style={{
              backgroundImage: "radial-gradient(circle, oklch(0.50 0.28 305 / 0.3) 2px, transparent 2px)",
              backgroundSize: "12px 12px"
            }} />
          </div>

        </div>
      </div>
    </section>
  );
}
