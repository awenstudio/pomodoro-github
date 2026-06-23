# Privacy Policy — Pomodoro GitHub

**Last updated:** June 2026

## Data Collection

Pomodoro GitHub does **not** collect, transmit, or sell any personal data.

## Local Storage

All timer data, settings, and session history are stored locally in your browser using `chrome.storage.local`. This data never leaves your device unless you explicitly enable cloud sync.

## Cloud Sync (Optional)

If you choose to connect your Google account:

- Data is stored in your **Google Drive AppData** folder — a hidden, private folder accessible only to this extension
- The extension requests only the `drive.appdata` scope (minimal access)
- No data is sent to any third-party servers
- You can disconnect at any time, which revokes the extension's access

## Permissions

| Permission | Purpose |
|-----------|---------|
| `alarms` | Timer tick mechanism (survives browser idle) |
| `notifications` | Alert when focus/break sessions end |
| `storage` | Save timer data and settings locally |
| `identity` | Google account login for optional cloud sync |

## Third-Party Services

- **Google OAuth** — Used only for Drive AppData access. The extension does not access your emails, files, or other Google services.
- **Google Drive API** — Used only to read/write a single JSON file in the AppData folder.

## Changes

This privacy policy may be updated occasionally. Changes will be reflected in the extension's Chrome Web Store listing.

## Contact

For questions, open an issue on [GitHub](https://github.com/awenstudio/pomodoro-github).
