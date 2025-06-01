import { loadHeaderFooter } from "./utils.mjs";
import "./router.js";
import { initializeSearch } from "./search.js";
import { fetchJSON } from "./fetchWrapper.js";

// Import view modules
import "./views/HomeView.js";
import "./views/SearchView.js";
import "./views/DetailView.js";
import "./views/MyListView.js";
import "./views/QuotesView.js";

// Make fetchJSON available globally for components
window.fetchJSON = fetchJSON;

// Function to initialize the application
async function init() {
  // Load header and footer
  await loadHeaderFooter();
  
  // Initialize search functionality after header is loaded
  // (since the search bar is in the header)
  initializeSearch();
    // Make sure all the DOM elements are ready and views are defined
  // before triggering the router
  setTimeout(() => {
    console.log("Initializing router with HomeView defined:", !!window.HomeView);
    console.log("App element exists:", !!document.getElementById("app"));
    
    // Trigger router to load the initial view AFTER header/footer are loaded
    if (window.location.hash) {
      window.dispatchEvent(new Event('hashchange'));
    } else {
      window.location.hash = '#/home';
    }
  }, 100); // Small delay to ensure everything is loaded
}

// Start the application
init();
