import { searchAnime } from '../api/jikan.js';
import { getSearchQuery, hideSearchLoadingSpinner } from '../search.js';
import AnimeCard, { setupAnimeCardInteractivity } from '../ui/components/AnimeCard.js';

class SearchView {
  constructor() {
    this.resultsCache = {};
  }

  async render() {
    const appElement = document.getElementById("app");
    if (appElement) {
      if (!document.getElementById('search-results-container')) {
        appElement.innerHTML = `
          <section class="search-view">
            <h1>Search Anime</h1>
            <div class="search-results" id="search-results-container">
              <p>Use the search bar above to find anime</p>
            </div>
          </section>
        `;
      } 
      const query = getSearchQuery();

      if (query) {
        this.performSearch(query);
      } else {
        const searchResultsContainer = document.getElementById('search-results-container');
        if (searchResultsContainer) {
          searchResultsContainer.innerHTML = `
            <p>Enter a search term in the search bar above to find anime</p>
          `;
        }
        hideSearchLoadingSpinner();
      }
    }
  }

  getCacheKey(query, page) {
    return `${query.toLowerCase()}_page${page}`;
  }

  async performSearch(query, page = 1) {
    const searchResultsContainer = document.getElementById('search-results-container');

    if (!searchResultsContainer) {
      console.error('Search results container not found. Re-rendering view.');
      this.render();
      return;
    }

    const cacheKey = this.getCacheKey(query, page);

    try {
      if (!this.resultsCache[cacheKey]) {
        searchResultsContainer.innerHTML = `
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Searching for anime...</p>
          </div>
        `;
      }

      let response;
      if (this.resultsCache[cacheKey]) {
        console.log(`Using cached results for "${query}" page ${page}`);
        response = this.resultsCache[cacheKey];
      } else {
        response = await searchAnime(query, page);

        this.resultsCache[cacheKey] = response;
        console.log(`Cached search results for "${query}" page ${page}`);
      }

      hideSearchLoadingSpinner();

      if (response && response.data && response.data.length > 0) {
        let resultsHTML = `
          <h2>Search Results for "${query}"</h2>
          <p>Found ${response.pagination.items.total} anime</p>
          <div class="anime-grid">
        `;

        resultsHTML += response.data
          .map(anime => AnimeCard(anime))
          .join('');

        resultsHTML += '</div>';

        if (response.pagination.last_visible_page > 1) {
          resultsHTML += this.createPagination(query, page, response.pagination);
        }
        searchResultsContainer.innerHTML = resultsHTML;

        this.setupPaginationEvents(query);

        setupAnimeCardInteractivity();
      } else {
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

      hideSearchLoadingSpinner();

      document.getElementById('retry-search').addEventListener('click', () => {
        const cacheKey = this.getCacheKey(query, page);
        delete this.resultsCache[cacheKey];

        this.performSearch(query, page);
      });
    }
  }

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

  setupPaginationEvents(query) {
    document.querySelectorAll('.pagination-btn').forEach(button => {
      button.addEventListener('click', () => {
        const page = parseInt(button.dataset.page, 10);

        const searchResultsContainer = document.getElementById('search-results-container');
        if (searchResultsContainer) {
          searchResultsContainer.scrollIntoView({ behavior: 'smooth' });
        }

        this.performSearch(query, page);
      });
    });
  }
}

window.SearchView = new SearchView();
