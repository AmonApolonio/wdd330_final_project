/**
 * Initialize the search bar functionality
 */
export function initializeSearch() {
  const searchIcon = document.getElementById('search-icon');
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.querySelector('.main-nav');  // Toggle search bar on icon click
  if (searchIcon) {
    searchIcon.addEventListener('click', (e) => {
      e.preventDefault();
      
      // If form is expanded and there's text, perform search instead of collapsing
      if (searchForm.classList.contains('expanded') && searchInput?.value?.trim()) {
        handleSearch();
        return;
      }
      
      // Otherwise toggle the expanded state
      searchForm.classList.toggle('expanded');
      document.body.classList.toggle('search-active');
      
      // Toggle logo between text and icon versions
      const logoImg = document.querySelector('.logo-container img');
      if (logoImg) {
        if (searchForm.classList.contains('expanded')) {
          logoImg.setAttribute('data-original-src', logoImg.src);
          logoImg.src = '/images/logo.svg';
        } else {
          // Restore original logo if it was saved
          const originalSrc = logoImg.getAttribute('data-original-src');
          if (originalSrc) {
            logoImg.src = originalSrc;
          }
        }
      }
      
      // If expanding the search bar, focus the input
      if (searchForm.classList.contains('expanded')) {
        setTimeout(() => searchInput.focus(), 100);
      }
    });
  }
  // Menu toggle is now handled in initHamburgerMenu in utils.mjs
  
  // Handle form submission
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSearch();
      
      // Hide the search bar after submission
      setTimeout(() => {
        searchForm.classList.remove('expanded');
      }, 300);
    });
  }  // Handle click outside to close search
  document.addEventListener('click', (e) => {
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    const isClickInside = searchForm?.contains(e.target) || searchIcon?.contains(e.target);
    const isMobileMenuClick = menuToggle?.contains(e.target) || 
                             (mainNav?.classList.contains('active') && mainNav?.contains(e.target));
    
    // Don't close search when clicking on mobile menu toggle or active mobile menu
    if (!isClickInside && !isMobileMenuClick && searchForm?.classList.contains('expanded')) {
      searchForm.classList.remove('expanded');
      document.body.classList.remove('search-active');
      
      // Restore the original logo
      const logoImg = document.querySelector('.logo-container img');
      if (logoImg) {
        const originalSrc = logoImg.getAttribute('data-original-src');
        if (originalSrc) {
          logoImg.src = originalSrc;
        }
      }
    }
  });
  
  // Set the input value to the last search if it exists
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
    // Show loading spinner in the search input
    showSearchLoadingSpinner();
    
    // Store the search query in sessionStorage
    sessionStorage.setItem('animeSearchQuery', query);
    
    // Navigate to the search page
    if (typeof navigate === 'function') {
      navigate('#/search');
    } else {
      window.location.hash = '#/search';
    }
    // Hide search form after search is initiated
    if (searchForm) {
      searchForm.classList.remove('expanded');
      document.body.classList.remove('search-active');
      
      // Restore the original logo
      const logoImg = document.querySelector('.logo-container img');
      if (logoImg) {
        const originalSrc = logoImg.getAttribute('data-original-src');
        if (originalSrc) {
          logoImg.src = originalSrc;
        }
      }
      
      // Don't interfere with mobile menu state when performing search
      const mainNav = document.querySelector('.main-nav');
      if (mainNav?.classList.contains('active') && window.innerWidth <= 768) {
        mainNav.style.opacity = '1';
        mainNav.style.visibility = 'visible';
      }
    }
  } else {
    // Alert user if search is empty
    alert('Please enter a search term');
    
    // Focus back on input
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
    // Disable input during search
    searchInput.disabled = true;
  }
  
  // Show loading state on the search icon
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
    // Re-enable input
    searchInput.disabled = false;
  }
  
  // Restore the search icon
  if (searchIcon) {
    searchIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
      </svg>
    `;
    searchIcon.disabled = false;
  }
}

// Export a function that can be called by the search view to get the query
export function getSearchQuery() {
  return sessionStorage.getItem('animeSearchQuery') || '';
}

// Clear the search query when navigating away from search
export function clearSearchQuery() {
  sessionStorage.removeItem('animeSearchQuery');
}
