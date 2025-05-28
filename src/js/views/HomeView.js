import { getSeasonsNow, getRandomAnime, getTrendingAnime, getTopAiringAnime } from '../api/jikan.js';
import Carousel from '../ui/components/Carousel.js';

class HomeView {
  /**
   * Render the home view with currently airing anime
   */  async render() {
    console.log("HomeView render starting");
    // Make sure the home view structure is set up properly first
    const setupSuccess = this.setupHomeView();
    
    if (setupSuccess) {
      // Now load the content
      console.log("Loading home view content");
      this.loadTrendingCarousel();
      this.loadFeaturedAnime();
    } else {
      console.error("Failed to set up home view structure, cannot render content");
    }
  }
  
  /**
   * Setup the home view structure if needed
   */  setupHomeView() {
    const appElement = document.getElementById('app');
    if (!appElement) {
      console.error('App element not found');
      return false;
    }
    
    // Check if home view exists, if not create it
    let homeView = document.querySelector('.home-view');
    if (!homeView) {
      console.log('Creating home view structure');
      // Create the complete home view structure
      appElement.innerHTML = `
        <section class="home-view">
          <h1>Welcome to Anime Browse</h1>
          <!-- Trending section with carousel container -->
          <div id="trending-section" class="trending-anime">
            <h2>Trending Anime</h2>
            <div id="trending-carousel-container">
              <!-- Trending anime will be loaded here -->
              <p>Loading trending anime...</p>
            </div>
          </div>
          <!-- Featured anime section -->
          <div class="featured-anime">
            <h2>Featured Anime</h2>
            <div class="anime-grid" id="featured-container">
              <!-- Featured anime will be loaded here -->
              <p>Loading featured anime...</p>
            </div>
          </div>
        </section>
      `;
      
      // Re-query for the home view after creating it
      homeView = document.querySelector('.home-view');
    }
    
    // Verify that required elements exist after potentially creating them
    const trendingContainer = document.getElementById('trending-carousel-container');
    const featuredContainer = document.getElementById('featured-container');
    
    if (!trendingContainer) {
      console.error('Trending carousel container not found');
      return false;
    }
    
    if (!featuredContainer) {
      console.error('Featured container not found');
      return false;
    }
    
    return true;
  }
  /**
   * Load trending anime carousel
   */
  async loadTrendingCarousel() {
    // Get the carousel container
    const carouselContainer = document.getElementById('trending-carousel-container');
    
    // If container doesn't exist, we can't proceed
    if (!carouselContainer) {
      console.error('Trending carousel container not found');
      return;
    }
    
    try {
      // Show loading state
      carouselContainer.innerHTML = '<p>Loading trending anime...</p>';
      
      // Fetch trending anime data using our specialized function
      const response = await getTrendingAnime(8);
      
      if (response && response.data && response.data.length > 0) {
        // Clear the loading message
        carouselContainer.innerHTML = '';
        
        // Initialize the carousel with the trending items
        Carousel(carouselContainer, response.data);
      } else {
        // Fallback to top airing anime if trending fails
        try {
          const backupResponse = await getTopAiringAnime(8);
          if (backupResponse && backupResponse.data && backupResponse.data.length > 0) {
            // Clear previous message
            carouselContainer.innerHTML = '';
            
            // Initialize carousel with airing items
            Carousel(carouselContainer, backupResponse.data);
          } else {
            // Final fallback to currently airing seasonal anime
            const seasonalResponse = await getSeasonsNow();
            if (seasonalResponse && seasonalResponse.data && seasonalResponse.data.length > 0) {
              carouselContainer.innerHTML = '';
              
              // Get the top items sorted by score
              const seasonalItems = seasonalResponse.data
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .slice(0, 8);
                
              // Initialize carousel with seasonal items
              Carousel(carouselContainer, seasonalItems);
            } else {
              carouselContainer.innerHTML = '<p>No trending anime available.</p>';
            }
          }
        } catch (backupError) {
          console.error('Error loading backup anime data:', backupError);
          carouselContainer.innerHTML = '<p>No trending anime available.</p>';
        }
      }
    } catch (error) {
      console.error('Error loading trending anime carousel:', error);
      carouselContainer.innerHTML = `
        <div class="error-message">
          <p>Failed to load trending anime.</p>
          <button id="retry-trending">Retry</button>
        </div>
      `;
      
      // Add retry functionality
      const retryButton = document.getElementById('retry-trending');
      if (retryButton) {
        retryButton.addEventListener('click', () => {
          this.loadTrendingCarousel();
        });
      }
    }
  }

  /**
   * Load featured anime (currently airing)
   */
  async loadFeaturedAnime() {
    const featuredContainer = document.getElementById('featured-container');
    
    if (!featuredContainer) {
      console.error('Featured container not found');
      return;
    }
    
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
      const retryButton = document.getElementById('retry-featured');
      if (retryButton) {
        retryButton.addEventListener('click', () => {
          this.loadFeaturedAnime();
        });
      }
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
