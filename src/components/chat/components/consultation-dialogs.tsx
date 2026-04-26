'use client'

import { Video, MessageSquare, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ConsultationDialogsProps } from '../types'

export function ConsultationDialogs({
  showCompleteDialog,
  showConsultationTypeDialog,
  isCompleting,
  onCompleteDialogChange,
  onConsultationTypeDialogChange,
  onComplete,
  onStartVideoConsultation,
  onStartChatConsultation,
}: ConsultationDialogsProps) {
  return (
    <>
      {/* Complete confirmation dialog */}
      <AlertDialog open={showCompleteDialog} onOpenChange={onCompleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Завершить консультацию?</AlertDialogTitle>
            <AlertDialogDescription>
              После завершения консультации пациент больше не сможет отправлять сообщения в этот чат. 
              Вы по-прежнему сможете просматривать историю переписки и приложенные материалы.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCompleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onComplete}
              disabled={isCompleting}
              className="bg-primary"
            >
              {isCompleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Завершение...
                </>
              ) : (
                'Завершить'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Consultation type selection dialog */}
      <Dialog open={showConsultationTypeDialog} onOpenChange={onConsultationTypeDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Начать консультацию</DialogTitle>
            <DialogDescription>
              Выберите способ проведения консультации
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center gap-3 hover:bg-primary/5 hover:border-primary"
              onClick={onStartVideoConsultation}
            >
              <Video className="w-12 h-12 text-primary" />
              <div className="text-center">
                <div className="font-semibold">Видеозвонок</div>
                <div className="text-xs text-muted-foreground">Провести видеоконсультацию</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center gap-3 hover:bg-primary/5 hover:border-primary"
              onClick={onStartChatConsultation}
            >
              <MessageSquare className="w-12 h-12 text-primary" />
              <div className="text-center">
                <div className="font-semibold">В чате</div>
                <div className="text-xs text-muted-foreground">Общение в текстовом чате</div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
