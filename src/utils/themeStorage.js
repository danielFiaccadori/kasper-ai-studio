export const STORAGE_KEY = 'kasper_user_settings';

/**
 * Loads serialized user settings from localStorage.
 * Defensive fallback ensures valid schema and graceful error handling.
 */
export function loadUserSettings() {
  if (typeof window === 'undefined') {
    return { appearance: { theme: 'light' } };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        parsed.appearance &&
        ['light', 'dark', 'system'].includes(parsed.appearance.theme)
      ) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to parse kasper_user_settings from storage:', error);
  }
  return { appearance: { theme: 'light' } };
}

/**
 * Persists serialized user settings to localStorage.
 * Ready for future backend sync (e.g. PATCH /api/v1/user/preferences).
 */
export function saveUserSettings(settings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to persist user settings:', error);
  }
}
