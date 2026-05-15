import { 
  Heart, 
  Clock, 
  ShieldCheck, 
  Users, 
  Video, 
  BadgeCheck,
  Smartphone,
  HeartPulse
} from "lucide-react";

const ADVANTAGES = [
  {
    icon: HeartPulse,
    title: "Специализация на кардиологии",
    description: "Ведущие кардиологи с опытом от 10 лет. Диагностика и лечение заболеваний сердечно-сосудистой системы.",
    highlight: true,
  },
  {
    icon: Clock,
    title: "Консультация за 15 минут",
    description: "Без очередей и ожидания в поликлинике. Запишитесь на удобное время и получите консультацию.",
  },
  {
    icon: Video,
    title: "HD видеосвязь",
    description: "Качественная видеоконсультация с возможностью показать результаты анализов и ЭКГ в реальном времени.",
  },
  {
    icon: ShieldCheck,
    title: "Конфиденциальность данных",
    description: "Все данные защищены шифрованием. Ваша медицинская информация в полной безопасности.",
  },
  {
    icon: Users,
    title: "Личный врач",
    description: "Возможность наблюдаться у одного специалиста. Врач знает вашу историю и особенности.",
  },
  {
    icon: Smartphone,
    title: "Доступно везде",
    description: "Консультация с любого устройства: компьютер, планшет или смартфон. Нужен только интернет.",
  },
  {
    icon: BadgeCheck,
    title: "Лицензированные врачи",
    description: "Все специалисты имеют действующие сертификаты и регулярно повышают квалификацию.",
  },
  {
    icon: Heart,
    title: "Забота о вас 24/7",
    description: "Чат с врачом доступен круглосуточно. Задавайте вопросы и получайте ответы в любое время.",
  },
];

export function AdvantagesSection() {
  return (
    <section className="py-20 sm:py-28 bg-background relative overflow-hidden">
      {/* Animated background */}
      <div 
        className="absolute inset-0 animate-gradient opacity-40"
        style={{
          background: "linear-gradient(135deg, oklch(0.52 0.28 300 / 0.05) 0%, transparent 25%, oklch(0.58 0.25 320 / 0.03) 50%, transparent 75%, oklch(0.52 0.28 300 / 0.05) 100%)",
          backgroundSize: "400% 400%",
        }}
        aria-hidden="true"
      />

      {/* Floating blobs */}
      <div 
        className="absolute top-20 right-0 w-[500px] h-[500px] opacity-30 pointer-events-none animate-blob"
        style={{
          background: "radial-gradient(circle, oklch(0.52 0.28 300 / 0.15) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        aria-hidden="true"
      />
      <div 
        className="absolute bottom-20 left-0 w-[400px] h-[400px] opacity-25 pointer-events-none animate-blob"
        style={{
          background: "radial-gradient(circle, oklch(0.58 0.25 320 / 0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
          animationDelay: "-5s",
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-[0.15em] uppercase text-primary border border-primary/20 bg-primary/5 backdrop-blur-sm mb-6 shadow-sm shadow-primary/10">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            Почему СмартКардио
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5">
            Преимущества нашей платформы
          </h2>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto">
            Современный подход к телемедицине с фокусом на качество и удобство
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ADVANTAGES.map((advantage, index) => {
            const Icon = advantage.icon;
            return (
              <div
                key={index}
                className={`
                  group relative p-6 rounded-3xl border transition-all duration-500 hover:-translate-y-2
                  ${advantage.highlight 
                    ? "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/30 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20" 
                    : "bg-card/50 backdrop-blur-sm border-border/60 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"
                  }
                `}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer" />

                <div className={`
                  relative w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300
                  ${advantage.highlight 
                    ? "bg-primary/20 group-hover:bg-primary/30 group-hover:scale-110" 
                    : "bg-secondary group-hover:bg-primary/15 group-hover:scale-110"
                  }
                `}>
                  <Icon className={`
                    w-7 h-7 transition-all duration-300
                    ${advantage.highlight 
                      ? "text-primary" 
                      : "text-foreground/70 group-hover:text-primary"
                    }
                  `} />
                </div>

                <h3 className="relative text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {advantage.title}
                </h3>

                <p className="relative text-sm text-muted-foreground leading-relaxed">
                  {advantage.description}
                </p>

                {advantage.highlight && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary rounded-full border border-primary/20">
                      Ключевое
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom stats with animation */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent rounded-3xl" />
          <div className="relative glass rounded-3xl p-8 sm:p-10">
            <p className="text-center text-muted-foreground mb-8 text-lg">
              Присоединяйтесь к тысячам пациентов, которые уже оценили качество нашего сервиса
            </p>
            <div className="flex items-center justify-center gap-12 sm:gap-20 flex-wrap">
              <div className="flex items-center gap-4 group">
                <span className="text-4xl sm:text-5xl font-bold gradient-text group-hover:scale-110 transition-transform">10 000+</span>
                <span className="text-sm text-muted-foreground text-left leading-tight">довольных<br/>пациентов</span>
              </div>
              <div className="w-px h-12 bg-border hidden sm:block" />
              <div className="flex items-center gap-4 group">
                <span className="text-4xl sm:text-5xl font-bold gradient-text group-hover:scale-110 transition-transform">50+</span>
                <span className="text-sm text-muted-foreground text-left leading-tight">опытных<br/>врачей</span>
              </div>
              <div className="w-px h-12 bg-border hidden sm:block" />
              <div className="flex items-center gap-4 group">
                <span className="text-4xl sm:text-5xl font-bold gradient-text group-hover:scale-110 transition-transform">4.9</span>
                <span className="text-sm text-muted-foreground text-left leading-tight">средний<br/>рейтинг</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
