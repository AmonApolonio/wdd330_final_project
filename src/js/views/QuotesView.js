import { 
  getRandomQuote, 
  getAllQuotes, 
  searchQuotesByCharacter,
  searchQuotesByAnime,
  getRandomQuoteByAnime,
  getRandomQuoteByCharacter
} from '../api/animequotes.js';

class QuotesView {
  constructor() {
    this.currentPage = 1;
    this.filters = {
      character: '',
      show: '',
      random: false
    };
  }

  /**
   * Render the quotes view
   */
  async render() {
    // Get app container
    const appElement = document.getElementById("app");
    
    if (appElement) {
      // Render the quotes page HTML structure
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

      // Set up event listeners
      this.setupEventListeners();
      
      // Load initial quotes
      this.loadQuotes();
    }
  }

  /**
   * Set up event listeners for the quotes view
   */
  setupEventListeners() {
    // Apply filter button
    const applyFilterBtn = document.getElementById('apply-filters');
    if (applyFilterBtn) {
      applyFilterBtn.addEventListener('click', () => {
        this.currentPage = 1;
        this.filters.character = document.getElementById('character-filter').value.trim();
        this.filters.show = document.getElementById('show-filter').value.trim();
        this.filters.random = document.getElementById('random-filter').checked;
        this.loadQuotes();
      });
    }
    
    // Random quote button
    const randomQuoteBtn = document.getElementById('random-quote-btn');
    if (randomQuoteBtn) {
      randomQuoteBtn.addEventListener('click', () => {
        this.loadRandomQuote();
      });
    }
    
    // Character filter enter key
    const characterFilter = document.getElementById('character-filter');
    if (characterFilter) {
      characterFilter.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          applyFilterBtn.click();
        }
      });
    }
    
    // Show filter enter key
    const showFilter = document.getElementById('show-filter');
    if (showFilter) {
      showFilter.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          applyFilterBtn.click();
        }
      });
    }
  }
  /**
   * Load quotes based on current filters
   */
  async loadQuotes() {
    const quotesContainer = document.getElementById('quotes-container');
    const paginationContainer = document.getElementById('quotes-pagination');
    
    try {
      // Show loading state with spinner
      quotesContainer.innerHTML = `
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading quotes...</p>
        </div>
      `;
      
      // Extract filters
      const { character, show, random } = this.filters;
      
      let quotes;
      let startTime = Date.now(); // Track API call time
      
      // Logic for determining which API call to make
      if (random) {
        if (character && show) {
          // Random quote for a character from a specific anime
          // Note: API might not support this combination directly, but we'll try character first
          try {
            quotes = await getRandomQuoteByCharacter(character);
            // Convert to array format for consistent processing
            quotes = [quotes];
          } catch (err) {
            // Fallback to searching by anime if character fails
            quotes = await getRandomQuoteByAnime(show);
            quotes = [quotes];
          }
        } else if (character) {
          // Random quote for a character
          quotes = await getRandomQuoteByCharacter(character);
          // Convert to array
          quotes = [quotes];
        } else if (show) {
          // Random quote from an anime
          quotes = await getRandomQuoteByAnime(show);
          // Convert to array
          quotes = [quotes];
        } else {
          // Just a random quote
          quotes = await getRandomQuote();
          // Convert to array
          quotes = [quotes];
        }
        
        // Hide pagination for random quotes
        if (paginationContainer) {
          paginationContainer.innerHTML = '';
        }
      } else {
        // Non-random quotes with pagination
        if (character && show) {
          // This might not be directly supported by the API, choose one filter
          // For now, prioritize character filter
          try {
            quotes = await searchQuotesByCharacter(character, this.currentPage);
            
            // If no results, try searching by anime instead
            if (Array.isArray(quotes) && quotes.length === 0) {
              quotes = await searchQuotesByAnime(show, this.currentPage);
            }
          } catch (err) {
            // Fallback to searching by anime if character fails
            quotes = await searchQuotesByAnime(show, this.currentPage);
          }
        } else if (character) {
          quotes = await searchQuotesByCharacter(character, this.currentPage);
        } else if (show) {
          quotes = await searchQuotesByAnime(show, this.currentPage);
        } else {
          quotes = await getAllQuotes(this.currentPage);
        }
        
        // Show pagination if we have quotes
        this.renderPagination(paginationContainer, quotes);
      }
      
      // Calculate API response time
      const responseTime = Date.now() - startTime;
      
      // Add slight delay if the response was too fast to avoid UI flickering
      if (responseTime < 300) {
        await new Promise(resolve => setTimeout(resolve, 300 - responseTime));
      }
      
      // Render the quotes
      this.renderQuotes(quotes, quotesContainer);
      
      // Display search summary if filters are applied
      if (character || show) {
        const filterSummary = document.createElement('div');
        filterSummary.className = 'filter-summary';
        
        let summaryText = 'Showing quotes';
        if (character) summaryText += ` for character "${character}"`;
        if (show) {
          summaryText += character ? ` from "${show}"` : ` from "${show}"`;
        }
        
        filterSummary.textContent = summaryText;
        
        // Insert before the quotes
        if (quotesContainer.firstChild) {
          quotesContainer.insertBefore(filterSummary, quotesContainer.firstChild);
        } else {
          quotesContainer.appendChild(filterSummary);
        }
      }
    } catch (error) {
      console.error('Error loading quotes:', error);
      
      // Determine appropriate error message
      let errorMessage = 'Failed to load quotes.';
      
      if (error.message?.includes('Rate limit')) {
        errorMessage = 'API rate limit exceeded. Please try again in a minute.';
      } else if (error.status === 404 || (error.message?.includes('404'))) {
        errorMessage = 'No quotes found. Please check your search terms and try again.';
      } else if (error.message?.includes('Network') || error.status === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        errorMessage = `Error: ${error.message || 'Unknown error occurred'}`;
      }
      
      quotesContainer.innerHTML = `
        <div class="error-message">
          <p>${errorMessage}</p>
          <button id="retry-quotes" class="retry-btn">Retry</button>
        </div>
      `;
      
      // Clear pagination on error
      if (paginationContainer) {
        paginationContainer.innerHTML = '';
      }
      
      // Add retry button functionality
      const retryButton = document.getElementById('retry-quotes');
      if (retryButton) {
        retryButton.addEventListener('click', () => {
          this.loadQuotes();
        });
      }
    }
  }

  /**
   * Load a completely random quote
   */
  async loadRandomQuote() {
    const quotesContainer = document.getElementById('quotes-container');
    const paginationContainer = document.getElementById('quotes-pagination');
    
    try {
      // Show loading state
      quotesContainer.innerHTML = '<p>Loading random quote...</p>';
      
      // Hide pagination
      if (paginationContainer) {
        paginationContainer.innerHTML = '';
      }
      
      // Get a random quote
      const quote = await getRandomQuote();
      
      // Render the quote
      this.renderQuotes([quote], quotesContainer);
    } catch (error) {
      console.error('Error loading random quote:', error);
      quotesContainer.innerHTML = `
        <div class="error-message">
          <p>Failed to load random quote. ${error.message}</p>
          <button id="retry-random" class="retry-btn">Retry</button>
        </div>
      `;
      
      // Add retry button functionality
      const retryButton = document.getElementById('retry-random');
      if (retryButton) {
        retryButton.addEventListener('click', () => {
          this.loadRandomQuote();
        });
      }
    }
  }

  /**
   * Render quotes to the container
   * @param {Array|Object} quotes - The quotes to render
   * @param {HTMLElement} container - The container element
   */
  renderQuotes(quotes, container) {
    // If we have no quotes to display
    if (!quotes || (Array.isArray(quotes) && quotes.length === 0)) {
      container.innerHTML = '<p>No quotes found matching your criteria.</p>';
      return;
    }
    
    // Ensure quotes is an array
    const quotesArray = Array.isArray(quotes) ? quotes : [quotes];
    
    // Create HTML for all quotes
    const quotesHTML = quotesArray.map(quote => this.createQuoteCard(quote)).join('');
    
    // Update the container
    container.innerHTML = quotesHTML;
  }

  /**
   * Create HTML for a quote card
   * @param {Object} quote - The quote data
   * @returns {string} - HTML string
   */
  createQuoteCard(quote) {
    return `
      <div class="quote-card">
        <div class="quote-text">
          <span class="quote-mark">"</span>
          ${quote.quote}
          <span class="quote-mark">"</span>
        </div>
        <div class="quote-meta">
          <p class="quote-character">— ${quote.character}</p>
          <p class="quote-anime">${quote.anime}</p>
        </div>
      </div>
    `;
  }
  /**
   * Render pagination controls
   * @param {HTMLElement} container - The pagination container
   * @param {Array} quotes - The current quotes
   */  renderPagination(container, quotes) {
    if (!container) return;
    
    // Assume API provides 10 quotes per page
    const quotesPerPage = 10;
    const maxPagesToShow = 5; // Show up to 5 page numbers
    
    // Check if we have a full page of quotes, indicating there may be more
    const hasMore = Array.isArray(quotes) && quotes.length >= quotesPerPage;
    
    // Generate page numbers to display
    let pageNumbers = [];
    if (this.currentPage > 1) {
      // Always include at least first page, current page, and potentially next page
      pageNumbers.push(1);
      
      // Add ellipsis if needed
      if (this.currentPage > 3) {
        pageNumbers.push('...');
      }
      
      // Add previous page if we're beyond page 2
      if (this.currentPage > 2) {
        pageNumbers.push(this.currentPage - 1);
      }
    }
    
    // Add current page
    pageNumbers.push(this.currentPage);
    
    // Add next page if we have more results
    if (hasMore) {
      pageNumbers.push(this.currentPage + 1);
      
      // Indicate there might be more pages with ellipsis
      pageNumbers.push('...');
    }
    
    // Remove duplicates and ensure we don't exceed maxPagesToShow
    pageNumbers = [...new Set(pageNumbers)];
    if (pageNumbers.length > maxPagesToShow) {
      // Keep first, last, and current pages, plus one on each side of current
      const currentIndex = pageNumbers.indexOf(this.currentPage);
      const newPageNumbers = [
        pageNumbers[0],
        '...',
        this.currentPage - 1,
        this.currentPage,
        this.currentPage + 1,
        '...'
      ];
      pageNumbers = newPageNumbers.filter(p => p > 0); // Remove negative pages
    }
    
    // Generate pagination HTML
    let paginationHTML = `<div class="pagination">`;
    
    // Previous button
    if (this.currentPage > 1) {
      paginationHTML += `<button class="pagination-btn prev-page" data-page="${this.currentPage - 1}">Previous</button>`;
    } else {
      paginationHTML += `<button class="pagination-btn prev-page disabled">Previous</button>`;
    }
    
    // Page numbers
    pageNumbers.forEach(page => {
      if (page === '...') {
        paginationHTML += `<span class="pagination-ellipsis">...</span>`;
      } else {
        paginationHTML += `
          <button class="pagination-btn page-number ${page === this.currentPage ? 'current' : ''}" 
            data-page="${page}">${page}</button>
        `;
      }
    });
    
    // Next button
    if (hasMore) {
      paginationHTML += `<button class="pagination-btn next-page" data-page="${this.currentPage + 1}">Next</button>`;
    } else {
      paginationHTML += `<button class="pagination-btn next-page disabled">Next</button>`;
    }
    
    paginationHTML += `</div>`;
    
    container.innerHTML = paginationHTML;
    
    // Add event listeners to pagination buttons
    document.querySelectorAll('.pagination-btn:not(.disabled)').forEach(button => {
      button.addEventListener('click', () => {
        if (button.classList.contains('disabled')) return;
        
        const page = parseInt(button.dataset.page);
        if (page && !isNaN(page)) {
          this.currentPage = page;
          this.loadQuotes();
          // Scroll to top of quotes container
          document.querySelector('.quotes-view').scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }
}

// Make it available globally
window.QuotesView = new QuotesView();
