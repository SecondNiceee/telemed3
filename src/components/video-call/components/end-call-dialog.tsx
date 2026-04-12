'use client'

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

interface EndCallDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isDoctor?: boolean
}

export function EndCallDialog({
  open,
  onOpenChange,
  onConfirm,
  isDoctor = false,
}: EndCallDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isDoctor ? 'Завершить консультацию?' : 'Завершить звонок?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isDoctor
              ? 'Вы уверены, что хотите завершить консультацию? После завершения вы сможете заполнить медицинское заключение.'
              : 'Вы уверены, что хотите завершить видеозвонок?'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive hover:bg-destructive/90">
            {isDoctor ? 'Завершить приём' : 'Завершить'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
