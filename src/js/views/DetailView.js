import { getAnimeFull } from '../api/jikan.js';
import { searchQuotesByAnime } from '../api/animequotes.js';

class DetailView {
  constructor() {
    this.animeQuotes = [];
  }

  async render(id) {
    const appElement = document.getElementById("app");
    if (appElement) {
      appElement.innerHTML = `
        <section class="detail-view">
          <h1>Anime Details</h1>
          <div class="anime-detail" id="anime-detail-container" data-id="${id || ''}">
            <p>Loading anime details...</p>
          </div>
        </section>
      `; if (id) {
        this.loadAnimeDetails(id);
      } else {
        const detailContainer = document.getElementById('anime-detail-container');
        if (detailContainer) {
          detailContainer.innerHTML = '<p>No anime ID provided. Please go back and select an anime.</p>';
        }
      }
    }
  }

  async loadAnimeDetails(id) {
    const detailContainer = document.getElementById('anime-detail-container');

    if (!detailContainer) {
      console.error('Anime detail container not found. Re-rendering view.');
      this.render(id);
      return;
    }

    try {
      detailContainer.innerHTML = '<p>Loading anime details...</p>';
      const response = await getAnimeFull(id);

      if (response && response.data) {
        detailContainer.innerHTML = this.createAnimeDetailHTML(response.data);

        this.setupEventListeners(response.data);

        this.loadAnimeQuotes(response.data.title_english || response.data.title);
      } else {
        detailContainer.innerHTML = '<p>Anime not found. It may have been removed or the ID is incorrect.</p>';
      }
    } catch (error) {
      console.error('Error loading anime details:', error);
      detailContainer.innerHTML = `
        <div class="error-message">
          <p>Failed to load anime details.</p>
          <button id="retry-detail">Retry</button>
        </div>
      `;

      document.getElementById('retry-detail').addEventListener('click', () => {
        this.loadAnimeDetails(id);
      });
    }
  }

