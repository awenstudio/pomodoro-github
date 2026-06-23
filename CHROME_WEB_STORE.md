# Chrome Web Store Publishing Checklist

## Pre-Submission

- [ ] Extension builds without errors (`npm run build`)
- [ ] All tests pass (`npx vitest run`)
- [ ] `manifest.json` has correct version, name, description
- [ ] `oauth2.client_id` is set to real Google Cloud client ID
- [ ] Icons are present at 16x16, 48x48, 128x128
- [ ] No `console.log` statements in production build
- [ ] No source maps in production build

## Store Listing

### Required
- [ ] Extension name: "Pomodoro GitHub"
- [ ] Short description (132 chars max)
- [ ] Detailed description
- [ ] Category: Productivity
- [ ] Language: English

### Screenshots (at least 1)
- [ ] 1280x800 or 640x400
- [ ] Timer view
- [ ] Stats view with heatmap
- [ ] Settings view with Google login

### Privacy
- [ ] Privacy policy URL
- [ ] Single purpose description: "Help users manage focus time with Pomodoro technique"
- [ ] Permissions justification:
  - `alarms`: Timer tick mechanism
  - `notifications`: Session complete alerts
  - `storage`: Local data persistence
  - `identity`: Google account login for cloud sync

## Privacy Policy

This extension:
- Does NOT collect personal data
- Does NOT send data to third-party servers
- Stores timer data locally in Chrome storage
- Syncs data only to the user's own Google Drive (AppData folder)
- Uses Google OAuth only for Drive access, with minimal scope (`drive.appdata`)
- Does NOT track users across websites
- Does NOT use analytics or telemetry

## Submission

- [ ] Upload ZIP to Chrome Web Store Developer Dashboard
- [ ] Fill in all required fields
- [ ] Add screenshots
- [ ] Submit for review
- [ ] Wait 1-3 business days for approval
