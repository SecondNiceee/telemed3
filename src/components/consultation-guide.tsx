"use client";

import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle,
  Info,
  X,
  ChevronRight
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
      <CardContent className="py-2 px-5">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">
              Порядок получения консультации
            </h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground flex-shrink-0"
            onClick={() => setIsDismissed(true)}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0 text-xs sm:text-sm">
          {/* Step 1 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary-foreground">1</span>
            </div>
            <p className="font-medium text-foreground whitespace-nowrap">Загрузите документы</p>
          </div>

          {/* Arrow */}
          <ChevronRight className="hidden sm:block w-4 h-4 text-primary/40 flex-shrink-0 mx-1" />
          <div className="block sm:hidden w-full h-px bg-primary/20 ml-7 mt-1 mb-1" />

          {/* Step 2 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary-foreground">2</span>
            </div>
            <p className="font-medium text-foreground whitespace-nowrap">Перейдите в чат</p>
          </div>

          {/* Arrow */}
          <ChevronRight className="hidden sm:block w-4 h-4 text-primary/40 flex-shrink-0 mx-1" />
          <div className="block sm:hidden w-full h-px bg-primary/20 ml-7 mt-1 mb-1" />

          {/* Step 3 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary-foreground">3</span>
            </div>
            <p className="font-medium text-foreground whitespace-nowrap">Получите заключение</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
