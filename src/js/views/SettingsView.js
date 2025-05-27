import { applyTheme } from '../theme.js';

class SettingsView {
  /**
   * Render the settings view
   */
  render() {
    // Container is already rendered by router.js
    this.initializeSettings();
  }
  
  /**
   * Initialize the settings form
   */
  initializeSettings() {
    // Get the settings form
    const settingsForm = document.getElementById('settings-form');
    const themeSelect = document.getElementById('theme-select');
    
    // Load the current theme setting
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Set the form to the current theme
    if (themeSelect) {
      themeSelect.value = currentTheme;
    }
    
    // Add event listener to save settings
    if (settingsForm) {
      settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get the selected theme
        const theme = themeSelect.value;
        
        // Apply the theme (this also saves to localStorage)
        applyTheme(theme);
        
        // Show a success message
        alert('Settings saved!');
      });
    }
  }
}

// Make it available globally
window.SettingsView = new SettingsView();
