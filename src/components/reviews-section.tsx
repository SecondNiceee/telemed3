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
    <section className="py-16 sm:py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-[0.15em] uppercase text-primary border border-primary/20 bg-primary/5 mb-4">
            Отзывы пациентов
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Что говорят наши пациенты
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Более 10 000 довольных пациентов доверяют нам своё здоровье
          </p>
        </div>

        {/* Desktop Slider */}
        <div className="hidden md:block relative">
          <div className="flex gap-6 overflow-hidden">
            {REVIEWS.slice(currentIndex, currentIndex + visibleCount).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevSlide}
              className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center hover:bg-accent hover:border-primary/30 transition-colors"
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
                    "w-2 h-2 rounded-full transition-all",
                    currentIndex === i ? "bg-primary w-6" : "bg-border hover:bg-primary/50"
                  )}
                  aria-label={`Перейти к отзыву ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={nextSlide}
              className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center hover:bg-accent hover:border-primary/30 transition-colors"
              aria-label="Следующий отзыв"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Mobile Stack */}
        <div className="md:hidden flex flex-col gap-4">
          {REVIEWS.slice(0, 3).map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface ReviewCardProps {
  review: typeof REVIEWS[0];
}

function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card className="flex-1 min-w-0 border-border/60 bg-card hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">{review.avatar}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground">{review.name}</h4>
            <p className="text-sm text-muted-foreground">{review.date}</p>
          </div>
          <Quote className="w-8 h-8 text-primary/20 shrink-0" />
        </div>

        <div className="flex gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-4 h-4",
                i < review.rating ? "fill-primary text-primary" : "fill-muted text-muted"
              )}
            />
          ))}
        </div>

        <p className="text-foreground/80 leading-relaxed mb-4 line-clamp-4">
          {review.text}
        </p>

        <div className="pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Консультация: <span className="text-foreground font-medium">{review.doctor}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
