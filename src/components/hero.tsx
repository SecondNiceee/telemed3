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

      {/* ECG Animation Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* ECG Line 1 - Top */}
        <svg 
          className="absolute w-[200%] h-32 top-[15%] opacity-20"
          viewBox="0 0 1200 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="ecg-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.52 0.28 300)" stopOpacity="0" />
              <stop offset="20%" stopColor="oklch(0.52 0.28 300)" stopOpacity="0.8" />
              <stop offset="50%" stopColor="oklch(0.58 0.25 320)" stopOpacity="1" />
              <stop offset="80%" stopColor="oklch(0.52 0.28 300)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="oklch(0.52 0.28 300)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,50 L100,50 L110,50 L120,45 L130,55 L140,50 L180,50 L190,50 L200,20 L210,80 L220,10 L230,90 L240,50 L280,50 L300,50 L310,50 L320,45 L330,55 L340,50 L380,50 L390,50 L400,20 L410,80 L420,10 L430,90 L440,50 L480,50 L500,50 L510,50 L520,45 L530,55 L540,50 L580,50 L590,50 L600,20 L610,80 L620,10 L630,90 L640,50 L680,50 L700,50 L710,50 L720,45 L730,55 L740,50 L780,50 L790,50 L800,20 L810,80 L820,10 L830,90 L840,50 L880,50 L900,50 L910,50 L920,45 L930,55 L940,50 L980,50 L990,50 L1000,20 L1010,80 L1020,10 L1030,90 L1040,50 L1080,50 L1100,50 L1110,50 L1120,45 L1130,55 L1140,50 L1200,50"
            fill="none"
            stroke="url(#ecg-gradient-1)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-ecg-scroll"
          />
        </svg>

        {/* ECG Line 2 - Middle */}
        <svg 
          className="absolute w-[200%] h-40 top-[45%] opacity-15"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="ecg-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.58 0.25 320)" stopOpacity="0" />
              <stop offset="30%" stopColor="oklch(0.52 0.28 300)" stopOpacity="0.6" />
              <stop offset="50%" stopColor="oklch(0.52 0.28 300)" stopOpacity="1" />
              <stop offset="70%" stopColor="oklch(0.52 0.28 300)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="oklch(0.58 0.25 320)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,60 L80,60 L90,60 L100,55 L110,65 L120,60 L150,60 L160,60 L170,25 L180,95 L190,15 L200,105 L210,60 L250,60 L280,60 L290,60 L300,55 L310,65 L320,60 L350,60 L360,60 L370,25 L380,95 L390,15 L400,105 L410,60 L450,60 L480,60 L490,60 L500,55 L510,65 L520,60 L550,60 L560,60 L570,25 L580,95 L590,15 L600,105 L610,60 L650,60 L680,60 L690,60 L700,55 L710,65 L720,60 L750,60 L760,60 L770,25 L780,95 L790,15 L800,105 L810,60 L850,60 L880,60 L890,60 L900,55 L910,65 L920,60 L950,60 L960,60 L970,25 L980,95 L990,15 L1000,105 L1010,60 L1050,60 L1080,60 L1090,60 L1100,55 L1110,65 L1120,60 L1150,60 L1160,60 L1170,25 L1180,95 L1190,15 L1200,60"
            fill="none"
            stroke="url(#ecg-gradient-2)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-ecg-scroll-reverse"
          />
        </svg>

        {/* ECG Line 3 - Bottom */}
        <svg 
          className="absolute w-[200%] h-28 bottom-[20%] opacity-10"
          viewBox="0 0 1200 80"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="ecg-gradient-3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.45 0.18 285)" stopOpacity="0" />
              <stop offset="25%" stopColor="oklch(0.52 0.28 300)" stopOpacity="0.5" />
              <stop offset="50%" stopColor="oklch(0.52 0.28 300)" stopOpacity="0.8" />
              <stop offset="75%" stopColor="oklch(0.52 0.28 300)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="oklch(0.45 0.18 285)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,40 L120,40 L130,40 L140,35 L150,45 L160,40 L200,40 L210,40 L220,15 L230,65 L240,5 L250,75 L260,40 L300,40 L320,40 L330,40 L340,35 L350,45 L360,40 L400,40 L410,40 L420,15 L430,65 L440,5 L450,75 L460,40 L500,40 L520,40 L530,40 L540,35 L550,45 L560,40 L600,40 L610,40 L620,15 L630,65 L640,5 L650,75 L660,40 L700,40 L720,40 L730,40 L740,35 L750,45 L760,40 L800,40 L810,40 L820,15 L830,65 L840,5 L850,75 L860,40 L900,40 L920,40 L930,40 L940,35 L950,45 L960,40 L1000,40 L1010,40 L1020,15 L1030,65 L1040,5 L1050,75 L1060,40 L1100,40 L1120,40 L1130,40 L1140,35 L1150,45 L1160,40 L1200,40"
            fill="none"
            stroke="url(#ecg-gradient-3)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-ecg-scroll-slow"
          />
        </svg>
      </div>

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
