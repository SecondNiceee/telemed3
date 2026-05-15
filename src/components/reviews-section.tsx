"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const REVIEWS = [
  {
    id: 1,
    name: "Анна Михайлова",
    avatar: "АМ",
    rating: 5,
    date: "2 недели назад",
    text: "Отличный сервис! Записалась к кардиологу за 5 минут. Врач был очень внимательным, всё объяснил понятно. Рекомендую всем, кто ценит своё время.",
    doctor: "Кардиолог Петров И.С.",
  },
  {
    id: 2,
    name: "Дмитрий Козлов",
    avatar: "ДК",
    rating: 5,
    date: "1 месяц назад",
    text: "Удобно, что можно получить консультацию не выходя из дома. Качество видеосвязи отличное, врач выслушал все жалобы и назначил лечение. Уже чувствую себя лучше!",
    doctor: "Терапевт Сидорова Е.В.",
  },
  {
    id: 3,
    name: "Елена Новикова",
    avatar: "ЕН",
    rating: 5,
    date: "3 недели назад",
    text: "Долго искала хорошего кардиолога. Через СмартКардио нашла специалиста, который реально помог разобраться с проблемой аритмии. Спасибо за качественный сервис!",
    doctor: "Кардиолог Иванов А.П.",
  },
  {
    id: 4,
    name: "Сергей Волков",
    avatar: "СВ",
    rating: 4,
    date: "1 неделю назад",
    text: "Пользуюсь уже второй раз. Очень удобный интерфейс, быстрая запись. Врачи профессиональные, отвечают на все вопросы. Единственное — хотелось бы больше специалистов.",
    doctor: "Терапевт Кузнецова М.А.",
  },
  {
    id: 5,
    name: "Мария Соколова",
    avatar: "МС",
    rating: 5,
    date: "5 дней назад",
    text: "Наконец-то нормальная телемедицина! Записала маму к кардиологу, она в восторге. Врач потратил 40 минут на консультацию, всё подробно разъяснил. Будем обращаться ещё.",
    doctor: "Кардиолог Петров И.С.",
  },
];

export function ReviewsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCount = 3;

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev + 1 >= REVIEWS.length - visibleCount + 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev - 1 < 0 ? REVIEWS.length - visibleCount : prev - 1
    );
  };

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 50%, oklch(0.52 0.28 300 / 0.06), transparent)",
        }}
        aria-hidden="true"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-xs font-bold tracking-[0.15em] uppercase text-primary border border-primary/20 bg-primary/5 backdrop-blur-sm mb-6 shadow-sm shadow-primary/10">
            <Star className="w-3.5 h-3.5 fill-primary" />
            Отзывы пациентов
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5">
            Что говорят наши пациенты
          </h2>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto">
            Более 10 000 довольных пациентов доверяют нам своё здоровье
          </p>
        </div>

        {/* Desktop Slider */}
        <div className="hidden md:block relative">
          <div className="flex gap-6 overflow-hidden">
            {REVIEWS.slice(currentIndex, currentIndex + visibleCount).map((review, index) => (
              <ReviewCard key={review.id} review={review} index={index} />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 shadow-sm"
              aria-label="Предыдущий отзыв"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: REVIEWS.length - visibleCount + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    currentIndex === i ? "bg-primary w-8" : "bg-border/60 w-2 hover:bg-primary/50"
                  )}
                  aria-label={`Перейти к отзыву ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 shadow-sm"
              aria-label="Следующий отзыв"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Mobile Stack */}
        <div className="md:hidden flex flex-col gap-5">
          {REVIEWS.slice(0, 3).map((review, index) => (
            <ReviewCard key={review.id} review={review} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface ReviewCardProps {
  review: typeof REVIEWS[0];
  index: number;
}

function ReviewCard({ review, index }: ReviewCardProps) {
  return (
    <Card 
      className="group flex-1 min-w-0 border-border/50 bg-card/70 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 rounded-3xl"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <CardContent className="p-7">
        <div className="flex items-start gap-4 mb-5">
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
            <span className="text-sm font-bold text-primary">{review.avatar}</span>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground text-lg">{review.name}</h4>
            <p className="text-sm text-muted-foreground">{review.date}</p>
          </div>
          <Quote className="w-10 h-10 text-primary/15 shrink-0" />
        </div>

        <div className="flex gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-5 h-5 transition-colors",
                i < review.rating ? "fill-primary text-primary" : "fill-muted text-muted"
              )}
            />
          ))}
        </div>

        <p className="text-foreground/80 leading-relaxed mb-5 line-clamp-4">
          {review.text}
        </p>

        <div className="pt-5 border-t border-border/40">
          <p className="text-sm text-muted-foreground">
            Консультация: <span className="text-foreground font-medium">{review.doctor}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
