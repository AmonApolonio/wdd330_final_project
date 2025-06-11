import { getSeasonsNow, getRandomAnime, getTrendingAnime, getTopAiringAnime } from '../api/jikan.js';
import Carousel from '../ui/components/Carousel.js';
import AnimeCard, { setupAnimeCardInteractivity } from '../ui/components/AnimeCard.js';

class HomeView {
  constructor() {
    this.displayedAnimeIds = new Set();
  }

  async render() {
    console.log("HomeView render starting");
    this.displayedAnimeIds = new Set();

    const setupSuccess = this.setupHomeView();

    if (setupSuccess) {
      console.log("Loading home view content");
      await this.loadTrendingCarousel();
      await this.loadFeaturedAnime();
    } else {
      console.error("Failed to set up home view structure, cannot render content");
    }
  }
  setupHomeView() {
    const appElement = document.getElementById('app');
    if (!appElement) {
      console.error('App element not found');
      return false;
    }
    let homeView = document.querySelector('.home-view');
    if (!homeView) {
      console.log('Creating home view structure');
      appElement.innerHTML = `
        <section class="home-view">
          <h1>Welcome to AniChan</h1>          
          <div id="trending-section" class="trending-anime">
            <h2>Featured Anime</h2>
            <div id="trending-carousel-container">
              <p>Loading featured anime...</p>
            </div>
          </div>          
          <div class="featured-anime">
            <h2>Popular Anime</h2>
            <div id="featured-container">
              <p>Loading popular anime...</p>
            </div>
          </div>
        </section>
      `;
      homeView = document.querySelector('.home-view');
    }

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

  async loadTrendingCarousel() {
    const carouselContainer = document.getElementById('trending-carousel-container');
    if (!carouselContainer) {
      console.error('Trending carousel container not found');
      return;
    }

    try {
      carouselContainer.innerHTML = '<p>Loading trending anime...</p>';

      const response = await getSeasonsNow();

      if (response && response.data && response.data.length > 0) {
        carouselContainer.innerHTML = '';

        const featuredItems = response.data
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .slice(0, 12);

        featuredItems.forEach(anime => this.displayedAnimeIds.add(anime.mal_id));

        const uniqueTitles = new Set();
        const filteredFeaturedItems = featuredItems.filter(anime => {
          if (uniqueTitles.has(anime.title)) return false;
          uniqueTitles.add(anime.title);
          return true;
        });

        filteredFeaturedItems.forEach(anime => this.displayedAnimeIds.add(anime.mal_id));

        Carousel(carouselContainer, filteredFeaturedItems);

        const trendingSection = document.getElementById('trending-section');
        if (trendingSection) {
          const heading = trendingSection.querySelector('h2');
          if (heading) {
            heading.textContent = 'Featured Anime';
          }
        }
      } else {
        try {
          const backupResponse = await getTrendingAnime(12);
          if (backupResponse && backupResponse.data && backupResponse.data.length > 0) {
            carouselContainer.innerHTML = '';

            Carousel(carouselContainer, backupResponse.data);
          } else {
            const topAiringResponse = await getTopAiringAnime(12);
            if (topAiringResponse && topAiringResponse.data && topAiringResponse.data.length > 0) {
              carouselContainer.innerHTML = '';

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

      const retryButton = document.getElementById('retry-trending');
      if (retryButton) {
        retryButton.addEventListener('click', () => {
          this.loadTrendingCarousel();
        });
      }
    }
  }

  async loadFeaturedAnime() {
    const featuredContainer = document.getElementById('featured-container');

    if (!featuredContainer) {
      console.error('Featured container not found');
      return;
    }

    try {
      featuredContainer.innerHTML = '<p>Loading popular anime...</p>';
      const response = await getTrendingAnime(20);

      if (response && response.data && response.data.length > 0) {
        const uniquePopularAnime = response.data.filter(anime =>
          !this.displayedAnimeIds.has(anime.mal_id)
        ).slice(0, 12);

        if (uniquePopularAnime.length > 0) {
          uniquePopularAnime.forEach(anime => this.displayedAnimeIds.add(anime.mal_id));
          featuredContainer.classList.add('anime-grid');
          featuredContainer.innerHTML = uniquePopularAnime
            .map(anime => AnimeCard(anime))
            .join('');

          setupAnimeCardInteractivity();
        } else {
          this.loadRandomAnime(featuredContainer);
        }
      } else {
        try {
          const seasonalResponse = await getSeasonsNow();
          if (seasonalResponse && seasonalResponse.data && seasonalResponse.data.length > 0) {
            const uniqueSeasonalAnime = seasonalResponse.data
              .sort((a, b) => (b.score || 0) - (a.score || 0))
              .filter(anime => !this.displayedAnimeIds.has(anime.mal_id))
              .slice(0, 12);

            if (uniqueSeasonalAnime.length > 0) {
              uniqueSeasonalAnime.forEach(anime => this.displayedAnimeIds.add(anime.mal_id));
              
              featuredContainer.classList.add('anime-grid');
              featuredContainer.innerHTML = uniqueSeasonalAnime
                .map(anime => this.createAnimeCard(anime))
                .join('');
            } else {
              this.loadRandomAnime(featuredContainer);
            }
          } else {
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

      const retryButton = document.getElementById('retry-featured');
      if (retryButton) {
        retryButton.addEventListener('click', () => {
          this.loadFeaturedAnime();
        });
      }
    }
  }
}

window.HomeView = new HomeView();
