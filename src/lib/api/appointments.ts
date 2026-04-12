import { apiFetch, serverApiFetch } from './fetch'
import type { ApiAppointment, PayloadListResponse } from './types'

interface ServerOptions {
  cookie?: string
}

export interface CreateAppointmentPayload {
  doctor: number
  user: number
  doctorName: string
  userName: string
  specialty: string
  date: string
  time: string
  price: number
}

export class AppointmentsApi {
  /**
   * Create a new appointment (requires payload-token cookie)
   */
  static async create(data: CreateAppointmentPayload): Promise<ApiAppointment> {
    return apiFetch<ApiAppointment>('/api/appointments', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(data),
    })
  }

  /**
   * Complete an appointment (doctor only - requires doctors-token cookie)
   */
  static async complete(appointmentId: number): Promise<ApiAppointment> {
    return apiFetch<ApiAppointment>(`/api/appointments/${appointmentId}/complete`, {
      method: 'POST',
      credentials: 'include',
    })
  }

  /**
   * Fetch appointments for the current user (client-side)
   */
  static async fetchMyAppointments(): Promise<ApiAppointment[]> {
    const data = await apiFetch<PayloadListResponse<ApiAppointment>>(
      '/api/appointments?limit=100&depth=1&sort=-date',
      { credentials: 'include' },
    )
    return data.docs
  }

  /**
   * Fetch appointments for the current user (server-side with cookie)
   */
  static async fetchMyAppointmentsServer(options: ServerOptions = {}): Promise<ApiAppointment[]> {
    const data = await serverApiFetch<PayloadListResponse<ApiAppointment>>(
      '/api/appointments?limit=100&depth=1&sort=-date',
      options,
    )
    return data.docs
  }

  /**
   * Fetch appointments for a specific doctor (public -- used to check busy slots)
   * We pass the doctor ID as a filter.
   */
  static async fetchByDoctor(doctorId: number): Promise<ApiAppointment[]> {
    const data = await apiFetch<PayloadListResponse<ApiAppointment>>(
      `/api/appointments?where[doctor][equals]=${doctorId}&where[status][not_equals]=cancelled&limit=500&depth=0`,
      { credentials: 'include' },
    )
    return data.docs
  }

  /**
   * Fetch appointments for the current doctor (server-side with cookie)
   * Uses doctors-token cookie for auth
   */
  static async fetchDoctorAppointmentsServer(options: ServerOptions = {}): Promise<ApiAppointment[]> {
    const data = await serverApiFetch<PayloadListResponse<ApiAppointment>>(
      '/api/appointments?limit=100&depth=1&sort=-date',
      { ...options, cache: 'no-store' },
    )
    return data.docs
  }

  /**
   * Fetch appointments for a specific doctor (used by org dashboard)
   * Organisation uses organisations-token cookie
   */
  static async fetchByDoctorServer(doctorId: number, options: ServerOptions = {}): Promise<ApiAppointment[]> {
    const data = await serverApiFetch<PayloadListResponse<ApiAppointment>>(
      `/api/appointments?where[doctor][equals]=${doctorId}&limit=500&depth=1&sort=-date`,
      { ...options, cache: 'no-store' },
    )
    return data.docs
  }

  /**
   * Fetch appointments for multiple doctors (used by org stats)
   */
  static async fetchByDoctorsServer(doctorIds: number[], options: ServerOptions = {}): Promise<ApiAppointment[]> {
    if (doctorIds.length === 0) return []
    const query = doctorIds.map(id => `where[doctor][in]=${id}`).join('&')
    const data = await serverApiFetch<PayloadListResponse<ApiAppointment>>(
      `/api/appointments?${query}&limit=500&depth=1&sort=-date`,
      { ...options, cache: 'no-store' },
    )
    return data.docs
  }

  /**
   * Fetch a single appointment by ID
   */
  static async fetchByIdServer(appointmentId: number, options: ServerOptions = {}): Promise<ApiAppointment> {
    return serverApiFetch<ApiAppointment>(
      `/api/appointments/${appointmentId}?depth=1`,
      { ...options, cache: 'no-store' },
    )
  }
}
