import { getSeasonsNow, getRandomAnime, getTrendingAnime, getTopAiringAnime } from '../api/jikan.js';
import Carousel from '../ui/components/Carousel.js';
import AnimeCard, { setupAnimeCardInteractivity } from '../ui/components/AnimeCard.js';

class HomeView {
  constructor() {
    // Track anime IDs that have already been displayed to prevent duplicates
    this.displayedAnimeIds = new Set();
  }

  /**
   * Render the home view with currently airing anime
   */  async render() {
    console.log("HomeView render starting");
    // Reset displayed anime tracking when rendering the home view
    this.displayedAnimeIds = new Set();
    
    // Make sure the home view structure is set up properly first
    const setupSuccess = this.setupHomeView();
    
    if (setupSuccess) {
      // Now load the content
      console.log("Loading home view content");
      await this.loadTrendingCarousel();
      await this.loadFeaturedAnime();
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
          <h1>Welcome to AniChan</h1>
          <!-- Featured section with carousel container -->
          <div id="trending-section" class="trending-anime">
            <h2>Featured Anime</h2>
            <div id="trending-carousel-container">
              <!-- Featured anime carousel will be loaded here -->
              <p>Loading featured anime...</p>
            </div>
          </div>
          <!-- Regular featured anime section (grid) -->
          <div class="featured-anime">
            <h2>Popular Anime</h2>
            <div id="featured-container">
              <!-- Popular anime will be loaded here -->
              <p>Loading popular anime...</p>
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
  }  /**
   * Load trending anime carousel
   */  async loadTrendingCarousel() {
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
      
      // Fetch currently airing (featured) anime data instead of trending
      const response = await getSeasonsNow();
      
      if (response && response.data && response.data.length > 0) {
        // Clear the loading message
        carouselContainer.innerHTML = '';
        
        // Get anime items sorted by score to feature the best ones
        const featuredItems = response.data
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .slice(0, 12); // Show more items since our carousel now displays multiple at once
        
        // Track displayed anime to avoid duplicates in other sections
        featuredItems.forEach(anime => this.displayedAnimeIds.add(anime.mal_id));

        // Filter out anime with duplicate titles
        const uniqueTitles = new Set();
        const filteredFeaturedItems = featuredItems.filter(anime => {
          if (uniqueTitles.has(anime.title)) return false;
          uniqueTitles.add(anime.title);
          return true;
        });

        // Track displayed anime to avoid duplicates in other sections
        filteredFeaturedItems.forEach(anime => this.displayedAnimeIds.add(anime.mal_id));
        
        // Initialize the carousel with the featured items
        Carousel(carouselContainer, filteredFeaturedItems);
        
        // Update the section heading to reflect content
        const trendingSection = document.getElementById('trending-section');
        if (trendingSection) {
          const heading = trendingSection.querySelector('h2');
          if (heading) {
            heading.textContent = 'Featured Anime';
          }
        }
      } else {
        // Fallback to trending anime if featured fails
        try {
          const backupResponse = await getTrendingAnime(12);
          if (backupResponse && backupResponse.data && backupResponse.data.length > 0) {
            // Clear previous message
            carouselContainer.innerHTML = '';
            
            // Initialize carousel with trending items
            Carousel(carouselContainer, backupResponse.data);
          } else {
            // Final fallback to top airing anime
            const topAiringResponse = await getTopAiringAnime(12);
            if (topAiringResponse && topAiringResponse.data && topAiringResponse.data.length > 0) {
              carouselContainer.innerHTML = '';
              
              // Initialize carousel with top airing items
              Carousel(carouselContainer, topAiringResponse.data);
            } else {
              carouselContainer.innerHTML = '<p>No featured anime available.</p>';
            }
          }
        } catch (backupError) {
          console.error('Error loading backup anime data:', backupError);
          carouselContainer.innerHTML = '<p>No featured anime available.</p>';
        }
      }
    } catch (error) {
      console.error('Error loading featured anime carousel:', error);
      carouselContainer.innerHTML = `
        <div class="error-message">
          <p>Failed to load featured anime.</p>
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
  }  /**
   * Load popular anime for the grid display
   */  async loadFeaturedAnime() {
    const featuredContainer = document.getElementById('featured-container');
    
    if (!featuredContainer) {
      console.error('Featured container not found');
      return;
    }
    
    try {
      // Display loading state
      featuredContainer.innerHTML = '<p>Loading popular anime...</p>';
      
      // Fetch popular anime using trending endpoint - different from the featured carousel
      const response = await getTrendingAnime(20); // Request more to have enough after filtering duplicates
      
      // Check if we have data
      if (response && response.data && response.data.length > 0) {
        // Filter out any anime that are already displayed in other sections
        const uniquePopularAnime = response.data.filter(anime => 
          !this.displayedAnimeIds.has(anime.mal_id)
        ).slice(0, 12); // Limit to 12 unique items
        
        if (uniquePopularAnime.length > 0) {
          // Track these anime as displayed
          uniquePopularAnime.forEach(anime => this.displayedAnimeIds.add(anime.mal_id));
            // Add the anime-grid class and populate with cards
          featuredContainer.classList.add('anime-grid');
          featuredContainer.innerHTML = uniquePopularAnime
            .map(anime => AnimeCard(anime))
            .join('');
          
          // Set up the interactive elements
          setupAnimeCardInteractivity();
        } else {
          // If all trending anime were duplicates, try to get random anime instead
          this.loadRandomAnime(featuredContainer);
        }
      } else {
        // If trending fails, fall back to seasonal anime but with different ones
        try {
          const seasonalResponse = await getSeasonsNow();
          if (seasonalResponse && seasonalResponse.data && seasonalResponse.data.length > 0) {
            // Filter out any anime that are already displayed in other sections
            const uniqueSeasonalAnime = seasonalResponse.data
              .sort((a, b) => (b.score || 0) - (a.score || 0))
              .filter(anime => !this.displayedAnimeIds.has(anime.mal_id))
              .slice(0, 12);
              
            if (uniqueSeasonalAnime.length > 0) {
              // Track these anime as displayed
              uniqueSeasonalAnime.forEach(anime => this.displayedAnimeIds.add(anime.mal_id));
              
              // Add the anime-grid class and populate with cards
              featuredContainer.classList.add('anime-grid');
              featuredContainer.innerHTML = uniqueSeasonalAnime
                .map(anime => this.createAnimeCard(anime))
                .join('');
            } else {
              // If still no unique anime, try to get a random anime
              this.loadRandomAnime(featuredContainer);
            }
          } else {
            // If no results, try to get a random anime
            this.loadRandomAnime(featuredContainer);
          }
        } catch (backupError) {
          console.error('Error loading backup anime data:', backupError);
          this.loadRandomAnime(featuredContainer);
        }
      }
    } catch (error) {
      console.error('Error loading popular anime:', error);
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
}

// Make it available globally
window.HomeView = new HomeView();
