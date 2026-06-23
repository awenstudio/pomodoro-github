/* ─────────────────────────────────────────────────────
 *  Google Auth — chrome.identity wrapper for
 *  seamless Google account login.
 * ───────────────────────────────────────────────────── */

export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
}

/**
 * Get an OAuth token via chrome.identity.
 * Uses interactive=true on first call to prompt login.
 */
export async function getAuthToken(interactive = false): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken(
      { interactive },
      (token) => {
        if (chrome.runtime.lastError || !token) {
          reject(
            new Error(
              chrome.runtime.lastError?.message || 'Failed to get auth token',
            ),
          );
        } else {
          resolve(token);
        }
      },
    );
  });
}

/**
 * Remove cached token (for logout / token refresh).
 */
export async function removeAuthToken(): Promise<void> {
  try {
    const token = await getAuthToken(false);
    await new Promise<void>((resolve) => {
      chrome.identity.removeCachedAuthToken({ token }, resolve);
    });
  } catch {
    // No token cached — that's fine
  }
}

/**
 * Fetch the user's Google profile info.
 */
export async function getGoogleUser(token: string): Promise<GoogleUser> {
  const res = await fetch(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch user info: ${res.status}`);
  }

  const data = await res.json();
  return {
    email: data.email,
    name: data.name,
    picture: data.picture,
  };
}

/**
 * Full login flow: get token + fetch user info.
 */
export async function signIn(): Promise<{
  token: string;
  user: GoogleUser;
}> {
  const token = await getAuthToken(true);
  const user = await getGoogleUser(token);
  return { token, user };
}

/**
 * Sign out: revoke token + clear cached token.
 */
export async function signOut(): Promise<void> {
  try {
    const token = await getAuthToken(false);
    // Revoke the token server-side
    await fetch(
      `https://accounts.google.com/o/oauth2/revoke?token=${token}`,
    );
    await removeAuthToken();
  } catch {
    // Best-effort
  }
}
