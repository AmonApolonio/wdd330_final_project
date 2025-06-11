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
    this.quotesPerPage = 18;
    this.allQuotes = [];
    this.filters = {
      character: '',
      show: ''
    };
  }

  async render() {
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

      this.setupEventListeners();

      this.loadQuotes();
    }
  }

  setupEventListeners() {
    const applyFilterBtn = document.getElementById('apply-filters');
    if (applyFilterBtn) {
      applyFilterBtn.addEventListener('click', () => {
        this.currentPage = 1;
        this.filters.character = document.getElementById('character-filter').value.trim();
        this.filters.show = document.getElementById('show-filter').value.trim();
        this.loadQuotes();
      });
    }

    const randomQuoteBtn = document.getElementById('random-quote-btn');
    if (randomQuoteBtn) {
      randomQuoteBtn.addEventListener('click', () => {
        this.loadRandomQuote();
      });
    }

    const characterFilter = document.getElementById('character-filter');
    if (characterFilter) {
      characterFilter.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          applyFilterBtn.click();
        }
      });
    }

    const showFilter = document.getElementById('show-filter');
    if (showFilter) {
      showFilter.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          applyFilterBtn.click();
        }
      });
    }
  }
  async loadQuotes() {
    const quotesContainer = document.getElementById('quotes-container');
    const paginationContainer = document.getElementById('quotes-pagination');

    try {
      quotesContainer.innerHTML = `
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading quotes...</p>
        </div>
      `;

      const { character, show } = this.filters;

      let quotes;
      let startTime = Date.now();

      if (character && show) {
        try {
          quotes = await searchQuotesByCharacter(character, this.currentPage);

          if (Array.isArray(quotes) && quotes.length === 0) {
            quotes = await searchQuotesByAnime(show, this.currentPage);
          }
        } catch (err) {
          quotes = await searchQuotesByAnime(show, this.currentPage);
        }
      } else if (character) {
        quotes = await searchQuotesByCharacter(character, this.currentPage);
      } else if (show) {
        quotes = await searchQuotesByAnime(show, this.currentPage);
      } else {
        quotes = await getAllQuotes(this.currentPage);
      }

      const responseTime = Date.now() - startTime;

      if (responseTime < 300) {
        await new Promise(resolve => setTimeout(resolve, 300 - responseTime));
      }

      this.renderQuotes(quotes, quotesContainer);

      if (paginationContainer) {
        this.renderPagination(paginationContainer, quotes);
      }
      if (character || show) {
        const filterSummary = document.createElement('div');
        filterSummary.className = 'filter-summary';
        let summaryText = 'Showing quotes';
        if (character) summaryText += ` for character "${character}"`;
        if (show) summaryText += ` from "${show}"`;

        filterSummary.textContent = summaryText;

        if (quotesContainer.firstChild) {
          quotesContainer.insertBefore(filterSummary, quotesContainer.firstChild);
        } else {
          quotesContainer.appendChild(filterSummary);
        }
      }
    } catch (error) {
      console.error('Error loading quotes:', error);

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

      if (paginationContainer) {
        paginationContainer.innerHTML = '';
      }

      const retryButton = document.getElementById('retry-quotes');
      if (retryButton) {
        retryButton.addEventListener('click', () => {
          this.loadQuotes();
        });
      }
    }
  }

  async loadRandomQuote() {
    const quotesContainer = document.getElementById('quotes-container');
    const paginationContainer = document.getElementById('quotes-pagination');

    try {
      quotesContainer.innerHTML = '<p>Loading random quote...</p>';

      if (paginationContainer) {
        paginationContainer.innerHTML = '';
      }

      const quote = await getRandomQuote();

      console.log('Random quote data:', quote);

      this.renderQuotes([quote], quotesContainer);
    } catch (error) {
      console.error('Error loading random quote:', error);
      quotesContainer.innerHTML = `
        <div class="error-message">
          <p>Failed to load random quote. ${error.message}</p>
          <button id="retry-random" class="retry-btn">Retry</button>
        </div>
      `;

      const retryButton = document.getElementById('retry-random');
      if (retryButton) {
        retryButton.addEventListener('click', () => {
          this.loadRandomQuote();
        });
      }
    }
  }

  renderQuotes(quotes, container) {
    if (!quotes || (Array.isArray(quotes) && quotes.length === 0)) {
      container.innerHTML = '<p>No quotes found matching your criteria.</p>';
      return;
    }

    console.log('Rendering quotes:', quotes);

    this.allQuotes = Array.isArray(quotes) ? quotes : [quotes];

    this.allQuotes = this.allQuotes.filter(quote => quote && typeof quote === 'object');

    this.allQuotes.sort((a, b) => {
      const quoteA = a.quote || '';
      const quoteB = b.quote || '';

      const isVeryShortA = quoteA.length < 50;
      const isVeryShortB = quoteB.length < 50;

      if (isVeryShortA && !isVeryShortB) return 1;
      if (!isVeryShortA && isVeryShortB) return -1;

      return quoteA.length - quoteB.length;
    });

    if (this.allQuotes.length === 0) {
      container.innerHTML = '<p>No valid quotes found.</p>';
      return;
    }

    const totalPages = Math.max(1, Math.ceil(this.allQuotes.length / this.quotesPerPage));
    if (this.currentPage > totalPages) {
      this.currentPage = totalPages;
    }

    const startIndex = (this.currentPage - 1) * this.quotesPerPage;
    const endIndex = startIndex + this.quotesPerPage;
    const paginatedQuotes = this.allQuotes.slice(startIndex, endIndex);

    const quotesHTML = paginatedQuotes.map(quote => this.createQuoteCard(quote)).join('');

    container.innerHTML = quotesHTML;
  }

  createQuoteCard(quote) {
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
  }
  
  renderPagination(container, quotes) {
    if (!container) return;

    const maxPagesToShow = 5;

    const totalQuotes = this.allQuotes.length;
    const totalPages = Math.max(1, Math.ceil(totalQuotes / this.quotesPerPage));

    if (totalQuotes <= this.quotesPerPage) {
      container.innerHTML = '';
      return;
    }

    const hasMore = this.currentPage < totalPages;
    let pageNumbers = [];
    if (this.currentPage > 1) {
      pageNumbers.push(1);

      if (this.currentPage > 3) {
        pageNumbers.push('...');
      }

      if (this.currentPage > 2) {
        pageNumbers.push(this.currentPage - 1);
      }
    }

    pageNumbers.push(this.currentPage);

    if (hasMore) {
      pageNumbers.push(this.currentPage + 1);

      if (this.currentPage < totalPages - 1) {
        if (this.currentPage < totalPages - 2) {
          pageNumbers.push('...');
        }
        pageNumbers.push(totalPages);
      }
    }
    pageNumbers = [...new Set(pageNumbers)];

    pageNumbers = pageNumbers.filter(p => p === '...' || (typeof p === 'number' && p > 0 && p <= totalPages));

    if (pageNumbers.length > maxPagesToShow) {
      let newPageNumbers = [];

      newPageNumbers.push(1);

      if (this.currentPage > 3) {
        newPageNumbers.push('...');
      }

      if (this.currentPage > 1 && this.currentPage - 1 > 1) {
        newPageNumbers.push(this.currentPage - 1);
      }

      if (this.currentPage > 1 && this.currentPage < totalPages) {
        newPageNumbers.push(this.currentPage);
      }

      if (this.currentPage < totalPages - 1) {
        newPageNumbers.push(this.currentPage + 1);
      }

      if (this.currentPage < totalPages - 2) {
        newPageNumbers.push('...');
      }

      if (totalPages > 1 && this.currentPage < totalPages) {
        newPageNumbers.push(totalPages);
      }

      pageNumbers = newPageNumbers;
    }

    let paginationHTML = `<div class="pagination">`;

    if (this.currentPage > 1) {
      paginationHTML += `<button class="pagination-btn prev-page" data-page="${this.currentPage - 1}">Previous</button>`;
    } else {
      paginationHTML += `<button class="pagination-btn prev-page disabled">Previous</button>`;
    }

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
    if (hasMore && this.currentPage < totalPages) {
      paginationHTML += `<button class="pagination-btn next-page" data-page="${this.currentPage + 1}">Next</button>`;
    } else {
      paginationHTML += `<button class="pagination-btn next-page disabled">Next</button>`;
    }
    paginationHTML += `<span class="pagination-info">${totalQuotes} quotes total (Page ${this.currentPage} of ${totalPages})</span>`;

    paginationHTML += `</div>`;

    container.innerHTML = paginationHTML;
    document.querySelectorAll('.pagination-btn:not(.disabled)').forEach(button => {
      button.addEventListener('click', () => {
        if (button.classList.contains('disabled')) return;

        const page = parseInt(button.dataset.page);
        if (page && !isNaN(page)) {
          this.currentPage = page;

          const quotesContainer = document.getElementById('quotes-container');
          const paginationContainer = document.getElementById('quotes-pagination');

          if (quotesContainer) {
            this.renderQuotes(this.allQuotes, quotesContainer);

            if (paginationContainer) {
              this.renderPagination(paginationContainer, this.allQuotes);
            }

            document.querySelector('.quotes-view').scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }
}

window.QuotesView = new QuotesView();
