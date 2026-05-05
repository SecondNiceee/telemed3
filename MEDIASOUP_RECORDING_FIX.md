# MediaSoup Recording - Серверная финализация

## Архитектура

Записи видео/аудио консультаций теперь **полностью управляются на сервере**:

1. **При старте записи** (`start-recording`) - сервер извлекает `appointmentId` из `roomId` и сохраняет его в сессии записи
2. **При остановке записи** (`stop-recording`) - сервер **автоматически** загружает файл в Payload CMS и создает `CallRecording`
3. **При отключении врача** - сервер тоже автоматически финализирует запись

## Преимущества

- **Надежность**: запись всегда сохраняется, даже если врач закрыл вкладку
- **Безопасность**: клиент не участвует в процессе сохранения записи
- **Простота**: меньше кода на клиенте, меньше точек отказа

## Поток данных

```
┌─────────────────────────────────────────────────────────────────┐
│                    ВРАЧ НАЧИНАЕТ ЗАПИСЬ                         │
│               emit('start-recording', { roomId })               │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  MediaSoup Server    │
                    │                      │
                    │  1. Извлекает        │
                    │     appointmentId    │
                    │     из roomId        │
                    │                      │
                    │  2. Сохраняет в      │
                    │     RecordingSession │
                    │                      │
                    │  3. Начинает запись  │
                    │     через FFmpeg     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Запись идет...     │
                    │   /tmp/mediasoup-    │
                    │   recordings/        │
                    │   {sessionId}.webm   │
                    └──────────┬───────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
 СЦЕНАРИЙ 1:          СЦЕНАРИЙ 2:           СЦЕНАРИЙ 3:
 Врач вызывает        Врач отключается      Комната пустеет
 stop-recording       (disconnect)
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  СЕРВЕР вызывает     │
                    │  /api/mediasoup-     │
                    │  recording/          │
                    │  finalize-server     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Payload CMS API     │
                    │                      │
                    │  1. Находит doctor   │
                    │     из appointment   │
                    │                      │
                    │  2. Загружает файл   │
                    │     в Media          │
                    │                      │
                    │  3. Создает          │
                    │     CallRecording    │
                    │                      │
                    │  4. Удаляет temp     │
                    │     файл             │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  emit('recording-    │
                    │  stopped', {         │
                    │    finalized: true,  │
                    │    recordingId: 123  │
                    │  })                  │
                    └──────────────────────┘
```

## Измененные файлы

### Сервер

**`src/lib/mediasoup/recorder.ts`**
- `RecordingSession` теперь содержит `appointmentId` и `recordingType`
- `startRecording()` принимает `appointmentId` и `recordingType`

**`src/mediasoup-server.ts`**
- `start-recording` - извлекает `appointmentId` из `roomId`, передает в recorder
- `stop-recording` - **автоматически вызывает** `/api/mediasoup-recording/finalize-server`
- Событие `recording-stopped` теперь содержит `finalized` и `recordingId`

### Клиент

**`src/components/video-call/hooks/use-mediasoup-connection.ts`**
- `startRecording(recordingType)` - принимает тип записи
- `onRecordingStopped` - принимает `finalized` и `recordingId`

**`src/components/video-call/video-call-provider-mediasoup.tsx`**
- Убрана клиентская финализация из `onRecordingStopped`
- Показывает toast в зависимости от `finalized` флага
- `startServerRecording(recordingType)` - передает тип записи

## Переменные окружения

```env
# URL Next.js приложения (для server-to-server вызовов)
NEXTJS_URL=http://localhost:3000

# Секрет для аутентификации server-to-server
MEDIASOUP_SERVER_SECRET=your-secret-key-here

# Директория для временных файлов записей
RECORDING_OUTPUT_DIR=/tmp/mediasoup-recordings
```

## API Endpoints

### `/api/mediasoup-recording/finalize-server` (POST)

Вызывается **MediaSoup сервером** для финализации записи.

**Тело запроса:**
```json
{
  "appointmentId": 123,
  "sessionId": "appointment_123-1234567890",
  "durationSeconds": 300,
  "recordingType": "video",
  "serverSecret": "your-secret-key"
}
```

**Ответ:**
```json
{
  "success": true,
  "recordingId": 456,
  "mediaId": 789
}
```

### `/api/mediasoup-recording/finalize` (POST)

Устаревший endpoint для клиентской финализации (больше не используется).
Требует JWT токен врача в cookie `doctors-token`.

## Отладка

Проверьте логи MediaSoup сервера:
```
[MediaSoup] Recording stopped for room appointment_123, file: /tmp/mediasoup-recordings/appointment_123-1234567890.webm
[MediaSoup] Finalizing recording for appointment 123...
[MediaSoup] Recording finalized successfully: recordingId=456
```

Проверьте логи Next.js:
```
[MediaSoupRecording/FinalizeServer] Starting server-side finalization
[MediaSoupRecording/FinalizeServer] Request data: { appointmentId: 123, sessionId: '...', ... }
[MediaSoupRecording/FinalizeServer] Recording file found, size: 12345678
[MediaSoupRecording/FinalizeServer] Media uploaded, ID: 789
[MediaSoupRecording/FinalizeServer] CallRecording created, ID: 456
```

Если финализация не работает:
1. Проверьте `NEXTJS_URL` - должен быть доступен из MediaSoup сервера
2. Проверьте `MEDIASOUP_SERVER_SECRET` - должен совпадать
3. Проверьте права на `/tmp/mediasoup-recordings`
4. Проверьте что файл записи существует и не пустой
