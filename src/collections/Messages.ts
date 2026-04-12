import type { CollectionConfig, PayloadRequest } from 'payload'
import { getCallerFromRequest } from './helpers/auth'
import { buildAppointmentAccessFilter } from '@/utils/buildAppointmentAccessFilter'

export const Messages: CollectionConfig = {
  slug: 'messages',
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'text',
    defaultColumns: ['appointment', 'sender', 'text', 'createdAt'],
    group: 'Чат',
  },
  access: {
    read: ({ req }: { req: PayloadRequest }) => {
      // Admin can read all
      const callerAsUser = getCallerFromRequest(req, 'users')
      if (callerAsUser?.role === 'admin') return true

      // Check both tokens and build filter
      const callerAsDoctor = getCallerFromRequest(req, 'doctors')
      
      const userId = callerAsUser?.collection === 'users' && callerAsUser.id 
        ? Number(callerAsUser.id) 
        : null
      const doctorId = callerAsDoctor?.collection === 'doctors' && callerAsDoctor.id 
        ? Number(callerAsDoctor.id) 
        : null

      return buildAppointmentAccessFilter(userId, doctorId)
    },
    create: ({ req }) => {
      // Users and doctors can create messages
      const callerAsUser = getCallerFromRequest(req, 'users')
      if (callerAsUser?.collection === 'users' && callerAsUser.id) return true

      const callerAsDoctor = getCallerFromRequest(req, 'doctors')
      if (callerAsDoctor?.collection === 'doctors' && callerAsDoctor.id) return true

      return false
    },
    update: ({ req }) => {
      // Only admin can update messages (e.g., mark as read)
      const callerAsUser = getCallerFromRequest(req, 'users')
      if (callerAsUser?.role === 'admin') return true

      // Check both tokens and build filter
      const callerAsDoctor = getCallerFromRequest(req, 'doctors')
      
      const userId = callerAsUser?.collection === 'users' && callerAsUser.id 
        ? Number(callerAsUser.id) 
        : null
      const doctorId = callerAsDoctor?.collection === 'doctors' && callerAsDoctor.id 
        ? Number(callerAsDoctor.id) 
        : null

      return buildAppointmentAccessFilter(userId, doctorId)
    },
    delete: ({ req }) => {
      const caller = getCallerFromRequest(req, 'users')
      return caller?.role === 'admin'
    },
    admin: () => true,
  },
  hooks: {}, // Я всё равно валидирую на socket сервере, тут ничего не нужно.
  fields: [
    {
      name: 'appointment',
      type: 'relationship',
      relationTo: 'appointments',
      required: true,
      label: 'Консультация',
      index: true,
    },
    {
      name: 'sender',
      type: 'relationship',
      relationTo: ['users', 'doctors'],
      required: true,
      label: 'Отправитель',
      index: true,
      admin: {
        description: 'Полиморфная связь: может быть пользователем или врачом',
      },
    },
    {
      name: 'text',
      type: 'textarea',
      required: false,
      label: 'Текст сообщения',
    },
    {
      name: 'attachment',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Прикрепленный файл',
    },
    {
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
      label: 'Прочитано',
    },
  ],
  timestamps: true,
}
