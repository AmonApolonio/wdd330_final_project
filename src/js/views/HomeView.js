import { getSeasonsNow, getRandomAnime } from '../api/jikan.js';

class HomeView {
  /**
   * Render the home view with currently airing anime
   */
  async render() {
    // Container is already rendered by router.js
    this.loadFeaturedAnime();
  }

  /**
   * Load featured anime (currently airing)
   */
  async loadFeaturedAnime() {
    const featuredContainer = document.getElementById('featured-container');
    
    try {
      // Display loading state
      featuredContainer.innerHTML = '<p>Loading featured anime...</p>';
      
      // Fetch currently airing anime
      const response = await getSeasonsNow();
      
      // Check if we have data
      if (response && response.data && response.data.length > 0) {
        // Create HTML for the anime grid
        const animeHTML = response.data
          .slice(0, 12) // Limit to 12 items
          .map(anime => this.createAnimeCard(anime))
          .join('');
        
        featuredContainer.innerHTML = animeHTML;
      } else {
        // If no results, try to get a random anime
        this.loadRandomAnime(featuredContainer);
      }
    } catch (error) {
      console.error('Error loading featured anime:', error);
      featuredContainer.innerHTML = `
        <div class="error-message">
          <p>Failed to load anime data.</p>
          <button id="retry-featured">Retry</button>
        </div>
      `;
      
      // Add retry functionality
      document.getElementById('retry-featured').addEventListener('click', () => {
        this.loadFeaturedAnime();
      });
    }
  }

  /**
   * Load a random anime as fallback
   * @param {HTMLElement} container - Where to render the anime
   */
  async loadRandomAnime(container) {
    try {
      const response = await getRandomAnime();
      
      if (response && response.data) {
        container.innerHTML = this.createAnimeCard(response.data);
      } else {
        container.innerHTML = '<p>No anime found. Please try again later.</p>';
      }
    } catch (error) {
      console.error('Error loading random anime:', error);
      container.innerHTML = '<p>Failed to load anime data.</p>';
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
}

// Make it available globally
window.HomeView = new HomeView();
