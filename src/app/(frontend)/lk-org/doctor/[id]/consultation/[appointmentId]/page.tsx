import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { DoctorsApi } from "@/lib/api/doctors"
import { AppointmentsApi } from "@/lib/api/appointments"
import { MessagesApi } from "@/lib/api/messages"
import { CallRecordingsApi } from "@/lib/api/call-recordings"
import { getSessionFromCookie } from "@/lib/auth/getSessionFromCookie"
import { OrgConsultationView } from "@/components/lk-org/consultation/OrgConsultationView"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Просмотр консультации | smartcardio",
  description: "Просмотр чата консультации в кабинете организации",
}

interface ConsultationPageProps {
  params: Promise<{ id: string; appointmentId: string }>
}

export default async function ConsultationPage({ params }: ConsultationPageProps) {
  const { id, appointmentId: apptIdStr } = await params
  const doctorId = parseInt(id, 10)
  const appointmentId = parseInt(apptIdStr, 10)

  if (isNaN(doctorId) || isNaN(appointmentId)) {
    notFound()
  }

  const requestHeaders = await headers()
  const cookie = requestHeaders.get("cookie") ?? ""

  const org = await getSessionFromCookie<{ id: number; name?: string; email: string }>(
    requestHeaders,
    'organisations-token',
    'organisations',
  )

  if (!org) {
    redirect("/lk-org")
  }

  // Fetch doctor and verify ownership
  const doctor = await DoctorsApi.fetchById(doctorId)

  if (!doctor) {
    notFound()
  }

  // Check if doctor belongs to this organisation
  const orgId = typeof doctor.organisation === 'object' && doctor.organisation
    ? doctor.organisation.id
    : doctor.organisation

  if (orgId !== org.id) {
    redirect("/lk-org")
  }

  // Fetch appointment
  let appointment
  try {
    appointment = await AppointmentsApi.fetchByIdServer(appointmentId, { cookie })
  } catch {
    notFound()
  }

  // Verify appointment belongs to this doctor
  const apptDoctorId = typeof appointment.doctor === 'object' && appointment.doctor
    ? appointment.doctor.id
    : appointment.doctor

  if (apptDoctorId !== doctorId) {
    redirect(`/lk-org/doctor/${doctorId}`)
  }

  // Fetch messages and recordings
  const [messages, recordings] = await Promise.all([
    MessagesApi.fetchByAppointmentServer(appointmentId, { cookie }),
    CallRecordingsApi.fetchByAppointmentServer(appointmentId, { cookie }),
  ])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <OrgConsultationView
        doctor={doctor}
        appointment={appointment}
        initialMessages={messages}
        initialRecordings={recordings}
        doctorId={doctorId}
      />
      <Footer />
    </div>
  )
}
