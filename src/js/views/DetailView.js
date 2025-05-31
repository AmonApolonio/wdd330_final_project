import { getAnimeFull } from '../api/jikan.js';
import { getRandomQuoteByAnime } from '../api/animequotes.js';

class DetailView {  /**
   * Render the anime detail view
   * @param {string|number} id - The anime ID
   */
  async render(id) {
    const appElement = document.getElementById("app");
    // First ensure the container exists
    if (appElement) {
      appElement.innerHTML = `
        <section class="detail-view">
          <h1>Anime Details</h1>
          <div class="anime-detail" id="anime-detail-container" data-id="${id || ''}">
            <!-- Anime details will be loaded here -->
            <p>Loading anime details...</p>
          </div>
        </section>
      `;
      
      // Now load the details after ensuring the container exists
      if (id) {
        this.loadAnimeDetails(id);
      } else {
        // If no ID provided, show error
        const detailContainer = document.getElementById('anime-detail-container');
        if (detailContainer) {
          detailContainer.innerHTML = '<p>No anime ID provided. Please go back and select an anime.</p>';
        }
      }
    }
  }
    /**
   * Load and display the anime details
   * @param {string|number} id - The anime ID
   */
  async loadAnimeDetails(id) {
    const detailContainer = document.getElementById('anime-detail-container');
    
    // Check if container exists, if not create it
    if (!detailContainer) {
      console.error('Anime detail container not found. Re-rendering view.');
      this.render(id);
      return;
    }
    
    try {
      // Show loading state
      detailContainer.innerHTML = '<p>Loading anime details...</p>';
      
      // Fetch the anime details
      const response = await getAnimeFull(id);
      
      // Check if we have data
      if (response && response.data) {
        // Try to fetch a quote for this anime
        let quoteHTML = '';
        try {
          const quoteResp = await getRandomQuoteByAnime(response.data.title_english || response.data.title);
          // The API may return an array or object
          let quoteObj = null;
          if (Array.isArray(quoteResp)) {
            quoteObj = quoteResp[0];
          } else if (quoteResp && quoteResp.quote) {
            quoteObj = quoteResp;
          } else if (quoteResp && quoteResp.data && Array.isArray(quoteResp.data) && quoteResp.data.length > 0) {
            quoteObj = quoteResp.data[0];
          }
          if (quoteObj && quoteObj.quote) {
            quoteHTML = `
              <section class="anime-quote anime-card">
                <div class="anime-card-content">
                  <div class="quote-text">
                    <span class="quote-mark">“</span>${quoteObj.quote}<span class="quote-mark">”</span>
                  </div>
                  <div class="quote-meta">
                    <p class="quote-character">— ${quoteObj.character}</p>
                    <p class="quote-anime">${quoteObj.show}</p>
                  </div>
                  <button id="new-quote-btn" class="primary-btn" type="button">New Quote</button>
                </div>
              </section>
            `;
          }
        } catch (e) {
          // Ignore quote errors, just don't show quote
        }
        // Render the anime details, injecting the quote if found
        detailContainer.innerHTML = this.createAnimeDetailHTML(response.data, quoteHTML);
        
        // Set up event listeners for interactive elements
        this.setupEventListeners(response.data);
        // Set up event listener for new quote button if present
        const newQuoteBtn = document.getElementById('new-quote-btn');
        if (newQuoteBtn) {
          // Define a named handler function so we can re-attach it
          const handleNewQuote = async () => {
            newQuoteBtn.disabled = true;
            newQuoteBtn.textContent = 'Loading...';
            try {
              const quoteResp = await getRandomQuoteByAnime(response.data.title_english || response.data.title);
              let quoteObj = null;
              if (Array.isArray(quoteResp)) {
                quoteObj = quoteResp[0];
              } else if (quoteResp && quoteResp.quote) {
                quoteObj = quoteResp;
              } else if (quoteResp && quoteResp.data && Array.isArray(quoteResp.data) && quoteResp.data.length > 0) {
                quoteObj = quoteResp.data[0];
              }
              if (quoteObj && quoteObj.quote) {
                const quoteSection = document.querySelector('.anime-quote .anime-card-content');
                if (quoteSection) {
                  quoteSection.innerHTML = `
                    <div class=\"quote-text\">
                      <span class=\"quote-mark\">“</span>${quoteObj.quote}<span class=\"quote-mark\">”</span>
                    </div>
                    <div class=\"quote-meta\">
                      <p class=\"quote-character\">— ${quoteObj.character}</p>
                      <p class=\"quote-anime\">${quoteObj.show}</p>
                    </div>
                    <button id=\"new-quote-btn\" class=\"primary-btn cooldown\" type=\"button\" disabled>New Quote (10s)</button>
                  `;
                  // Re-attach event listener to the new button after the cooldown
                  const newBtn = document.getElementById('new-quote-btn');
                  if (newBtn) {
                    // Start the cooldown timer
                    let secondsLeft = 10;
                    const countdownInterval = setInterval(() => {
                      secondsLeft--;
                      if (newBtn) {
                        newBtn.textContent = `New Quote (${secondsLeft}s)`;
                      }
                      
                      if (secondsLeft <= 0) {
                        clearInterval(countdownInterval);
                        if (newBtn) {
                          newBtn.disabled = false;
                          newBtn.textContent = 'New Quote';
                          newBtn.classList.remove('cooldown');
                          newBtn.addEventListener('click', handleNewQuote);
                        }
                      }
                    }, 1000);
                  }
                }
              }
            } catch (e) {
              alert('Failed to fetch a new quote.');
              // Only re-enable if the button still exists, but with cooldown
              const btn = document.getElementById('new-quote-btn');
              if (btn) {
                btn.classList.add('cooldown');
                // Start the cooldown timer even on error
                let secondsLeft = 10;
                const countdownInterval = setInterval(() => {
                  secondsLeft--;
                  if (btn) {
                    btn.textContent = `New Quote (${secondsLeft}s)`;
                  }
                  
                  if (secondsLeft <= 0) {
                    clearInterval(countdownInterval);
                    if (btn) {
                      btn.disabled = false;
                      btn.textContent = 'New Quote';
                      btn.classList.remove('cooldown');
                      btn.addEventListener('click', handleNewQuote);
                    }
                  }
                }, 1000);
              }
            }
          };
          newQuoteBtn.addEventListener('click', handleNewQuote);
        }
      } else {
        detailContainer.innerHTML = '<p>Anime not found. It may have been removed or the ID is incorrect.</p>';
      }
    } catch (error) {
      console.error('Error loading anime details:', error);
      detailContainer.innerHTML = `
        <div class="error-message">
          <p>Failed to load anime details.</p>
          <button id="retry-detail">Retry</button>
        </div>
      `;
      
      // Add retry functionality
      document.getElementById('retry-detail').addEventListener('click', () => {
        this.loadAnimeDetails(id);
      });
    }
  }
  
