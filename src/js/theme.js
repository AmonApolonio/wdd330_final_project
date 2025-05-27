/**
 * Apply the saved theme setting from localStorage
 */
export function applySavedTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
}

/**
 * Change the current theme
 * @param {string} theme - The theme to apply ('light' or 'dark')
 */
export function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
  
  // Save to localStorage
  localStorage.setItem('theme', theme);
}
