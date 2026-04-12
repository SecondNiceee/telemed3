"use client"

import { useState, useCallback } from "react"
import { Calendar, Clock, CheckCircle } from "lucide-react"
import { DoctorsApi } from "@/lib/api/doctors"
import type { ApiDoctor } from "@/lib/api/types"
import type { OrgStats } from "@/app/(frontend)/lk-org/page"
import { OrgPageHeader } from "@/components/lk-org/OrgPageHeader"
import { DoctorsListHeader } from "@/components/lk-org/DoctorsListHeader"
import { EmptyDoctorsList } from "@/components/lk-org/EmptyDoctorsList"
import { OrgDoctorCard } from "@/components/lk-org/OrgDoctorCard"
import { DeleteDoctorDialog } from "@/components/lk-org/DeleteDoctorDialog"

interface LkOrgContentProps {
  userName: string
  initialDoctors: ApiDoctor[]
  orgId: number
  stats: OrgStats
}

export function LkOrgContent({ userName, initialDoctors, stats }: LkOrgContentProps) {
  const [deleteDoctor, setDeleteDoctor] = useState<ApiDoctor | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteRequest = useCallback((doctor: ApiDoctor) => {
    setDeleteDoctor(doctor)
  }, [])

  const handleDeleteCancel = useCallback(() => {
    setDeleteDoctor(null)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteDoctor) return
    setIsDeleting(true)
    try {
      await DoctorsApi.delete(deleteDoctor.id)
      setDeleteDoctor(null)
      window.location.reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Не удалось удалить врача")
    } finally {
      setIsDeleting(false)
    }
  }, [deleteDoctor])

  return (
    <div className="flex-1">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OrgPageHeader userName={userName} />

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Всего консультаций</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.upcoming}</p>
                <p className="text-xs text-muted-foreground">Предстоящих</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.past}</p>
                <p className="text-xs text-muted-foreground">Прошедших</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <DoctorsListHeader count={initialDoctors.length} />

          {initialDoctors.length === 0 ? (
            <EmptyDoctorsList />
          ) : (
            <div className="flex flex-col gap-3">
              {initialDoctors.map((doctor) => (
                <OrgDoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  onDeleteRequest={handleDeleteRequest}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <DeleteDoctorDialog
        doctor={deleteDoctor}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  )
}
