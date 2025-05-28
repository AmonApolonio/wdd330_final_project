import { getAnimeFull } from '../api/jikan.js';

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
        // Render the anime details
        detailContainer.innerHTML = this.createAnimeDetailHTML(response.data);
        
        // Set up event listeners for interactive elements
        this.setupEventListeners(response.data);
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
   * @returns {string} - HTML for the detail page
   */
  createAnimeDetailHTML(anime) {
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
