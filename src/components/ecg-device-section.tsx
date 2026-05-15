"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Smartphone, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveImageUrl } from "@/lib/utils/image";

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
    <section className="py-12 sm:py-16 bg-background relative overflow-hidden">
      {/* Animated background */}
      <div 
        className="absolute inset-0 animate-gradient opacity-50"
        style={{
          background: "linear-gradient(135deg, oklch(0.52 0.28 300 / 0.06) 0%, transparent 25%, oklch(0.58 0.25 320 / 0.04) 50%, transparent 75%, oklch(0.52 0.28 300 / 0.06) 100%)",
          backgroundSize: "400% 400%",
        }}
        aria-hidden="true"
      />

      {/* Floating blobs */}
      <div
        className="pointer-events-none absolute top-1/4 right-0 w-[500px] h-[500px] opacity-30 animate-blob"
        style={{
          background: "radial-gradient(circle, oklch(0.52 0.28 300 / 0.2) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-1/4 left-0 w-[400px] h-[400px] opacity-25 animate-blob"
        style={{
          background: "radial-gradient(circle, oklch(0.58 0.25 320 / 0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
          animationDelay: "-5s",
        }}
        aria-hidden="true"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Side */}
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Animated glow effect */}
              <div 
                className="absolute inset-0 rounded-3xl opacity-50 animate-pulse-glow"
                style={{
                  background: "radial-gradient(circle at center, oklch(0.52 0.28 300 / 0.3) 0%, transparent 70%)",
                  filter: "blur(50px)",
                }}
                aria-hidden="true"
              />
              
              {/* Floating decorative elements */}
              <div className="absolute -top-4 -left-4 w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 animate-float" />
              <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-xl bg-primary/5 border border-primary/10 animate-float-delayed" />
              
              {/* Main image container */}
              <div className="relative glass rounded-3xl p-8 shadow-2xl shadow-primary/10">
                <img
                  src={resolveImageUrl("/images/ecg-device.png")}
                  alt="Портативный кардиограф SmartCardio для домашнего использования"
                  className="w-full h-auto object-contain rounded-2xl"
                />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 rounded-3xl animate-shimmer opacity-30" />
              </div>
              
              {/* Floating badge */}
              <div className="absolute -bottom-3 right-8 bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl text-sm font-bold shadow-xl shadow-primary/30 animate-float">
                Новинка 2024
              </div>
            </div>
          </div>
          
          {/* Content Side */}
          <div className="order-1 lg:order-2">
            <span className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-xs font-bold tracking-[0.15em] uppercase text-primary border border-primary/20 bg-primary/5 backdrop-blur-sm mb-6 shadow-sm shadow-primary/10">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              Наше устройство
            </span>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              <span className="text-balance">Полноценное</span>
              <br />
              <span className="gradient-text">ЭКГ дома</span>
            </h2>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed">
              Портативный кардиограф SmartCardio позволяет снять профессиональную 
              электрокардиограмму в домашних условиях. Результаты мгновенно 
              передаются вашему врачу для анализа и консультации.
            </p>
            
            {/* Features grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="group flex items-start gap-4 p-5 rounded-2xl bg-card/70 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* CTA Button */}
            <Button asChild size="lg" className="group h-14 px-8 text-base rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
              <Link href="https://smartcardio.ru/" target="_blank" rel="noopener noreferrer">
                Узнать больше о приборе
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
