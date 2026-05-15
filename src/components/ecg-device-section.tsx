import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Smartphone, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Heart,
    title: "12 отведений",
    description: "Полноценная кардиограмма как в клинике",
  },
  {
    icon: Smartphone,
    title: "Синхронизация",
    description: "Мгновенная передача данных врачу",
  },
  {
    icon: Shield,
    title: "Медицинская точность",
    description: "Сертифицированное медицинское устройство",
  },
  {
    icon: Zap,
    title: "Быстрый результат",
    description: "ЭКГ за 30 секунд в любом месте",
  },
];

export function EcgDeviceSection() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-background via-primary/5 to-background relative overflow-hidden">
      {/* Decorative elements */}
      <div
        className="pointer-events-none absolute top-1/4 right-0 w-[400px] h-[400px] opacity-20"
        style={{
          background: "radial-gradient(circle, oklch(0.55 0.18 155 / 0.3) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        aria-hidden="true"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Side */}
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Glow effect behind image */}
              <div 
                className="absolute inset-0 rounded-3xl opacity-40"
                style={{
                  background: "radial-gradient(circle at center, oklch(0.55 0.18 155 / 0.3) 0%, transparent 70%)",
                  filter: "blur(40px)",
                }}
                aria-hidden="true"
              />
              
              {/* Main image container */}
              <div className="relative bg-card rounded-3xl p-8 shadow-2xl border border-border/50">
                <Image
                  src="/images/ecg-device.png"
                  alt="Портативный кардиограф SmartCardio для домашнего использования"
                  width={500}
                  height={500}
                  className="w-full h-auto object-contain rounded-2xl"
                  priority
                />
              </div>
              
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 sm:bottom-4 sm:right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                Новинка 2024
              </div>
            </div>
          </div>
          
          {/* Content Side */}
          <div className="order-1 lg:order-2">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-[0.15em] uppercase text-primary border border-primary/20 bg-primary/5 mb-6">
              Наше устройство
            </span>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              Полноценное ЭКГ дома
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Портативный кардиограф SmartCardio позволяет снять профессиональную 
              электрокардиограмму в домашних условиях. Результаты мгновенно 
              передаются вашему врачу для анализа и консультации.
            </p>
            
            {/* Features grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* CTA Button */}
            <Button asChild size="lg" className="group">
              <Link href="https://smartcardio.ru/" target="_blank" rel="noopener noreferrer">
                Узнать больше о приборе
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
