import { searchAnime } from '../api/jikan.js';
import { getSearchQuery } from '../search.js';

class SearchView {
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
      }
    }
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
    
    try {
      // Show loading state
      searchResultsContainer.innerHTML = '<p>Searching for anime...</p>';
      
      // Perform search using the API
      const response = await searchAnime(query, page);
      
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
          .map(anime => this.createAnimeCard(anime))
          .join('');
        
        resultsHTML += '</div>';
        
        // Add pagination if there are multiple pages
        if (response.pagination.last_visible_page > 1) {
          resultsHTML += this.createPagination(query, page, response.pagination);
        }
        
        searchResultsContainer.innerHTML = resultsHTML;
        
        // Add event listeners to pagination buttons
        this.setupPaginationEvents(query);
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
      
      // Add retry functionality
      document.getElementById('retry-search').addEventListener('click', () => {
        this.performSearch(query, page);
      });
    }
  }
  
  /**
   * Create HTML for an anime card
   * @param {Object} anime - Anime data from API
   * @returns {string} - HTML string
   */
  createAnimeCard(anime) {
    // Default image if none provided
    const imageUrl = anime.images?.jpg?.image_url || 'https://via.placeholder.com/225x318?text=No+Image';
    
    // Use a sensible title (English or default)
    const title = anime.title_english || anime.title;
    
    return `
      <div class="anime-card" data-id="${anime.mal_id}">
        <div class="anime-card-image">
          <img src="${imageUrl}" alt="${title}" loading="lazy">
        </div>
        <div class="anime-card-content">
          <h3>${title}</h3>
          <p>${anime.score ? `Rating: ${anime.score}/10` : 'Not rated'}</p>
          <a href="#/detail/${anime.mal_id}" class="view-details-btn">View Details</a>
        </div>
      </div>
    `;
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
        this.performSearch(query, page);
        // Scroll back to top of results
        document.getElementById('search-results-container').scrollIntoView();
      });
    });
  }
}

// Make it available globally
window.SearchView = new SearchView();
