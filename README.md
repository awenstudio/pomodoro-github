# 🍅 Pomodoro GitHub

A developer-focused Pomodoro timer Chrome extension with Google account cloud sync.

## Features

- **Pomodoro Timer** — 25/5/15 focus/break cycles, fully customizable
- **Google Cloud Sync** — One-click Gmail login, data stored in your private Google Drive
- **Statistics** — Daily/weekly/monthly stats, GitHub-style heatmap
- **Achievements** — Unlock milestones as you build focus streaks
- **Keyboard Shortcuts** — Space (start/pause), S (skip), R (reset)
- **Dark Theme** — Easy on the eyes during long coding sessions
- **Offline-First** — Works fully offline, syncs when connected
- **Sound Effects** — Chimes on session complete (Web Audio API, no files)
- **Onboarding** — Guided first-time experience

## Quick Start

```bash
npm install
npm run build
```

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `dist/` folder

## Google Cloud Setup (for sync)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Google Drive API** (APIs & Services → Library)
4. Create **OAuth 2.0** credential (APIs & Services → Credentials)
   - Application type: **Chrome Extension**
   - Application ID: your extension ID (visible in `chrome://extensions/`)
5. Copy the **Client ID** into `src/manifest.json` → `oauth2.client_id`
6. Rebuild: `npm run build`

## Architecture

```
src/
├── background/          # Service Worker (alarm-based timer)
├── popup/               # React 18 UI
│   ├── components/      # Timer, Stats, Settings, Heatmap, etc.
│   └── hooks/           # useTimer — bridge to background
├── lib/                 # Core logic (no side-effects)
│   ├── timer-engine.ts  # Pure state machine
│   ├── storage.ts       # chrome.storage wrapper
│   ├── google-auth.ts   # OAuth via chrome.identity
│   ├── google-drive-sync.ts  # Drive AppData sync
│   ├── sounds.ts        # Web Audio API tones
│   └── notifications.ts # Chrome notifications
├── stores/              # Zustand state management
├── types/               # TypeScript definitions
└── styles/              # Tailwind CSS
```

### Key Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Build | Vite + CRXJS | HMR, Manifest V3 native |
| UI | React 18 + Tailwind | Component reuse, fast styling |
| State | Zustand | Lightweight, storage persistence |
| Timer | `chrome.alarms` | Survives Service Worker termination |
| Sync | Google Drive AppData | Hidden folder, user-only access |
| Auth | `chrome.identity` | Native Chrome OAuth, no redirects |

### Timer Reliability

Chrome MV3 Service Workers are terminated after ~30s of inactivity. This extension uses **`chrome.alarms`** for the tick mechanism instead of `setInterval`, ensuring the timer survives SW restarts. The timer state is persisted to `chrome.storage.local` on every tick.

## Testing

```bash
npx vitest run        # Run all tests
npx vitest run --ui   # Interactive UI
```

54 unit tests covering:
- Timer engine: all state transitions, edge cases, cycle logic
- Storage: read/write, concurrent safety, default fallbacks
- Pure functions: `formatTime`, `getProgress`

## Publishing to Chrome Web Store

1. Create a ZIP of the `dist/` folder
2. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Pay the one-time $5 registration fee
4. Upload the ZIP, fill in store listing details
5. Submit for review (typically 1-3 business days)

## Privacy

- All data stored locally in `chrome.storage.local`
- Google token managed by `chrome.identity` (never exposed to the extension)
- Sync uses your private Google Drive AppData folder
- No analytics, no tracking, no third-party servers

## License

MIT
