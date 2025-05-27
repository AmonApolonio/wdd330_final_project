// Router module for handling navigation

const routes = {
  '#/home': { 
    viewModule: 'HomeView',
    fallback: renderHome 
  },
  '#/search': { 
    viewModule: 'SearchView',
    fallback: renderSearch 
  },
  '#/detail/:id': { 
    viewModule: 'DetailView',
    fallback: renderDetail 
  },
  '#/my-list': { 
    viewModule: 'MyListView',
    fallback: renderMyList 
  },
  '#/settings': { 
    viewModule: 'SettingsView',
    fallback: renderSettings 
  }
};

/**
 * Parse the current hash and extract any parameters
 * @param {string} hash - The current URL hash
 * @returns {Object} - The parsed route and parameters
 */
function parseRoute(hash) {
  // Default to home if no hash is provided
  if (!hash || hash === '#') {
    return { route: '#/home', param: null };
  }
  
  // Handle route with parameter (currently only detail route has a parameter)
  if (hash.startsWith('#/detail/')) {
    const id = hash.split('/')[2];
    return { route: '#/detail/:id', param: id };
  }
  
  // Return the hash as-is for routes without parameters
  return { route: hash, param: null };
}

/**
 * Main router function that determines which view to render
 */
function router() {
  // Parse the current hash
  const { route, param } = parseRoute(window.location.hash);
  
  // Get the route handler
  const routeHandler = routes[route];
  
  // If route exists in our routes object
  if (routeHandler) {
    const { viewModule, fallback } = routeHandler;
    
    // Try to use the view module if it exists
    if (window[viewModule] && typeof window[viewModule].render === 'function') {
      // Call the view module's render method with any parameter
      window[viewModule].render(param);
    } else {
      // Fall back to the default render function if view module isn't available
      fallback(param);
    }
  } else {
    // Default to home if route is not found
    if (window.HomeView && typeof window.HomeView.render === 'function') {
      window.HomeView.render();
    } else {
      renderHome();
    }
  }
}

/**
 * Helper function to programmatically navigate to a different view
 * @param {string} hash - The hash to navigate to
 */
function navigate(hash) {
  if (window.location.hash !== hash) {
    // Update the URL hash, which will trigger the hashchange event
    window.location.hash = hash;
  } else {
    // If we're already on this hash, just re-render the route
    router();
  }
}

// Make navigate function available globally
window.navigate = navigate;

// Set up event listeners
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', () => {
  // Initialize the router
  router();
});

function renderHome() {
  const appElement = document.getElementById("app");
  if (appElement) {
    appElement.innerHTML = `
      <section class="home-view">
        <h1>Welcome to Anime Browse</h1>
        <div class="featured-anime">
          <h2>Featured Anime</h2>
          <div class="anime-grid" id="featured-container">
            <!-- Featured anime will be loaded here -->
            <p>Loading featured anime...</p>
          </div>
        </div>
      </section>
    `;
  }
}

function renderSearch() {
  const appElement = document.getElementById("app");
  if (appElement) {
    appElement.innerHTML = `
      <section class="search-view">
        <h1>Search Anime</h1>
        <div class="search-results" id="search-results-container">
          <!-- Search results will be loaded here -->
          <p>Use the search bar above to find anime</p>
        </div>
      </section>
    `;
  }
}

function renderDetail(id) {
  const appElement = document.getElementById("app");
  if (appElement) {
    appElement.innerHTML = `
      <section class="detail-view">
        <h1>Anime Details</h1>
        <div class="anime-detail" id="anime-detail-container" data-id="${id}">
          <!-- Anime details will be loaded here -->
          <p>Loading anime details...</p>
        </div>
      </section>
    `;
  }
}

function renderMyList() {
  const appElement = document.getElementById("app");
  if (appElement) {
    appElement.innerHTML = `
      <section class="my-list-view">
        <h1>My Anime List</h1>
        <div class="my-list-container" id="my-list-container">
          <!-- My list will be loaded here -->
          <p>Your saved anime will appear here</p>
        </div>
      </section>
    `;
  }
}

function renderSettings() {
  const appElement = document.getElementById("app");
  if (appElement) {
    appElement.innerHTML = `
      <section class="settings-view">
        <h1>Settings</h1>
        <form id="settings-form">
          <div class="form-group">
            <label for="theme-select">Theme</label>
            <select id="theme-select">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <button type="submit">Save Settings</button>
        </form>
      </section>
    `;
  }
}
