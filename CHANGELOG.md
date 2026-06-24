# Changelog

All notable changes to Pawodoro will be documented in this file.

---

## [0.4.0] - 2026-06-25

### Skills-Driven Optimization

Installed and applied design insights from:
- **ui-ux-pro-max**: UI/UX design intelligence, color/typography data
- **game-development**: core loop design (action→reward→growth)
- **game-ai**: state machine patterns for pet mood transitions
- **frontend-design**: existing design system methodology

**New Component: CompletionRewardCard**
- Shown after each focus session (game design reward feedback)
- Displays XP earned, pet mood change, streak count
- Animated entry: spring bounce (0.3s) + staggered reward items
- Auto-dismiss after 4s with smooth exit
- Follows ux-guidelines: 150-300ms transitions, focus states

**Design System Data Applied**
- Pet Tech App color palette from colors.csv
- Soft Rounded typography pattern from typography.csv
- Animation duration guidelines from ux-guidelines.csv

---

## [0.3.0] - 2026-06-25

### Design System Overhaul

**Typography**
- Added Quicksand as display font (headlines, titles, stats)
- Added DM Sans as body font (text, descriptions)
- JetBrains Mono retained for time display only
- All section headers now use `font-display font-bold`
- Timer numbers use Quicksand font-bold as hero element

**Color Palette**
- `#1F1C18` — Surface 1 (base background)
- `#28251F` — Surface 2 (card background)
- `#4D8B3E` — Moss 500 (primary accent, nature/growth)
- `#E89B52` — Tea 400 (warm accent, rewards)
- `#FF8A8A` — Blush 300 (pet mood, affection)
- `#FFD700` — Honey 300 (XP, achievements)
- `#F5F0E8` — Cream 100 (text, warm off-white)

**Signature Element**
- Three warm glow orbs (moss/tea/blush) drift slowly in background
- Provides ambient atmosphere without distracting from content
- Unique to Pawodoro — not a default AI aesthetic

### Component Changes

**Timer.tsx**
- Removed 60 geometric tick marks (too clock-like for pet theme)
- Thicker 8px stroke for softer, organic feel
- Growing tip uses double drop-shadow for warmth
- Inner glow circle adds ambient depth
- Time display: Quicksand font-bold replaces mono font-light
- Pet interaction card: warm glow accent, refined mood/hunger bars
- SummaryPill: Quicksand font-semibold instead of mono
- PetActionButton: font-display labels, cream-300/60 counts

**Stats.tsx**
- Full rewrite with new design system
- StatCard: hover-lift effect with color-coded backgrounds
- AllTimeStat: clean grid layout with warm glow accent
- Weekly mini bar chart with animated bars
- Quicksand font-display on all headings

**Onboarding.tsx**
- Background warm glow orb for atmosphere
- Quicksand font-display on titles
- Refined color tokens (cream-400/50 for descriptions)

**Settings.tsx**
- All section headers: `font-display font-bold text-cream-200`
- SettingRow labels: `font-display text-cream-300/60`
- Toggle animation unchanged (already polished)

**PetCreator.tsx**
- Selection labels: `font-display font-medium`
- Descriptions: `cream-400/30` for softer hierarchy
- Pet bounce animation on header icon

**App.tsx**
- Signature warm glow orbs in background (moss/tea/blush)
- Header: Quicksand font-display font-bold
- Tab bar: subtle gradient top border, refined indicator

### Technical

- CSS `@import` order fixed (must precede `@tailwind` directives)
- Removed dead code: `PetDisplay.tsx` (replaced by PetSprite)
- Eliminated all gray-600/500/400 — entire app uses warm cream-400/XX palette
- ErrorBoundary: Quicksand header, warm error message, cream tones
- Achievements + Heatmap: consistent Quicksand typography
- Pet interaction card: warm glow accent, refined mood/hunger bars
- SummaryPill: Quicksand font-semibold
- Auto-test loop stable: 54/54 tests passing
- Build time: ~550ms
- Bundle: popup JS 209KB (gzip 64KB), CSS 27KB (gzip 6KB)

---

## [0.2.0] - 2026-06-24

### Tab Switching Fix
- Removed `disabled={isRunning}` from tab buttons
- Background handler now allows runtime session switching
- Timer engine no longer blocks switching while running

### Pet System
- 4 species (shiba, cat, rabbit, fox) with chibi art
- PetSprite.tsx: STATE_MAP for species-specific states
- Frame animation support (idle, walk, hatch)
- Onboarding shows pet images instead of emoji

### Animation & Interaction
- Tab direction-aware sliding animation
- Confetti celebration on timer completion
- Web Audio API sound effects (start/pause/skip/reset/complete)
- Keyboard shortcuts with visual hints (? to toggle)

---

## [0.1.0] - 2026-06-23

### Initial Release
- Chrome extension with popup UI
- 25/5/15 minute cycles
- Background alarm timer
- Notification reminders
- Google Drive sync
- Basic pet creation and display
