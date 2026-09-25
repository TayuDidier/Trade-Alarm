# TradeAlarm 🚨

TradeAlarm is a modern, responsive, progressive web application (PWA) designed to provide wake-up and real-time audio/voice alerts for cryptocurrency, forex, and commodity market price levels.

## Features

- **Real-Time Market Feeds**: Live price streaming with zero configuration.
- **Continuous Wake-Up Alarms**: 10 synthesized audio alarms (air raid siren, digital alarm, industrial klaxon, etc.) with hardware vibration and screen wake-lock support.
- **Custom Trade Plans & Voice Callout**: Speaks your entry/exit strategy aloud upon price triggers via Web Speech Synthesis.
- **OLED Nightstand Bedside Mode**: Minimalist, dark clock display with live ticker monitoring designed for bedside overnight trading.
- **Responsive PWA**: Installable as a standalone app on iOS and Android with no address bar or tabs.

## Technology Stack

- **Frontend**: React 19, Vite
- **Styling**: Vanilla CSS Design System with responsive mobile suites
- **Icons**: Lucide React
- **Audio Engine**: Web Audio API (Synthesizers) + Web Speech Synthesis API
- **Deployment**: Vercel

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```
