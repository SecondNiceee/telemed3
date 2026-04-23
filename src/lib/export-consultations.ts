import * as XLSX from 'xlsx'
import type { ApiAppointment } from './api/types'

export interface ConsultationExportData {
  'Дата консультации': string
  'ФИО врача': string
  'Специальность': string
  'Стоимость (₽)': number
  'Длительность (мин)': number
  'ФИО пациента': string
  'Ссылка на консультацию': string
}

export function exportConsultationsToExcel(
  consultations: ApiAppointment[],
  doctorDurations: Record<number, number>,
  filename: string = 'consultations.xlsx'
) {
  const data: ConsultationExportData[] = consultations.map((consultation) => ({
    'Дата консультации': formatDate(consultation.date),
    'ФИО врача': consultation.doctorName || 'N/A',
    'Специальность': consultation.specialty || 'N/A',
    'Стоимость (₽)': consultation.price || 0,
    'Длительность (мин)': (typeof consultation.doctor === 'object' && consultation.doctor?.id ? doctorDurations[consultation.doctor.id] : 30) || 30,
    'ФИО пациента': consultation.userName || 'N/A',
    'Ссылка на консультацию': `${typeof window !== 'undefined' ? window.location.origin : ''}/lk-org/doctor/${typeof consultation.doctor === 'object' ? consultation.doctor?.id : consultation.doctor}/consultation/${consultation.id}`,
  }))

  const ws = XLSX.utils.json_to_sheet(data, {
    header: [
      'Дата консультации',
      'ФИО врача',
      'Специальность',
      'Стоимость (₽)',
      'Длительность (мин)',
      'ФИО пациента',
      'Ссылка на консультацию',
    ],
  })

  // Set column widths
  const colWidths = [20, 20, 20, 15, 15, 20, 40]
  ws['!cols'] = colWidths.map((width) => ({ wch: width }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Консультации')
  XLSX.writeFile(wb, filename)
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}