  /**
   * Create the HTML for the anime detail page
   * @param {Object} anime - Anime data from API
   * @param {string} [quoteHTML] - Optional HTML for the quote section
   * @returns {string} - HTML for the detail page
   */
  createAnimeDetailHTML(anime, quoteHTML = '') {
    // Default image if none provided
    const imageUrl = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || 'https://via.placeholder.com/225x318?text=No+Image';
    
    // Use a sensible title (English or default)
    const title = anime.title_english || anime.title;
    
    // Format airing status
    const status = anime.status || 'Unknown status';
    
    // Format the genres
    const genres = anime.genres?.map(genre => genre.name).join(', ') || 'Not categorized';
    
    // Create HTML
    return `
      <div class="anime-detail-content">
        <div class="anime-detail-header">
          <div class="anime-detail-image">
            <img src="${imageUrl}" alt="${title}">
          </div>
          <div class="anime-detail-info">
            <h2>${title}</h2>
            <p><strong>Original Title:</strong> ${anime.title}</p>
            <p><strong>Score:</strong> ${anime.score ? `${anime.score}/10` : 'Not rated'}</p>
            <p><strong>Status:</strong> ${status}</p>
            <p><strong>Episodes:</strong> ${anime.episodes || 'Unknown'}</p>
            <p><strong>Aired:</strong> ${anime.aired?.string || 'Unknown'}</p>
            <p><strong>Genres:</strong> ${genres}</p>
            ${anime.rating ? `<p><strong>Rating:</strong> ${anime.rating}</p>` : ''}
            <button id="save-anime-btn" data-id="${anime.mal_id}">Add to My List</button>
          </div>
        </div>
        ${quoteHTML}
        <div class="anime-synopsis">
          <h3>Synopsis</h3>
          <p>${anime.synopsis || 'No synopsis available.'}</p>
        </div>
        
        ${anime.trailer?.embed_url ? `
          <div class="anime-trailer">
            <h3>Trailer</h3>
            <div class="responsive-iframe-container">
              <iframe src="${anime.trailer.embed_url}" 
                      frameborder="0" 
                      allowfullscreen>
              </iframe>
            </div>
          </div>
        ` : ''}
        
        ${anime.relations && anime.relations.length > 0 ? `
          <div class="anime-relations">
            <h3>Related Anime</h3>
            <ul>
              ${anime.relations.map(relation => `
                <li>
                  <strong>${relation.relation}:</strong> 
                  ${relation.entry.map(entry => 
                    entry.type === 'anime' ? 
                    `<a href="#/detail/${entry.mal_id}">${entry.name}</a>` : 
                    entry.name
                  ).join(', ')}
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
        
        ${anime.streaming && anime.streaming.length > 0 ? `
          <div class="anime-streaming">
            <h3>Where to Watch</h3>
            <ul>
              ${anime.streaming.map(stream => `
                <li>
                  <a href="${stream.url}" target="_blank" rel="noopener noreferrer">
                    ${stream.name}
                  </a>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  }
  
  /**
   * Set up event listeners for interactive elements
   * @param {Object} anime - Anime data from API
   */
  setupEventListeners(anime) {
    // Add to My List button
    const saveButton = document.getElementById('save-anime-btn');
    if (saveButton) {
      saveButton.addEventListener('click', () => {
        this.saveAnimeToList(anime);
      });
    }
  }
  
  /**
   * Save anime to user's list in local storage
   * @param {Object} anime - Anime data to save
   */
  saveAnimeToList(anime) {
    try {
      // Get current list from localStorage or initialize empty array
      const myList = JSON.parse(localStorage.getItem('myAnimeList') || '[]');
      
      // Check if anime is already in the list
      const exists = myList.some(item => item.mal_id === anime.mal_id);
      
      if (!exists) {
        // Create a simplified version to avoid storing too much data
        const animeToSave = {
          mal_id: anime.mal_id,
          title: anime.title_english || anime.title,
          image_url: anime.images?.jpg?.image_url || '',
          score: anime.score,
          type: anime.type,
          episodes: anime.episodes,
          saved_at: new Date().toISOString()
        };
        
        // Add to list
        myList.push(animeToSave);
        
        // Save back to localStorage
        localStorage.setItem('myAnimeList', JSON.stringify(myList));
        
        // Update the button to indicate it's saved
        const saveButton = document.getElementById('save-anime-btn');
        saveButton.textContent = 'Added to My List';
        saveButton.disabled = true;
        
        // Show a success message
        alert('Anime added to your list!');
      } else {
        // Already in list
        alert('This anime is already in your list!');
        
        // Update the button to indicate it's already saved
        const saveButton = document.getElementById('save-anime-btn');
        saveButton.textContent = 'Already in My List';
        saveButton.disabled = true;
      }
    } catch (error) {
      console.error('Error saving anime to list:', error);
      alert('Failed to save anime to your list. Please try again.');
    }
  }
}

// Make it available globally
window.DetailView = new DetailView();
