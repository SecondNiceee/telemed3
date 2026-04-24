/**
 * Скрипт для создания организации
 * Запуск: pnpm tsx scripts/create-organization.ts
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { DEFAULT_ORGANISATION } from './seed-data.config'

async function createOrganisation() {
  console.log('🏥 Создание организации...\n')

  const payload = await getPayload({ config })

  try {
    // Проверяем, существует ли организация с таким email
    const existingOrg = await payload.find({
      collection: 'organisations',
      where: {
        email: {
          equals: DEFAULT_ORGANISATION.email,
        },
      },
      limit: 1,
    })

    if (existingOrg.docs.length > 0) {
      console.log(`⚠️  Организация с email ${DEFAULT_ORGANISATION.email} уже существует`)
      console.log(`   ID: ${existingOrg.docs[0].id}`)
      console.log(`   Название: ${existingOrg.docs[0].name}`)
      process.exit(0)
    }

    // Создаем новую организацию
    const newOrg = await payload.create({
      collection: 'organisations',
      data: {
        name: DEFAULT_ORGANISATION.name,
        email: DEFAULT_ORGANISATION.email,
        password: DEFAULT_ORGANISATION.password,
      },
      overrideAccess: true,
    })

    console.log('✅ Организация успешно создана!')
    console.log(`   ID: ${newOrg.id}`)
    console.log(`   Название: ${newOrg.name}`)
    console.log(`   Email: ${DEFAULT_ORGANISATION.email}`)
    console.log(`   Пароль: ${DEFAULT_ORGANISATION.password}`)
  } catch (error) {
    console.error('❌ Ошибка при создании организации:', error)
    process.exit(1)
  }

  process.exit(0)
}

createOrganisation()
