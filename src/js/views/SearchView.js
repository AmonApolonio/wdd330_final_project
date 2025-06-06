import { searchAnime } from '../api/jikan.js';
import { getSearchQuery, hideSearchLoadingSpinner } from '../search.js';
import AnimeCard, { setupAnimeCardInteractivity } from '../ui/components/AnimeCard.js';

class SearchView {
  constructor() {
    // Cache for search results by query and page
    this.resultsCache = {};
  }

  /**
   * Render the search results view
   */  async render() {
    // Make sure the necessary container structure exists
    const appElement = document.getElementById("app");
    if (appElement) {
      // Ensure the search view structure is in place
      if (!document.getElementById('search-results-container')) {
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

      const query = getSearchQuery();
      
      // If there's a search query, perform the search
      if (query) {
        this.performSearch(query);
      } else {
        // If no query, show a message
        const searchResultsContainer = document.getElementById('search-results-container');
        if (searchResultsContainer) {
          searchResultsContainer.innerHTML = `
            <p>Enter a search term in the search bar above to find anime</p>
          `;
        }
        // Make sure the spinner is hidden when no search is active
        hideSearchLoadingSpinner();
      }
    }
  }
  
  /**
   * Generate a cache key for a search query and page
   * @param {string} query - Search query
   * @param {number} page - Page number
   * @returns {string} - Cache key
   */
  getCacheKey(query, page) {
    return `${query.toLowerCase()}_page${page}`;
  }

  /**
   * Perform an anime search and display results
   * @param {string} query - Search query
   * @param {number} page - Page number (default: 1)
   */  async performSearch(query, page = 1) {
    const searchResultsContainer = document.getElementById('search-results-container');
    
    // Check if container exists, if not render the view again
    if (!searchResultsContainer) {
      console.error('Search results container not found. Re-rendering view.');
      this.render();
      return;
    }
    
    // Create a cache key for this query and page
    const cacheKey = this.getCacheKey(query, page);
    
    try {
      // Show loading state with spinner, but only if not using cached data
      if (!this.resultsCache[cacheKey]) {
        searchResultsContainer.innerHTML = `
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Searching for anime...</p>
          </div>
        `;
      }
      
      // Check if we have cached results for this query and page
      let response;
      if (this.resultsCache[cacheKey]) {
        console.log(`Using cached results for "${query}" page ${page}`);
        response = this.resultsCache[cacheKey];
      } else {
        // Perform search using the API if no cached results
        response = await searchAnime(query, page);
        
        // Cache the results for future use
        this.resultsCache[cacheKey] = response;
        console.log(`Cached search results for "${query}" page ${page}`);
      }
      
      // Hide the loading spinner in the search input when results come back
      hideSearchLoadingSpinner();
      
      // If we have results, display them
      if (response && response.data && response.data.length > 0) {
        // Create HTML for the anime grid
        let resultsHTML = `
          <h2>Search Results for "${query}"</h2>
          <p>Found ${response.pagination.items.total} anime</p>
          <div class="anime-grid">
        `;
        
        // Add each anime as a card
        resultsHTML += response.data
          .map(anime => AnimeCard(anime))
          .join('');
        
        resultsHTML += '</div>';
        
        // Add pagination if there are multiple pages
        if (response.pagination.last_visible_page > 1) {
          resultsHTML += this.createPagination(query, page, response.pagination);
        }
          searchResultsContainer.innerHTML = resultsHTML;
        
        // Add event listeners to pagination buttons
        this.setupPaginationEvents(query);
        
        // Set up interactivity for anime cards
        setupAnimeCardInteractivity();
      } else {
        // If no results, show a message
        searchResultsContainer.innerHTML = `
          <h2>Search Results for "${query}"</h2>
          <p>No anime found for your search. Try a different query.</p>
        `;
      }
    } catch (error) {
      console.error('Error searching anime:', error);
      searchResultsContainer.innerHTML = `
        <h2>Search Results for "${query}"</h2>
        <div class="error-message">
          <p>Failed to load search results.</p>
          <button id="retry-search">Retry</button>
        </div>
      `;
      
      // Hide the loading spinner in the search input on error
      hideSearchLoadingSpinner();
      
      // Add retry functionality
      document.getElementById('retry-search').addEventListener('click', () => {
        // Remove failed query from cache when retrying
        const cacheKey = this.getCacheKey(query, page);
        delete this.resultsCache[cacheKey];
        
        this.performSearch(query, page);
      });
    }
  }
  
  /**
   * Create pagination controls HTML
   * @param {string} query - Current search query
   * @param {number} currentPage - Current page number
   * @param {Object} pagination - Pagination data from API
   * @returns {string} - Pagination HTML
   */
  createPagination(query, currentPage, pagination) {
    const lastPage = pagination.last_visible_page;
    const hasNextPage = currentPage < lastPage;
    const hasPrevPage = currentPage > 1;
    
    return `
      <div class="pagination">
        ${hasPrevPage ? `<button class="pagination-btn prev-page" data-page="${currentPage - 1}">Previous</button>` : ''}
        <span>Page ${currentPage} of ${lastPage}</span>
        ${hasNextPage ? `<button class="pagination-btn next-page" data-page="${currentPage + 1}">Next</button>` : ''}
      </div>
    `;
  }
  
  /**
   * Set up event listeners for pagination buttons
   * @param {string} query - Current search query
   */
  setupPaginationEvents(query) {
    // Add click handlers for pagination buttons
    document.querySelectorAll('.pagination-btn').forEach(button => {
      button.addEventListener('click', () => {
        const page = parseInt(button.dataset.page, 10);
        
        // Show loading spinner when changing pages
        const searchResultsContainer = document.getElementById('search-results-container');
        if (searchResultsContainer) {
          searchResultsContainer.scrollIntoView({ behavior: 'smooth' });
        }
        
        this.performSearch(query, page);
      });
    });
  }
}

// Make it available globally
window.SearchView = new SearchView();
