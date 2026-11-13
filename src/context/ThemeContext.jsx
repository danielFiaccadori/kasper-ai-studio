import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { loadUserSettings, saveUserSettings } from '../utils/themeStorage';
import { ThemeContext } from './themeContextInstance';

export function ThemeProvider({ children }) {
  const [settings, setSettings] = useState(() => loadUserSettings());
  const theme = settings.appearance?.theme || 'light';

  const getSystemTheme = useCallback(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    return theme === 'system' ? getSystemTheme() : theme;
  });

  // Apply theme to document element and listen to OS changes if theme === 'system'
  useEffect(() => {
    const applyTheme = (targetTheme) => {
      document.documentElement.setAttribute('data-theme', targetTheme);
      document.documentElement.style.colorScheme = targetTheme;
      setResolvedTheme(targetTheme);
    };

    if (theme === 'system') {
      const currentSys = getSystemTheme();
      applyTheme(currentSys);

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleMediaChange = (e) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleMediaChange);
      return () => {
        mediaQuery.removeEventListener('change', handleMediaChange);
      };
    } else {
      applyTheme(theme);
    }
  }, [theme, getSystemTheme]);

  const setTheme = useCallback((newTheme) => {
    if (!['light', 'dark', 'system'].includes(newTheme)) return;

    setSettings((prev) => {
      const updated = {
        ...prev,
        appearance: {
          ...prev.appearance,
          theme: newTheme
        }
      };
      saveUserSettings(updated);
      return updated;
    });
  }, []);

  const getSerializedSettings = useCallback(() => {
    return {
      appearance: {
        theme
      }
    };
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      isDark: resolvedTheme === 'dark',
      setTheme,
      getSerializedSettings
    }),
    [theme, resolvedTheme, setTheme, getSerializedSettings]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
