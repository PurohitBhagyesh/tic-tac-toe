// Theme Manager for Light and Dark Modes (Whitish-Bluish Palette)
const THEME_KEY = 'ttt_theme_mode';

export const getStoredTheme = () => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // default theme
  } catch (e) {
    return 'dark';
  }
};

export const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === 'light') {
    root.setAttribute('data-theme', 'light');
  } else {
    root.setAttribute('data-theme', 'dark');
  }
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {}
};

export const toggleTheme = () => {
  const current = getStoredTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
};
