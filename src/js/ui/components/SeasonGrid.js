// SeasonGrid.js
// Exports SeasonGrid(containerEl, animeList)
// Renders a responsive grid of AnimeCards (2 columns mobile, 4 desktop)

/**
 * Render a responsive grid of anime cards into the given container.
 * @param {HTMLElement} containerEl - The container element to render into
 * @param {Array<Object>} animeList - List of anime objects
 * @param {function} createAnimeCard - (Optional) Function to create anime card HTML from anime object
 */
export default function SeasonGrid(containerEl, animeList, createAnimeCard) {
  if (!containerEl) return;
  // Use provided card creator or fallback to HomeView.createAnimeCard
  if (!createAnimeCard && window.HomeView && typeof window.HomeView.createAnimeCard === 'function') {
    createAnimeCard = window.HomeView.createAnimeCard.bind(window.HomeView);
  }
  if (!createAnimeCard) {
    containerEl.innerHTML = '<p>Could not render anime cards: no card renderer found.</p>';
    return;
  }
  // Add grid class
  containerEl.classList.add('anime-grid');
  // Render cards
  containerEl.innerHTML = animeList.map(anime => createAnimeCard(anime)).join('');
}
