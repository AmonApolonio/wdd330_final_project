import { loadHeaderFooter } from "./utils.mjs";
import "./router.js";
import { initializeSearch } from "./search.js";
import { fetchJSON } from "./fetchWrapper.js";
import { applySavedTheme } from "./theme.js";

// Import view modules
import "./views/HomeView.js";
import "./views/SearchView.js";
import "./views/DetailView.js";
import "./views/MyListView.js";
import "./views/QuotesView.js";
import "./views/SettingsView.js";

// Make fetchJSON available globally for components
window.fetchJSON = fetchJSON;

// Function to initialize the application
async function init() {
  // Apply saved theme first for smoother UI loading
  applySavedTheme();
  
  // Load header and footer
  await loadHeaderFooter();
  
  // Initialize search functionality after header is loaded
  // (since the search bar is in the header)
  initializeSearch();
}

// Start the application
init();
