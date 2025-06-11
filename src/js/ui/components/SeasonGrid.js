/**
 * Render a responsive grid of anime cards into the given container.
 * @param {HTMLElement} containerEl - The container element to render into
 * @param {Array<Object>} animeList - List of anime objects
 * @param {function} createAnimeCard - (Optional) Function to create anime card HTML from anime object
 */
export default function SeasonGrid(containerEl, animeList, createAnimeCard) {
  if (!containerEl) return;

  if (!createAnimeCard && window.HomeView && typeof window.HomeView.createAnimeCard === 'function') {
    createAnimeCard = window.HomeView.createAnimeCard.bind(window.HomeView);
  }
  if (!createAnimeCard) {
    containerEl.innerHTML = '<p>Could not render anime cards: no card renderer found.</p>';
    return;
  }

  containerEl.classList.add('anime-grid');
  containerEl.innerHTML = animeList.map(anime => createAnimeCard(anime)).join('');
}
