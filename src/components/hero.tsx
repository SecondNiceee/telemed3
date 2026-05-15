import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20 bg-background">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 animate-gradient opacity-60"
        style={{
          background: "linear-gradient(135deg, oklch(0.52 0.28 300 / 0.08) 0%, oklch(0.58 0.25 320 / 0.05) 25%, transparent 50%, oklch(0.45 0.18 285 / 0.06) 75%, oklch(0.52 0.28 300 / 0.08) 100%)",
          backgroundSize: "400% 400%",
        }}
        aria-hidden="true"
      />

      {/* Animated blob shapes */}
      <div
        className="pointer-events-none absolute -top-20 -left-20 w-[500px] h-[500px] opacity-40 animate-blob animate-pulse-glow"
        style={{
          background: "radial-gradient(circle, oklch(0.52 0.28 300 / 0.25) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 -right-32 w-[400px] h-[400px] opacity-30 animate-blob animate-float-slow"
        style={{
          background: "radial-gradient(circle, oklch(0.58 0.25 320 / 0.3) 0%, transparent 70%)",
          filter: "blur(50px)",
          animationDelay: "-5s",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/3 w-[350px] h-[350px] opacity-25 animate-blob"
        style={{
          background: "radial-gradient(circle, oklch(0.45 0.18 285 / 0.25) 0%, transparent 70%)",
          filter: "blur(50px)",
          animationDelay: "-3s",
        }}
        aria-hidden="true"
      />

      {/* Decorative lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" aria-hidden="true">
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.52 0.28 300)" stopOpacity="0" />
            <stop offset="50%" stopColor="oklch(0.52 0.28 300)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="oklch(0.52 0.28 300)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path 
          d="M0,100 Q400,50 800,150 T1600,100" 
          fill="none" 
          stroke="url(#line-gradient)" 
          strokeWidth="1"
          className="animate-line-draw"
        />
        <path 
          d="M0,300 Q500,250 1000,350 T2000,300" 
          fill="none" 
          stroke="url(#line-gradient)" 
          strokeWidth="1"
          className="animate-line-draw"
          style={{ animationDelay: "0.5s" }}
        />
      </svg>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, oklch(0.52 0.28 300 / 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, oklch(0.52 0.28 300 / 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left side - Text content */}
          <div className="flex flex-col gap-6">
            <span 
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-xs font-bold tracking-[0.15em] uppercase text-primary border border-primary/20 bg-primary/5 backdrop-blur-sm w-fit animate-fade-up shadow-sm shadow-primary/10" 
              style={{ animationDelay: "0.05s" }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              SmartCardio
            </span>

            <h1 
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-foreground leading-[1.05] tracking-[-0.03em] animate-fade-up" 
              style={{ animationDelay: "0.1s" }}
            >
              <span className="text-balance">Телемедицина</span>
              <br />
              <span className="gradient-text">нового поколения</span>
            </h1>

            <p 
              className="text-lg sm:text-xl text-muted-foreground max-w-lg leading-relaxed animate-fade-up" 
              style={{ animationDelay: "0.15s" }}
            >
              Профессиональные консультации кардиологов и терапевтов онлайн. Без очередей и ожидания.
            </p>

            <div 
              className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-up" 
              style={{ animationDelay: "0.2s" }}
            >
              <Link
                href="/appointment"
                className="group inline-flex items-center justify-center gap-2.5 text-[15px] font-semibold text-primary-foreground bg-primary px-8 py-4 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                Записаться на приём
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Trust indicators */}
            <div 
              className="flex items-center gap-6 pt-6 animate-fade-up" 
              style={{ animationDelay: "0.25s" }}
            >
              <div className="flex -space-x-3">
                {[1,2,3,4].map((i) => (
                  <div 
                    key={i} 
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-background flex items-center justify-center text-xs font-semibold text-primary"
                  >
                    {["АК", "МВ", "ЕС", "ДП"][i-1]}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <span className="font-semibold text-foreground">10 000+</span>
                <span className="text-muted-foreground"> довольных пациентов</span>
              </div>
            </div>
          </div>

          {/* Right side - Video placeholder */}
          <div className="relative animate-fade-up" style={{ animationDelay: "0.3s" }}>
            {/* Floating decorative elements */}
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 animate-float" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-xl bg-primary/5 border border-primary/10 animate-float-delayed" />
            
            <div className="relative aspect-video rounded-3xl bg-card border border-border/60 shadow-2xl shadow-primary/10 overflow-hidden group">
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 group-hover:opacity-80 transition-opacity" />
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 animate-shimmer opacity-50" />
              
              {/* Play button placeholder */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="relative">
                  {/* Pulse ring */}
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                  <div className="relative w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/50 transition-all duration-300 cursor-pointer backdrop-blur-sm">
                    <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
                  </div>
                </div>
                <span className="mt-4 text-muted-foreground text-sm font-medium">Смотреть видео</span>
              </div>

              {/* Corner decorations */}
              <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-primary/20 rounded-tl-2xl" />
              <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-primary/20 rounded-br-2xl" />
              
              {/* Grid pattern inside */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `radial-gradient(circle at center, oklch(0.52 0.28 300 / 0.1) 1px, transparent 1px)`,
                  backgroundSize: "20px 20px",
                }}
              />
            </div>

            {/* Floating stat cards */}
            <div className="absolute -right-4 top-1/4 glass rounded-2xl p-4 shadow-xl animate-float hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">⚡</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">15 мин</div>
                  <div className="text-xs text-muted-foreground">среднее время</div>
                </div>
              </div>
            </div>

            <div className="absolute -left-4 bottom-1/4 glass rounded-2xl p-4 shadow-xl animate-float-delayed hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">⭐</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">4.9</div>
                  <div className="text-xs text-muted-foreground">рейтинг врачей</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
