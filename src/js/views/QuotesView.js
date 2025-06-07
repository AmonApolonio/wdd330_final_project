import { 
  getRandomQuote, 
  getAllQuotes, 
  searchQuotesByCharacter,
  searchQuotesByAnime,
  getRandomQuoteByAnime,
  getRandomQuoteByCharacter
} from '../api/animequotes.js';

class QuotesView {  constructor() {
    this.currentPage = 1;
    this.quotesPerPage = 18; // Display 18 quotes per page
    this.allQuotes = []; // Store all fetched quotes for client-side pagination
    this.filters = {
      character: '',
      show: ''
    };
  }

  /**
   * Render the quotes view
   */
  async render() {
    // Get app container
    const appElement = document.getElementById("app");
    
    if (appElement) {      // Render the quotes page HTML structure
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
   */  setupEventListeners() {
    // Apply filter button
    const applyFilterBtn = document.getElementById('apply-filters');
    if (applyFilterBtn) {
      applyFilterBtn.addEventListener('click', () => {
        this.currentPage = 1;
        this.filters.character = document.getElementById('character-filter').value.trim();
        this.filters.show = document.getElementById('show-filter').value.trim();
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
  }  /**
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
      const { character, show } = this.filters;
      
      let quotes;
      let startTime = Date.now(); // Track API call time
      
      // Logic for determining which API call to make
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
      
      // Calculate API response time
      const responseTime = Date.now() - startTime;
      
      // Add slight delay if the response was too fast to avoid UI flickering
      if (responseTime < 300) {
        await new Promise(resolve => setTimeout(resolve, 300 - responseTime));
      }
      
      // Render the quotes (this will also update this.allQuotes)
      this.renderQuotes(quotes, quotesContainer);
      
      // Now that allQuotes is set, we can show pagination
      if (paginationContainer) {
        this.renderPagination(paginationContainer, quotes);
      }
        // Display search summary if filters are applied
      if (character || show) {
        const filterSummary = document.createElement('div');
        filterSummary.className = 'filter-summary';
          let summaryText = 'Showing quotes';
        if (character) summaryText += ` for character "${character}"`;
        if (show) summaryText += ` from "${show}"`;
        
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
  }  /**
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
      
      // Get a random quote (API wrapper now normalizes the response format)
      const quote = await getRandomQuote();
      
      console.log('Random quote data:', quote);
      
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
  }  /**
   * Render quotes to the container with pagination
   * @param {Array|Object} quotes - The quotes to render
   * @param {HTMLElement} container - The container element
   */
  renderQuotes(quotes, container) {
    // If we have no quotes to display
    if (!quotes || (Array.isArray(quotes) && quotes.length === 0)) {
      container.innerHTML = '<p>No quotes found matching your criteria.</p>';
      return;
    }
    
    // Log what we're trying to render to help debug
    console.log('Rendering quotes:', quotes);
    
    // Ensure quotes is an array of valid quote objects and store all quotes for pagination
    this.allQuotes = Array.isArray(quotes) ? quotes : [quotes];
    
    // Filter out any invalid quotes
    this.allQuotes = this.allQuotes.filter(quote => quote && typeof quote === 'object');
    
    // Sort quotes by length (shortest first, but very short quotes last)
    this.allQuotes.sort((a, b) => {
      const quoteA = a.quote || '';
      const quoteB = b.quote || '';
      
      // Consider quotes with less than 15 characters as "very short"
      // These will be placed at the end
      const isVeryShortA = quoteA.length < 50;
      const isVeryShortB = quoteB.length < 50;
      
      // If one quote is very short and the other isn't
      if (isVeryShortA && !isVeryShortB) return 1; // A is very short, move to end
      if (!isVeryShortA && isVeryShortB) return -1; // B is very short, move to end
      
      // Otherwise sort by length (shortest first)
      return quoteA.length - quoteB.length;
    });
    
    // If after filtering we have no valid quotes
    if (this.allQuotes.length === 0) {
      container.innerHTML = '<p>No valid quotes found.</p>';
      return;
    }
    
    // Check if current page is still valid with the new quote count
    const totalPages = Math.max(1, Math.ceil(this.allQuotes.length / this.quotesPerPage));
    if (this.currentPage > totalPages) {
      // If current page is now beyond total pages, reset to last valid page
      this.currentPage = totalPages;
    }
    
    // Implement client-side pagination
    const startIndex = (this.currentPage - 1) * this.quotesPerPage;
    const endIndex = startIndex + this.quotesPerPage;
    const paginatedQuotes = this.allQuotes.slice(startIndex, endIndex);
    
    // Create HTML for current page quotes
    const quotesHTML = paginatedQuotes.map(quote => this.createQuoteCard(quote)).join('');
    
    // Update the container
    container.innerHTML = quotesHTML;
  }

  /**
   * Create HTML for a quote card
   * @param {Object} quote - The quote data
   * @returns {string} - HTML string
   */  createQuoteCard(quote) {
    // Handle different API response formats (API might return either 'show' or 'anime')
    const animeTitle = quote.show || quote.anime || 'Unknown Anime';
    const characterName = quote.character || 'Unknown Character';
    
    return `
      <div class="quote-card">
        <div class="quote-text">
          <span class="quote-mark">"</span>
          ${quote.quote || ''}
          <span class="quote-mark">"</span>
        </div>        <div class="quote-meta">
          <p class="quote-character">— ${characterName}</p>
          <p class="quote-anime">${animeTitle}</p>
        </div>
      </div>
    `;
  }/**
   * Render pagination controls
   * @param {HTMLElement} container - The pagination container
   * @param {Array} quotes - The current quotes
   */  renderPagination(container, quotes) {
    if (!container) return;
    
    const maxPagesToShow = 5; // Show up to 5 page numbers
    
    // Calculate total pages based on all quotes
    const totalQuotes = this.allQuotes.length;
    const totalPages = Math.max(1, Math.ceil(totalQuotes / this.quotesPerPage));
    
    // If we have only 1 page or fewer items than quotes per page, no pagination needed
    if (totalQuotes <= this.quotesPerPage) {
      container.innerHTML = '';
      return;
    }
    
    // Determine if there are more pages
    const hasMore = this.currentPage < totalPages;
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
      
      // Add last page with ellipsis if far away
      if (this.currentPage < totalPages - 1) {
        if (this.currentPage < totalPages - 2) {
          pageNumbers.push('...');
        }
        pageNumbers.push(totalPages);
      }
    }
      // Remove duplicates and ensure we don't exceed maxPagesToShow
    pageNumbers = [...new Set(pageNumbers)];
    
    // Make sure we don't have invalid page numbers
    pageNumbers = pageNumbers.filter(p => p === '...' || (typeof p === 'number' && p > 0 && p <= totalPages));
    
    if (pageNumbers.length > maxPagesToShow) {
      // For complex pagination, we want to keep:
      // 1. First page
      // 2. Last page
      // 3. Current page and one page on either side
      
      let newPageNumbers = [];
      
      // Always include first page
      newPageNumbers.push(1);
      
      // Add ellipsis if there's a gap between first page and current - 1
      if (this.currentPage > 3) {
        newPageNumbers.push('...');
      }
      
      // Add page before current if it exists
      if (this.currentPage > 1 && this.currentPage - 1 > 1) {
        newPageNumbers.push(this.currentPage - 1);
      }
      
      // Current page
      if (this.currentPage > 1 && this.currentPage < totalPages) {
        newPageNumbers.push(this.currentPage);
      }
      
      // Add page after current if it exists
      if (this.currentPage < totalPages - 1) {
        newPageNumbers.push(this.currentPage + 1);
      }
      
      // Add ellipsis if there's a gap between current + 1 and last page
      if (this.currentPage < totalPages - 2) {
        newPageNumbers.push('...');
      }
      
      // Add last page if it's different from current page
      if (totalPages > 1 && this.currentPage < totalPages) {
        newPageNumbers.push(totalPages);
      }
      
      pageNumbers = newPageNumbers;
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
    if (hasMore && this.currentPage < totalPages) {
      paginationHTML += `<button class="pagination-btn next-page" data-page="${this.currentPage + 1}">Next</button>`;
    } else {
      paginationHTML += `<button class="pagination-btn next-page disabled">Next</button>`;
    }
      // Add quote count information
    paginationHTML += `<span class="pagination-info">${totalQuotes} quotes total (Page ${this.currentPage} of ${totalPages})</span>`;
    
    paginationHTML += `</div>`;
    
    container.innerHTML = paginationHTML;    // Add event listeners to pagination buttons
    document.querySelectorAll('.pagination-btn:not(.disabled)').forEach(button => {
      button.addEventListener('click', () => {
        if (button.classList.contains('disabled')) return;
        
        const page = parseInt(button.dataset.page);
        if (page && !isNaN(page)) {
          this.currentPage = page;
          
          // No need to reload quotes from API, just re-render with the new page
          const quotesContainer = document.getElementById('quotes-container');
          const paginationContainer = document.getElementById('quotes-pagination');
          
          if (quotesContainer) {
            // First update the content
            this.renderQuotes(this.allQuotes, quotesContainer);
            
            // Then update the pagination controls
            if (paginationContainer) {
              this.renderPagination(paginationContainer, this.allQuotes);
            }
            
            // Scroll to top of quotes container
            document.querySelector('.quotes-view').scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }
}

// Make it available globally
window.QuotesView = new QuotesView();