  async loadAnimeQuotes(animeTitle) {
    const quoteContainer = document.getElementById('anime-quote-container');
    if (!quoteContainer) return;

    try {
      this.animeQuotes = [];
      const quotes = await searchQuotesByAnime(animeTitle);
      if (Array.isArray(quotes)) {
        this.animeQuotes = quotes;
      } else if (quotes && quotes.data && Array.isArray(quotes.data)) {
        this.animeQuotes = quotes.data;
      }
      if (this.animeQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * this.animeQuotes.length);
        const quoteObj = this.animeQuotes[randomIndex];

        quoteContainer.innerHTML = `
          <section class="anime-quote anime-card">
            <div class="anime-card-content">
              <div class="quote-text">
                <span class="quote-mark">"</span>${quoteObj.quote}<span class="quote-mark">"</span>
              </div>
              <div class="quote-meta">
                <p class="quote-character">— ${quoteObj.character}</p>
                <p class="quote-anime">${quoteObj.show}</p>
              </div>
              <div class="quote-actions">
                <button id="new-quote-btn" class="primary-btn" type="button">New Quote</button>
              </div>
            </div>
          </section>
        `;

        const newQuoteBtn = document.getElementById('new-quote-btn');
        if (newQuoteBtn) {
          newQuoteBtn.addEventListener('click', this.handleNewQuote.bind(this));
        }
      } else {
        quoteContainer.innerHTML = '';
      }
    } catch (error) {
      console.error('Error loading quotes:', error);
      quoteContainer.innerHTML = '';
    }
  }

  handleNewQuote() {
    const newQuoteBtn = document.getElementById('new-quote-btn');
    if (newQuoteBtn) {
      newQuoteBtn.disabled = true;
      newQuoteBtn.textContent = 'Loading...';
    }

    try {
      if (this.animeQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * this.animeQuotes.length);
        const quoteObj = this.animeQuotes[randomIndex];

        const quoteSection = document.querySelector('.anime-quote .anime-card-content');
        if (quoteSection && quoteObj) {
          quoteSection.innerHTML = `
          <div class="quote-text">
              <span class="quote-mark">"</span>${quoteObj.quote}<span class="quote-mark">"</span>
            </div>
            <div class="quote-meta">
              <p class="quote-character">— ${quoteObj.character}</p>
              <p class="quote-anime">${quoteObj.show}</p>
            </div>
            <div class="quote-actions">
              <button id="new-quote-btn" class="primary-btn" type="button">New Quote</button>
            </div>
          `;

          const newBtn = document.getElementById('new-quote-btn');
          if (newBtn) {
            newBtn.addEventListener('click', this.handleNewQuote.bind(this));
          }
        }
      } else {
        alert('No quotes available for this anime.');

        const btn = document.getElementById('new-quote-btn');
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'New Quote';
        }
      }
    } catch (e) {
      console.error('Error displaying new quote:', e);
      alert('Failed to display a new quote.');

      const btn = document.getElementById('new-quote-btn');
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'New Quote';
      }
    }
  }

  createAnimeDetailHTML(anime) {
    const imageUrl = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || 'https://via.placeholder.com/225x318?text=No+Image';

    const title = anime.title_english || anime.title;

    const status = anime.status || 'Unknown status';

    const genres = anime.genres?.map(genre => genre.name).join(', ') || 'Not categorized';

    return `
      <div class="anime-detail-content">
        <div class="anime-detail-header">
          <div class="anime-detail-image">
            <img src="${imageUrl}" alt="${title}">
          </div>
          <div class="anime-detail-info">
            <h2>${title}</h2>
            <p><strong>Original Title:</strong> ${anime.title}</p>
            <p><strong>Score:</strong> ${anime.score ? `${anime.score}/10` : 'Not rated'}</p>
            <p><strong>Status:</strong> ${status}</p>
            <p><strong>Episodes:</strong> ${anime.episodes || 'Unknown'}</p>
            <p><strong>Aired:</strong> ${anime.aired?.string || 'Unknown'}</p>
            <p><strong>Genres:</strong> ${genres}</p>
            ${anime.rating ? `<p><strong>Rating:</strong> ${anime.rating}</p>` : ''}
            <button id="save-anime-btn" data-id="${anime.mal_id}">Add to My List</button>
          </div>
        </div>
        
        <div id="anime-quote-container">
          <p>Loading quotes...</p>
        </div>
        
        <div class="anime-synopsis">
          <h3>Synopsis</h3>
          <p>${anime.synopsis || 'No synopsis available.'}</p>
        </div>
        
        ${anime.trailer?.embed_url ? `
          <div class="anime-trailer">
            <h3>Trailer</h3>
            <div class="responsive-iframe-container">
              <iframe src="${anime.trailer.embed_url}" 
                      frameborder="0" 
                      allowfullscreen>
              </iframe>
            </div>
          </div>
        ` : ''}
        
        ${anime.relations && anime.relations.length > 0 ? `
          <div class="anime-relations">
            <h3>Related Anime</h3>
            <ul>
              ${anime.relations.map(relation => `
                <li>
                  <strong>${relation.relation}:</strong> 
                  ${relation.entry.map(entry =>
      entry.type === 'anime' ?
        `<a href="#/detail/${entry.mal_id}">${entry.name}</a>` :
        entry.name
    ).join(', ')}
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
        
        ${anime.streaming && anime.streaming.length > 0 ? `
          <div class="anime-streaming">
            <h3>Where to Watch</h3>
            <ul>
              ${anime.streaming.map(stream => `
                <li>
                  <a href="${stream.url}" target="_blank" rel="noopener noreferrer">
                    ${stream.name}
                  </a>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  }

  setupEventListeners(anime) {
    const saveButton = document.getElementById('save-anime-btn');
    if (saveButton) {
      saveButton.addEventListener('click', () => {
        this.saveAnimeToList(anime);
      });
    }
  }

  saveAnimeToList(anime) {
    try {
      const myList = JSON.parse(localStorage.getItem('myAnimeList') || '[]');

      const exists = myList.some(item => item.mal_id === anime.mal_id);

      if (!exists) {
        const animeToSave = {
          mal_id: anime.mal_id,
          title: anime.title_english || anime.title,
          image_url: anime.images?.jpg?.image_url || '',
          score: anime.score,
          type: anime.type,
          episodes: anime.episodes,
          saved_at: new Date().toISOString()
        };

        myList.push(animeToSave);

        localStorage.setItem('myAnimeList', JSON.stringify(myList));

        const saveButton = document.getElementById('save-anime-btn');
        saveButton.textContent = 'Added to My List';
        saveButton.disabled = true;

        alert('Anime added to your list!');
      } else {
        alert('This anime is already in your list!');

        const saveButton = document.getElementById('save-anime-btn');
        saveButton.textContent = 'Already in My List';
        saveButton.disabled = true;
      }
    } catch (error) {
      console.error('Error saving anime to list:', error);
      alert('Failed to save anime to your list. Please try again.');
    }
  }
}

window.DetailView = new DetailView();
