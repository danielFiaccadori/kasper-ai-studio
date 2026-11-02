import { createContext } from 'react';

export const ThemeContext = createContext({
  theme: 'system',
  resolvedTheme: 'dark',
  isDark: true,
  setTheme: () => {},
  getSerializedSettings: () => ({ appearance: { theme: 'system' } })
});
