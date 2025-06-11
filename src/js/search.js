export function initializeSearch() {
  const searchIcon = document.getElementById('search-icon');
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (searchIcon) {
    searchIcon.addEventListener('click', (e) => {
      e.preventDefault();

      if (searchForm.classList.contains('expanded') && searchInput?.value?.trim()) {
        handleSearch();
        return;
      }

      searchForm.classList.toggle('expanded');
      document.body.classList.toggle('search-active');
      const logoImg = document.querySelector('.logo-container img');
      if (logoImg) {
        if (searchForm.classList.contains('expanded')) {
          logoImg.setAttribute('data-original-src', logoImg.src);
          logoImg.src = '/wdd330_final_project/images/logo.svg';
        } else {
          const originalSrc = logoImg.getAttribute('data-original-src');
          if (originalSrc) {
            logoImg.src = originalSrc;
          }
        }
      }

      if (searchForm.classList.contains('expanded')) {
        setTimeout(() => searchInput.focus(), 100);
      }
    });
  }
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSearch();

      setTimeout(() => {
        searchForm.classList.remove('expanded');
      }, 300);
    });
  }
  document.addEventListener('click', (e) => {
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    const isClickInside = searchForm?.contains(e.target) || searchIcon?.contains(e.target);
    const isMobileMenuClick = menuToggle?.contains(e.target) ||
      (mainNav?.classList.contains('active') && mainNav?.contains(e.target));

    if (!isClickInside && !isMobileMenuClick && searchForm?.classList.contains('expanded')) {
      searchForm.classList.remove('expanded');
      document.body.classList.remove('search-active');

      const logoImg = document.querySelector('.logo-container img');
      if (logoImg) {
        const originalSrc = logoImg.getAttribute('data-original-src');
        if (originalSrc) {
          logoImg.src = originalSrc;
        }
      }
    }
  });

  if (searchInput) {
    const lastSearch = sessionStorage.getItem('animeSearchQuery');
    if (lastSearch) {
      searchInput.value = lastSearch;
    }
  }
}

/**
 * Handle the search action
 */
function handleSearch() {
  const searchInput = document.getElementById('search-input');
  const searchForm = document.getElementById('search-form');
  const query = searchInput?.value?.trim();

  if (query) {
    showSearchLoadingSpinner();

    sessionStorage.setItem('animeSearchQuery', query);

    if (typeof navigate === 'function') {
      navigate('#/search');
    } else {
      window.location.hash = '#/search';
    }
    if (searchForm) {
      searchForm.classList.remove('expanded');
      document.body.classList.remove('search-active');

      const logoImg = document.querySelector('.logo-container img');
      if (logoImg) {
        const originalSrc = logoImg.getAttribute('data-original-src');
        if (originalSrc) {
          logoImg.src = originalSrc;
        }
      }

      const mainNav = document.querySelector('.main-nav');
      if (mainNav?.classList.contains('active') && window.innerWidth <= 768) {
        mainNav.style.opacity = '1';
        mainNav.style.visibility = 'visible';
      }
    }
  } else {
    alert('Please enter a search term');

    searchInput?.focus();
  }
}

/**
 * Show the loading spinner in the search input
 */
export function showSearchLoadingSpinner() {
  const searchInput = document.getElementById('search-input');
  const searchIcon = document.getElementById('search-icon');

  if (searchInput) {
    searchInput.disabled = true;
  }

  if (searchIcon) {
    searchIcon.innerHTML = '<div class="loading-spinner search-spinner"></div>';
    searchIcon.disabled = true;
  }
}

/**
 * Hide the loading spinner in the search input
 */
export function hideSearchLoadingSpinner() {
  const searchInput = document.getElementById('search-input');
  const searchIcon = document.getElementById('search-icon');

  if (searchInput) {
    searchInput.disabled = false;
  }

  if (searchIcon) {
    searchIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
      </svg>
    `;
    searchIcon.disabled = false;
  }
}

export function getSearchQuery() {
  return sessionStorage.getItem('animeSearchQuery') || '';
}

export function clearSearchQuery() {
  sessionStorage.removeItem('animeSearchQuery');
}
