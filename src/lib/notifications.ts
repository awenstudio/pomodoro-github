/* ─────────────────────────────────────────────────────
 *  Notifications — Chrome notification wrapper with
 *  permission checks and sound support.
 * ───────────────────────────────────────────────────── */

export async function showNotification(
  title: string,
  body: string,
  iconUrl = 'icons/tomato128.png',
): Promise<void> {
  try {
    // Check permission
    const hasPermission = await chrome.permissions.contains({
      permissions: ['notifications'],
    });

    if (!hasPermission) return;

    chrome.notifications.create({
      type: 'basic',
      iconUrl,
      title,
      message: body,
      priority: 2,
      silent: false,
    });
  } catch {
    // Notifications may not be available in all contexts
  }
}

export function clearAllNotifications(): void {
  chrome.notifications.getAll((notifications) => {
    for (const id of Object.keys(notifications)) {
      chrome.notifications.clear(id);
    }
  });
}
