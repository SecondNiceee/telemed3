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
    <section className="py-16 sm:py-20 bg-background relative overflow-hidden">
      {/* Subtle background decoration */}
      <div 
        className="absolute top-0 right-0 w-[600px] h-[600px] opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(circle, oklch(0.55 0.18 155 / 0.15) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-[0.15em] uppercase text-primary border border-primary/20 bg-primary/5 mb-4">
            Почему СмартКардио
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Преимущества нашей платформы
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
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
                  group relative p-6 rounded-2xl border transition-all duration-300
                  ${advantage.highlight 
                    ? "bg-primary/5 border-primary/30 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10" 
                    : "bg-card border-border/60 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                  }
                `}
              >
                <div className={`
                  w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300
                  ${advantage.highlight 
                    ? "bg-primary/15 group-hover:bg-primary/20" 
                    : "bg-secondary group-hover:bg-primary/10"
                  }
                `}>
                  <Icon className={`
                    w-7 h-7 transition-colors duration-300
                    ${advantage.highlight 
                      ? "text-primary" 
                      : "text-foreground/70 group-hover:text-primary"
                    }
                  `} />
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {advantage.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {advantage.description}
                </p>

                {advantage.highlight && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-full">
                      Ключевое
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Присоединяйтесь к тысячам пациентов, которые уже оценили качество нашего сервиса
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary">10 000+</span>
              <span className="text-sm text-muted-foreground text-left">довольных<br/>пациентов</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary">50+</span>
              <span className="text-sm text-muted-foreground text-left">опытных<br/>врачей</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary">4.9</span>
              <span className="text-sm text-muted-foreground text-left">средний<br/>рейтинг</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
