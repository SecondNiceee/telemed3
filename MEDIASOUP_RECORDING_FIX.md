# MediaSoup Recording Fix - Проблема и Решение

## 🔴 Проблема

Записи MediaSoup сохранялись в файловую систему (`/tmp/mediasoup-recordings/`), но:
- ❌ Файлы НЕ загружались в коллекцию `Media` Payload CMS
- ❌ Записи НЕ появлялись на странице `/lk-org/consultation?id={}`
- ❌ В коллекции `call-recordings` Payload не создавались записи

Это произошло потому, что **процесс записи отделен от логики создания записей в базе данных**.

## ✅ Решение

Добавлена интеграция между MediaSoup сервером и Next.js API для **финализации записей**:

### 1. Два новых API endpoints:

#### `/api/mediasoup-recording/finalize` (клиент → сервер)
- Вызывается **клиентом** (врачом) при ручной остановке записи
- Требует **JWT токен врача** для аутентификации
- Загружает файл записи в Media коллекцию
- Создает CallRecording в базе данных
- **Файл:** `src/app/api/mediasoup-recording/finalize/route.ts`

#### `/api/mediasoup-recording/finalize-server` (сервер → сервер)
- Вызывается **MediaSoup сервером** при отключении врача
- Требует **MEDIASOUP_SERVER_SECRET** для аутентификации
- Используется когда врач разорвет соединение без явной остановки записи
- **Файл:** `src/app/api/mediasoup-recording/finalize-server/route.ts`

### 2. Изменения в MediaSoup провайдере

**Файл:** `src/components/video-call/video-call-provider-mediasoup.tsx`

- Добавлены refs для отслеживания времени начала записи:
  - `recordingStartTimeRef` - момент начала записи
  - `isAudioOnlyRef` - тип записи (видео/аудио)
  
- Обновлен `onRecordingStarted`:
  - Сохраняет время начала записи
  
- Обновлен `onRecordingStopped`:
  - Вызывает `/api/mediasoup-recording/finalize` для загрузки в Payload
  - Вычисляет длительность консультации
  - Показывает тост об успехе/ошибке
  
- Обновлен `handleCallEnded`:
  - Врач перед выходом останавливает запись (если она активна)
  - Это гарантирует, что финализация произойдет

### 3. Изменения в MediaSoup сервере

**Файл:** `src/mediasoup-server.ts`

Добавлена финализация в двух местах:

1. **При отключении врача** (disconnect handler):
   - Извлекает `appointmentId` из `roomId`
   - Вычисляет длительность записи
   - Вызывает `/api/mediasoup-recording/finalize-server`
   - Логирует успех/ошибку

2. **При пустой комнате** (последний пользователь вышел):
   - Аналогично, финализирует оставшуюся запись

## 🔧 Требуемые переменные окружения

Добавьте в `.env`:

```env
# Для внутреннего общения между MediaSoup сервером и Next.js
NEXTJS_URL=http://localhost:3000
MEDIASOUP_SERVER_SECRET=your-secret-key-here
RECORDING_OUTPUT_DIR=/tmp/mediasoup-recordings
```

### Важные замечания:
- `NEXTJS_URL` должен быть доступен из окружения, где запущен MediaSoup сервер
- `MEDIASOUP_SERVER_SECRET` должен быть **одинаковым** везде
- Если не установлены, используются defaults (но это небезопасно в продакшене)

## 📊 Процесс записи (с исправлением)

```
┌─────────────────────────────────────────────────────────────────┐
│                    ВРАЧ ИНИЦИИРУЕТ ЗАПИСЬ                        │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  MediaSoup Server    │
                    │  Начинает запись     │
                    │ /tmp/mediasoup-      │
                    │  recordings/         │
                    │  {sessionId}.webm    │
                    └──────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
 СЦЕНАРИЙ 1:          СЦЕНАРИЙ 2:           СЦЕНАРИЙ 3:
 Врач сам             Врач закрывает        Врач отключается
 останавливает        браузер/вкладку       неожиданно
 запись               (но соединение жив)
        │                      │                      │
        ▼                      ▼                      ▼
 Client API           Client + Server        Server API
 POST /finalize       POST /finalize         POST /finalize-server
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Payload CMS API     │
                    │  1. Создает Media    │
                    │  2. Создает          │
                    │     CallRecording    │
                    │  3. Удаляет temp.    │
                    │     файл             │
                    └──────────────────────┘
                               │
                               ▼
             ┌────────────────────────────────┐
             │ Запись видна на странице:      │
             │ /lk-org/consultation?id={id}   │
             └────────────────────────────────┘
```

## ✨ Результат

Теперь запись консультации:
1. ✅ Сохраняется в файловую систему (как и раньше)
2. ✅ Загружается в Media коллекцию Payload CMS
3. ✅ Создается запись в коллекции `call-recordings`
4. ✅ **Видна на странице `/lk-org/consultation?id={}`**

## 🐛 Отладка

Проверьте консоль/логи на наличие сообщений:
- `[MediaSoup Provider] Recording stopped`
- `[MediaSoup Provider] Finalizing recording`
- `[MediaSoup Provider] Recording finalized`
- `[MediaSoup] Finalizing recording for appointment`

Если видите ошибки, проверьте:
1. Переменные окружения (`NEXTJS_URL`, `MEDIASOUP_SERVER_SECRET`)
2. Права доступа на `/tmp/mediasoup-recordings`
3. Соединение между MediaSoup сервером и Next.js
4. JWT токен доктора (для route `/finalize`)

## 📝 Дополнительно

- Файлы записи удаляются из `/tmp` после успешной загрузки в Payload
- Пустые файлы автоматически удаляются без создания записи
- Длительность вычисляется из `recordingStartTime` или размера файла
- Тип записи (видео/аудио) сохраняется в `call-recordings.recordingType`
