"use client";

import { Card, CardContent } from "@/components/ui/card";
import { 
  MessageSquare, 
  FileText,
  CheckCircle,
  Info,
  X
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ApiAppointment } from "@/lib/api/types";

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

  return (
    <Card className="mb-6 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardContent className="py-4 px-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">
              Инструкция по консультации
            </h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground flex-shrink-0"
            onClick={() => setIsDismissed(true)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {/* Step 1 */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-background/60">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary-foreground">1</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Загрузите документы</p>
              <p className="text-xs text-muted-foreground">Загрузите документы с результатами исследований и анализов в Чат Консультации</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-background/60">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary-foreground">2</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Перейдите в чат в назначенное время</p>
              <p className="text-xs text-muted-foreground">В назначенное время перейдите в Чат в консультации для общения с врачом</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-background/60">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary-foreground">3</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Получите заключение врача</p>
              <p className="text-xs text-muted-foreground">По завершению консультации заключение врача будет доступно в Чате консультации</p>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-primary/20 flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
          <span>Все консультации проводятся в защищенном режиме</span>
        </div>
      </CardContent>
    </Card>
  );
}
