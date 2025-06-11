import { getAnimeFull } from '../../api/jikan.js';

/**
 * Creates an anime card element
 * @param {Object} anime - The anime data object
 * @returns {string} - HTML string for the anime card
 */
export default function AnimeCard(anime, options = {}) {
  const imageUrl = anime.images?.jpg?.image_url || anime.image_url || 'https://via.placeholder.com/225x318?text=No+Image';
  const title = anime.title_english || anime.title;
  const isInList = isAnimeInMyList(anime.mal_id);

  const episodeText = anime.episodes ? `${anime.episodes} ep` : 'Unknown ep';
  const statusText = anime.status || 'Unknown';
  const statusEpisodes = `${statusText} - ${episodeText}`;
  let cardHTML = `
    <div class="anime-card" data-id="${anime.mal_id}" data-status="${anime.status || ''}">
      <div class="anime-card-image">
        <img src="${imageUrl}" alt="${title}" loading="lazy">
        <div class="anime-status">${statusEpisodes}</div>
      </div>
      <div class="anime-card-content">
        <h3 title="${title}">${title}</h3>
        
        <div class="anime-card-stats">
          <div class="stat-item">
            <p class="stat-value">${anime.score || '-'}</p>
            <p class="stat-label">Score</p>
          </div>
          
          <div class="stat-item">
            <p class="stat-value">${anime.rank ? `#${anime.rank}` : '-'}</p>
            <p class="stat-label">Rank</p>
          </div>
          
          <div class="anime-card-actions">
            <div class="add-button ${isInList ? 'in-list' : ''}" data-id="${anime.mal_id}">
              <span class="button-icon">${isInList ? '−' : '+'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return cardHTML;
}

/**
 * Remove an anime from the user's list
 * @param {number} animeId - The ID of the anime to remove
 * @returns {boolean} - Success status of the operation
 */
export function removeAnimeFromList(animeId) {
  try {
    const myList = JSON.parse(localStorage.getItem('myAnimeList') || '[]');
    const updatedList = myList.filter(anime => anime.mal_id !== animeId);
    localStorage.setItem('myAnimeList', JSON.stringify(updatedList));

    return true;
  } catch (error) {
    console.error('Error removing anime from list:', error);
    return false;
  }
}

/**
 * Add an anime to the user's list
 * @param {Object} anime - The anime data to add
 * @returns {boolean} - Success status of the operation
 */
export function addAnimeToList(anime) {
  try {
    const myList = JSON.parse(localStorage.getItem('myAnimeList') || '[]');

    if (myList.some(item => item.mal_id === anime.mal_id)) {
      return false;
    }

    const animeToSave = {
      mal_id: anime.mal_id,
      title: anime.title_english || anime.title,
      image_url: anime.images?.jpg?.image_url || anime.image_url || '',
      score: anime.score,
      type: anime.type,
      episodes: anime.episodes,
      status: anime.status,
      rank: anime.rank,
      saved_at: new Date().toISOString()
    };

    myList.push(animeToSave);
    localStorage.setItem('myAnimeList', JSON.stringify(myList));

    return true;
  } catch (error) {
    console.error('Error adding anime to list:', error);
    return false;
  }
}

/**
 * Toggle an anime in the user's list (add if not present, remove if present)
 * @param {Object|number} animeOrId - The anime object or ID
 * @returns {boolean} - Whether the anime is now in the list
 */
export function toggleAnimeInList(animeOrId) {
  try {
    const animeId = typeof animeOrId === 'object' ? animeOrId.mal_id : animeOrId;
    const isInList = isAnimeInMyList(animeId);

    if (isInList) {
      removeAnimeFromList(animeId);
      return false;
    } else {
      if (typeof animeOrId === 'object') {
        addAnimeToList(animeOrId);
        return true;
      }
      return false;
    }
  } catch (error) {
    console.error('Error toggling anime in list:', error);
    return false;
  }
}

/**
 * Set up event listeners for anime card remove buttons
 * @param {Function} callback - Optional callback to run after successful removal
 */
export function setupRemoveButtons(callback) {
  document.querySelectorAll('.remove-anime-btn').forEach(button => {
    button.addEventListener('click', () => {
      const animeId = parseInt(button.dataset.id, 10);
      const success = removeAnimeFromList(animeId);
      if (success) {
        if (typeof callback === 'function') {
          callback();
        }
      } else {
        alert('Failed to remove anime from your list. Please try again.');
      }
    });
  });
}

/**
 * Set up event listeners for the quick add/remove buttons on anime cards
 * @param {Function} getAnimeData - Function to get anime data by ID (for adding)
 * @param {Function} callback - Optional callback to run after toggling
 */
export function setupQuickAddButtons(getAnimeData, callback) {
  document.querySelectorAll('.add-button').forEach(button => {
    button.addEventListener('click', async (e) => {
      e.stopPropagation();
      const animeId = parseInt(button.dataset.id, 10);
      const isInList = isAnimeInMyList(animeId);
      const iconElement = button.querySelector('.button-icon');

      if (isInList) {
        const success = removeAnimeFromList(animeId);
        if (success) {
          iconElement.textContent = '+';
          button.classList.remove('in-list');
          if (typeof callback === 'function') {
            callback(false, animeId);
          }
        }
      } else {
        try {
          let animeData;
          if (typeof getAnimeData === 'function') {
            animeData = await getAnimeData(animeId);
          }

          if (animeData) {
            const success = addAnimeToList(animeData);
            if (success) {
              iconElement.textContent = '−';
              button.classList.add('in-list');
              if (typeof callback === 'function') {
                callback(true, animeId);
              }
            }
          }
        } catch (error) {
          console.error('Error adding anime to list:', error);
          alert('Failed to add anime to your list. Please try again.');
        }
      }
    });
  });
}

/**
 * Set up event listeners for clickable anime cards
 */
export function setupAnimeCardClickEvents() {  document.querySelectorAll('.anime-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('button') && !e.target.closest('.quick-add-button')) {
        const animeId = card.dataset.id;
        window.location.hash = `#/detail/${animeId}`;
      }
    });
  });
}

/**
 * Set up interactivity for all anime cards
 * Makes cards clickable and sets up quick add/remove buttons
 * @param {Object} options - Configuration options
 * @param {Function} options.getAnimeDataCallback - Optional custom function to get anime data (if null, uses default)
 * @param {Function} options.updateCallback - Optional callback after anime is added/removed 
 */
export function setupAnimeCardInteractivity(options = {}) {
  setupAnimeCardClickEvents();

  const getAnimeDataFn = options.getAnimeDataCallback || (async (animeId) => {
    try {
      const response = await getAnimeFull(animeId);
      if (response && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching anime data for ID ${animeId}:`, error);
      return null;
    }
  });

  setupQuickAddButtons(getAnimeDataFn, options.updateCallback);
}

/**
 * Check if an anime is in the user's list
 * @param {number} animeId - The ID of the anime to check
 * @returns {boolean} - Whether the anime is in the user's list
 */
export function isAnimeInMyList(animeId) {
  try {
    const animeIdNum = Number(animeId);
    const myList = JSON.parse(localStorage.getItem('myAnimeList') || '[]');
    const isInList = myList.some(anime => Number(anime.mal_id) === animeIdNum);
    return isInList;
  } catch (error) {
    console.error('Error checking if anime is in list:', error);
    return false;
  }
}
