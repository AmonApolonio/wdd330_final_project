import { loadHeaderFooter } from "./utils.mjs";
import "./router.js";
import { initializeSearch } from "./search.js";
import { fetchJSON } from "./fetchWrapper.js";

// Make fetchJSON available globally for components
window.fetchJSON = fetchJSON;

// Function to initialize the application
async function init() {
  // Load header and footer
  await loadHeaderFooter();
  
  // Initialize search functionality after header is loaded
  // (since the search bar is in the header)
  initializeSearch();
}

// Start the application
init();
