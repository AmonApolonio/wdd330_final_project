import AnimeCard, {
  setupRemoveButtons,
  setupAnimeCardInteractivity
} from '../ui/components/AnimeCard.js';

class MyListView {
  async render() {
    const appElement = document.getElementById("app");
    if (appElement) {
      appElement.innerHTML = `
        <section class="my-list-view">
          <h1>My Anime List</h1>
          <div class="my-list-container" id="my-list-container">
            <p>Your saved anime will appear here</p>
          </div>
        </section>
      `;

      this.loadMyList();
    }
  }

  loadMyList() {
    const myListContainer = document.getElementById('my-list-container');

    if (!myListContainer) {
      console.error('My list container not found. Re-rendering view.');
      this.render();
      return;
    }

    try {
      const myList = JSON.parse(localStorage.getItem('myAnimeList') || '[]');
      if (myList.length > 0) {
        myList.sort((a, b) => new Date(b.saved_at) - new Date(a.saved_at));

        let listHTML = `
          <p>You have ${myList.length} anime in your list</p>
          <button id="clear-list-btn">Clear My List</button>
          <div class="anime-grid">
        `;

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

        setupRemoveButtons(() => this.loadMyList());

        setupAnimeCardInteractivity({
          updateCallback: () => this.loadMyList()
        });
      } else {
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

      document.getElementById('retry-my-list').addEventListener('click', () => {
        this.loadMyList();
      });
    }
  }
}

window.MyListView = new MyListView();
