/**
 * Скрипт для создания врачей
 * Требует предварительного создания категорий (create-categories.ts)
 * Запуск: pnpm tsx scripts/create-doctors.ts
 */

import { getPayload } from 'payload'
import config from '@/payload.config'
import { DOCTORS, DEFAULT_ORGANISATION } from './seed-data.config'

async function createDoctors() {
  console.log('🚀 Подключение к Payload CMS...')
  
  const payload = await getPayload({ config })
  console.log('✅ Подключение установлено\n')

  // 1. Получаем или создаем организацию
  console.log('🏥 Проверка организации...')
  
  let organisation = await payload.find({
    collection: 'organisations',
    where: {
      email: { equals: DEFAULT_ORGANISATION.email },
    },
    limit: 1,
  })

  let organisationId: number | string

  if (organisation.docs.length > 0) {
    organisationId = organisation.docs[0].id
    console.log(`✅ Организация найдена: ${DEFAULT_ORGANISATION.name} (ID: ${organisationId})`)
  } else {
    const created = await payload.create({
      collection: 'organisations',
      data: {
        name: DEFAULT_ORGANISATION.name,
        email: DEFAULT_ORGANISATION.email,
        password: DEFAULT_ORGANISATION.password,
      },
      overrideAccess: true,
    })
    organisationId = created.id
    console.log(`✅ Создана организация: ${DEFAULT_ORGANISATION.name} (ID: ${organisationId})`)
  }

  // 2. Получаем все категории для маппинга slug -> id
  console.log('\n📁 Загрузка категорий...')
  
  const categoriesResult = await payload.find({
    collection: 'doctor-categories',
    limit: 100,
  })

  const categoryMap = new Map<string, number | string>()
  for (const cat of categoriesResult.docs) {
    categoryMap.set(cat.slug, cat.id)
  }

  if (categoryMap.size === 0) {
    console.error('❌ Категории не найдены! Сначала запустите: pnpm tsx scripts/create-categories.ts')
    process.exit(1)
  }

  console.log(`✅ Загружено категорий: ${categoryMap.size}`)

  // 3. Создаем врачей
  console.log('\n👨‍⚕️ Создание врачей...\n')

  for (const doctor of DOCTORS) {
    try {
      // Проверяем, существует ли врач
      const existing = await payload.find({
        collection: 'doctors',
        where: {
          email: { equals: doctor.email },
        },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        console.log(`⚠️  Врач "${doctor.name}" уже существует (email: ${doctor.email})`)
        continue
      }

      // Получаем ID категории
      const categoryId = categoryMap.get(doctor.categorySlug)
      if (!categoryId) {
        console.error(`❌ Категория "${doctor.categorySlug}" не найдена для врача "${doctor.name}"`)
        continue
      }

      // Создаем врача
      const created = await payload.create({
        collection: 'doctors',
        data: {
          name: doctor.name,
          email: doctor.email,
          password: doctor.password,
          organisation: organisationId,
          categories: [categoryId],
          experience: doctor.experience,
          degree: doctor.degree,
          price: doctor.price,
          bio: doctor.bio,
          education: doctor.education.map((value) => ({ value })),
          services: doctor.services.map((value) => ({ value })),
          slotDuration: doctor.slotDuration,
        },
        overrideAccess: true,
      })

      console.log(`✅ Создан врач: ${doctor.name} (ID: ${created.id}, категория: ${doctor.categorySlug})`)
    } catch (error) {
      console.error(`❌ Ошибка при создании врача "${doctor.name}":`, error)
    }
  }

  console.log('\n📋 Сводка:')
  console.log(`   Организация: ${DEFAULT_ORGANISATION.name}`)
  console.log(`   Email орг.: ${DEFAULT_ORGANISATION.email}`)
  console.log(`   Пароль орг.: ${DEFAULT_ORGANISATION.password}`)
  console.log(`   Пароль врачей: Doctor123!`)

  console.log('\n🎉 Готово!')
  process.exit(0)
}

createDoctors().catch((error) => {
  console.error('❌ Критическая ошибка:', error)
  process.exit(1)
})
