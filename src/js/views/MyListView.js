import AnimeCard, { 
  setupRemoveButtons, 
  setupAnimeCardInteractivity
} from '../ui/components/AnimeCard.js';

class MyListView {
  /**
   * Render the My Anime List view
   */
  async render() {
    // Make sure the container is properly initialized
    const appElement = document.getElementById("app");
    if (appElement) {
      appElement.innerHTML = `
        <section class="my-list-view">
          <h1>My Anime List</h1>
          <div class="my-list-container" id="my-list-container">
            <!-- My list will be loaded here -->
            <p>Your saved anime will appear here</p>
          </div>
        </section>
      `;
      
      // Now load the list after ensuring the container exists
      this.loadMyList();
    }
  }
  
  /**
   * Load and display the user's saved anime list
   */  loadMyList() {
    const myListContainer = document.getElementById('my-list-container');
    
    // Check if the container exists
    if (!myListContainer) {
      console.error('My list container not found. Re-rendering view.');
      // Re-render the view to create the container first
      this.render();
      return;
    }
    
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
          .map(anime => AnimeCard(anime))
          .join('');
        
        listHTML += '</div>';
        
        myListContainer.innerHTML = listHTML;
        document.getElementById('clear-list-btn').addEventListener('click', () => {
          if (confirm('Are you sure you want to clear your entire anime list?')) {
            localStorage.removeItem('myAnimeList');
            this.loadMyList();
          }
        });
        
        // Set up event listeners for remove buttons
        setupRemoveButtons(() => this.loadMyList());
        
        // Set up interactivity for anime cards with an update callback
        setupAnimeCardInteractivity({
          updateCallback: () => this.loadMyList()
        });
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
}

// Make it available globally
window.MyListView = new MyListView();
