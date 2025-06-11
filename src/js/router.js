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
  '#/quotes': {
    viewModule: 'QuotesView',
    fallback: renderQuotes
  }
};

/**
 * Parse the current hash and extract any parameters
 * @param {string} hash - The current URL hash
 * @returns {Object} - The parsed route and parameters
 */
function parseRoute(hash) {
  if (!hash || hash === '#') {
    return { route: '#/home', param: null };
  }

  if (hash.startsWith('#/detail/')) {
    const id = hash.split('/')[2];
    return { route: '#/detail/:id', param: id };
  }

  return { route: hash, param: null };
}

/**
 * Main router function that determines which view to render
 */
function router() {
  const { route, param } = parseRoute(window.location.hash);
  const routeHandler = routes[route];

  if (routeHandler) {
    const { viewModule, fallback } = routeHandler;

    if (window[viewModule] && typeof window[viewModule].render === 'function') {
      window[viewModule].render(param);
    } else {
      fallback(param);
    }
  } else {
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
    window.location.hash = hash;
  } else {
    router();
  }
}

window.navigate = navigate;
window.addEventListener('hashchange', router);

function renderHome() {
  const appElement = document.getElementById("app");
  if (appElement) {
    console.log("Fallback renderHome function called");
    appElement.innerHTML = `
      <section class="home-view">
        <h1>Welcome to AniChan</h1>
        <p>Loading home view content...</p>
      </section>
    `;

    setTimeout(() => {
      if (window.HomeView && typeof window.HomeView.render === 'function') {
        console.log("Retrying with HomeView after delay");
        window.HomeView.render();
      }
    }, 100);
  }
}

function renderSearch() {
  const appElement = document.getElementById("app");
  if (appElement) {
    appElement.innerHTML = `
      <section class="search-view">
        <h1>Search Anime</h1>        
        <div class="search-results" id="search-results-container">
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
          <p>Your saved anime will appear here</p>
        </div>
      </section>
    `;
  }
}

function renderQuotes() {
  const appElement = document.getElementById("app");
  if (appElement) {
    appElement.innerHTML = `
      <section class="quotes-view">
        <h1>Anime Quotes</h1>
        <div class="quotes-filters">
          <div class="filter-inputs">
            <div class="filter-group">
              <label for="character-filter">Character:</label>
              <input type="text" id="character-filter" placeholder="Filter by character">
            </div>
            
            <div class="filter-group">
              <label for="show-filter">Anime:</label>
              <input type="text" id="show-filter" placeholder="Filter by anime">
            </div>
            
            <div class="filter-group checkbox">
              <input type="checkbox" id="random-filter">
              <label for="random-filter">Random Quote</label>
            </div>
          </div>
          
          <button id="apply-filters" class="primary-btn">Apply Filters</button>
          <button id="random-quote-btn" class="secondary-btn">Get Random Quote</button>
        </div>
        
        <div class="quotes-container" id="quotes-container">
          <p>Loading quotes...</p>
        </div>
        
        <div class="quotes-pagination" id="quotes-pagination"></div>
      </section>
    `;
  }
}
