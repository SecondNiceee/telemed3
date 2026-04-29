# Переход с PeerJS на MediaSoup

> Время: ~5 минут

---

## Шаг 1: Остановить PeerJS сервер

```bash
# Найти и остановить процесс PeerJS
pkill -f peer-server

# Или если используете PM2
pm2 stop peer-server
```

---

## Шаг 2: Настроить firewall (один раз)

```bash
# Открыть порты для MediaSoup
sudo ufw allow 3002/tcp    # Signaling (Socket.IO)
sudo ufw allow 40000/udp   # WebRTC media
sudo ufw allow 40000/tcp   # WebRTC media (TCP fallback)
```

---

## Шаг 3: Установить зависимости (один раз)

```bash
# Системные зависимости (Ubuntu/Debian)
sudo apt update
sudo apt install -y build-essential python3 ffmpeg

# npm пакеты
pnpm add mediasoup mediasoup-client
```

---

## Шаг 4: Настроить переменные окружения

```bash
# В .env или .env.local добавить:

# Включить MediaSoup на клиенте
NEXT_PUBLIC_USE_MEDIASOUP=true
NEXT_PUBLIC_MEDIASOUP_URL=http://localhost:3002

# Для production:
# NEXT_PUBLIC_MEDIASOUP_URL=https://your-domain.com:3002

# Публичный IP сервера (для production)
# MEDIASOUP_ANNOUNCED_IP=123.456.789.0
```

---

## Шаг 5: Запустить MediaSoup сервер

```bash
# Development
pnpm mediasoup

# Production (с PM2)
pm2 start "pnpm mediasoup" --name mediasoup-server

# Или с указанием IP
MEDIASOUP_ANNOUNCED_IP=your.public.ip pnpm mediasoup
```

---

## Шаг 6: Перезапустить Next.js

```bash
# Чтобы применить новые переменные окружения
pnpm dev

# Или для production
pm2 restart nextjs-app
```

---

## Проверка

1. Откройте консоль браузера
2. Должно быть сообщение: `[MediaSoup] Connected to server`
3. При звонке в Network должны быть WebSocket сообщения к порту 3002

---

## Порты

| Порт | Протокол | Назначение |
|------|----------|------------|
| 3002 | TCP | Socket.IO signaling |
| 40000 | UDP/TCP | WebRTC media (все соединения через WebRtcServer) |

---

## Откат на PeerJS

Если что-то пошло не так, см. [TURN_ON_PEER.md](./TURN_ON_PEER.md)
