# 🍅 Pomodoro GitHub

A developer-focused Pomodoro timer Chrome extension with GitHub Gist cloud sync.

## Features

- **Pomodoro Timer** — 25/5/15 focus/break cycles with customizable durations
- **GitHub Sync** — Private Gist-based cloud sync, no backend needed
- **Statistics** — Daily stats, streak tracking, session history
- **Achievements** — Unlock milestones as you focus
- **Keyboard Shortcuts** — Space (start/pause), S (skip), R (reset)
- **Dark Theme** — Easy on the eyes during long coding sessions
- **Offline-First** — Works fully offline, syncs when connected

## Install (Development)

```bash
npm install
npm run build
```

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" → select the `dist/` folder

## Architecture

```
src/
├── background/        # Service Worker (timer engine, alarms)
├── popup/             # React UI (components, hooks)
├── lib/               # Core logic (timer, storage, sync)
├── stores/            # Zustand state management
├── types/             # TypeScript definitions
└── styles/            # Tailwind CSS
```

### Key Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Build | Vite + CRXJS | HMR, Manifest V3 native support |
| UI | React 18 + Tailwind | Component reuse, rapid styling |
| State | Zustand | Lightweight, chrome.storage persistence |
| Sync | GitHub Gist | Zero backend, user owns their data |
| Timer | Service Worker + alarms | Survives popup close |

## Privacy

- All data stored locally in `chrome.storage.local`
- GitHub token stored locally, never sent to third parties
- Sync uses your own private GitHub Gist
- No analytics, no tracking

## License

MIT
