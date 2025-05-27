class MyListView {
  /**
   * Render the My Anime List view
   */
  async render() {
    // Container is already rendered by router.js
    this.loadMyList();
  }
  
  /**
   * Load and display the user's saved anime list
   */
  loadMyList() {
    const myListContainer = document.getElementById('my-list-container');
    
    try {
      // Get saved list from localStorage
      const myList = JSON.parse(localStorage.getItem('myAnimeList') || '[]');
      
      // If there are items in the list, display them
      if (myList.length > 0) {
        // Sort by saved date (newest first)
        myList.sort((a, b) => new Date(b.saved_at) - new Date(a.saved_at));
        
        // Create HTML for the anime grid
        let listHTML = `
          <p>You have ${myList.length} anime in your list</p>
          <button id="clear-list-btn">Clear My List</button>
          <div class="anime-grid">
        `;
        
        // Add each anime as a card
        listHTML += myList
          .map(anime => this.createAnimeCard(anime))
          .join('');
        
        listHTML += '</div>';
        
        myListContainer.innerHTML = listHTML;
        
        // Add event listener for the clear list button
        document.getElementById('clear-list-btn').addEventListener('click', () => {
          if (confirm('Are you sure you want to clear your entire anime list?')) {
            localStorage.removeItem('myAnimeList');
            this.loadMyList();
          }
        });
        
        // Add event listeners for remove buttons
        this.setupRemoveButtons();
      } else {
        // If no items in list, show a message
        myListContainer.innerHTML = `
          <p>You haven't added any anime to your list yet.</p>
          <p>Browse the home page or search for anime to add them to your list.</p>
        `;
      }
    } catch (error) {
      console.error('Error loading my anime list:', error);
      myListContainer.innerHTML = `
        <div class="error-message">
          <p>Failed to load your anime list.</p>
          <button id="retry-my-list">Retry</button>
        </div>
      `;
      
      // Add retry functionality
      document.getElementById('retry-my-list').addEventListener('click', () => {
        this.loadMyList();
      });
    }
  }
  
  /**
   * Create HTML for an anime card in the my list view
   * @param {Object} anime - Saved anime data
   * @returns {string} - HTML string
   */
  createAnimeCard(anime) {
    // Default image if none provided
    const imageUrl = anime.image_url || 'https://via.placeholder.com/225x318?text=No+Image';
    
    return `
      <div class="anime-card" data-id="${anime.mal_id}">
        <div class="anime-card-image">
          <img src="${imageUrl}" alt="${anime.title}" loading="lazy">
        </div>
        <div class="anime-card-content">
          <h3>${anime.title}</h3>
          <p>${anime.score ? `Rating: ${anime.score}/10` : 'Not rated'}</p>
          <p>${anime.type || 'Anime'} (${anime.episodes || '?'} episodes)</p>
          <div class="anime-card-actions">
            <a href="#/detail/${anime.mal_id}" class="view-details-btn">View Details</a>
            <button class="remove-anime-btn" data-id="${anime.mal_id}">Remove</button>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Set up event listeners for remove buttons
   */
  setupRemoveButtons() {
    document.querySelectorAll('.remove-anime-btn').forEach(button => {
      button.addEventListener('click', () => {
        const animeId = parseInt(button.dataset.id, 10);
        this.removeAnimeFromList(animeId);
      });
    });
  }
  
  /**
   * Remove an anime from the user's list
   * @param {number} animeId - The ID of the anime to remove
   */
  removeAnimeFromList(animeId) {
    try {
      // Get current list from localStorage
      const myList = JSON.parse(localStorage.getItem('myAnimeList') || '[]');
      
      // Filter out the anime with the given ID
      const updatedList = myList.filter(anime => anime.mal_id !== animeId);
      
      // Save back to localStorage
      localStorage.setItem('myAnimeList', JSON.stringify(updatedList));
      
      // Reload the list to reflect changes
      this.loadMyList();
    } catch (error) {
      console.error('Error removing anime from list:', error);
      alert('Failed to remove anime from your list. Please try again.');
    }
  }
}

// Make it available globally
window.MyListView = new MyListView();
