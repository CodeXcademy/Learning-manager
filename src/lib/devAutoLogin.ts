/**
 * REMOVE_DEV_AUTO_LOGIN — Delete this module and its use in main.tsx when real auth is required.
 * See REMOVE_DEV_AUTO_LOGIN.txt in the repo root.
 */
const apiBase =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ?? 'http://127.0.0.1:8000/api/v1';

const LS_ACCESS = 'lm_access_token';
const LS_REFRESH = 'lm_refresh_token';

function isDevAutoLoginEnabled(): boolean {
  if (import.meta.env.VITE_DEV_AUTO_LOGIN === 'false') {
    return false;
  }
  if (import.meta.env.VITE_DEV_AUTO_LOGIN === 'true') {
    return true;
  }
  // Default on until REMOVE_DEV_AUTO_LOGIN; set VITE_DEV_AUTO_LOGIN=false to disable.
  return true;
}

export async function applyDevAutoLogin(): Promise<void> {
  if (!isDevAutoLoginEnabled()) {
    return;
  }
  try {
    const res = await fetch(`${apiBase}/auth/dev-bootstrap`, { method: 'POST' });
    if (!res.ok) {
      return;
    }
    const data = (await res.json()) as {
      access_token: string;
      refresh_token: string;
    };
    localStorage.setItem(LS_ACCESS, data.access_token);
    localStorage.setItem(LS_REFRESH, data.refresh_token);
  } catch {
    /* backend may still be starting; user can refresh */
  }
}

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(LS_ACCESS);
}
