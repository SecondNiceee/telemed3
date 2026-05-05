"use client";

import { Card, CardContent } from "@/components/ui/card";
import { 
  MessageSquare, 
  Video, 
  Calendar, 
  Clock, 
  CheckCircle,
  Info,
  X
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ApiAppointment } from "@/lib/api/types";
import Link from "next/link";

interface ConsultationGuideProps {
  appointment: ApiAppointment;
}

export function ConsultationGuide({ appointment }: ConsultationGuideProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const isUpcoming = appointment.status === "confirmed";
  const isActive = appointment.status === "in_progress";

  // Only show for upcoming or active consultations
  if (!isUpcoming && !isActive) return null;

  const appointmentDate = appointment.date 
    ? new Date(appointment.date + "T00:00:00").toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
      })
    : null;

  return (
    <Card className="mb-6 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {isActive ? "Консультация началась" : "Подготовка к консультации"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isActive 
                  ? "Врач ожидает вас в чате" 
                  : `${appointmentDate} в ${appointment.time}`
                }
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setIsDismissed(true)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-foreground font-medium mb-3">
            {isActive ? "Что делать сейчас:" : "Что нужно знать:"}
          </p>
          
          <div className="grid gap-2">
            {isActive ? (
              <>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/60">
                  <MessageSquare className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Перейдите в чат</p>
                    <p className="text-xs text-muted-foreground">Нажмите на карточку записи, чтобы открыть чат с врачом</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/60">
                  <Video className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Видеозвонок</p>
                    <p className="text-xs text-muted-foreground">Врач может начать видеозвонок - убедитесь, что камера и микрофон работают</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/60">
                  <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Приходите вовремя</p>
                    <p className="text-xs text-muted-foreground">Зайдите в личный кабинет за 5-10 минут до начала консультации</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/60">
                  <MessageSquare className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Чат с врачом</p>
                    <p className="text-xs text-muted-foreground">Когда врач начнет консультацию, вы сможете общаться в чате</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/60">
                  <Video className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Проверьте оборудование</p>
                    <p className="text-xs text-muted-foreground">Если выбран видеозвонок - проверьте камеру и микрофон заранее</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/60">
                  <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Подготовьте вопросы</p>
                    <p className="text-xs text-muted-foreground">Запишите заранее все вопросы, которые хотите задать врачу</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {isActive && (
          <div className="mt-4 pt-4 border-t border-primary/20">
            <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary/5">
              <Link href={`/lk/chat?appointment=${appointment.id}`}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Перейти в чат с врачом
              </Link>
            </Button>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-primary/20 flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle className="w-4 h-4 text-primary" />
          <span>Все консультации проводятся в защищенном режиме</span>
        </div>
      </CardContent>
    </Card>
  );
}
