
/**
 * Initialize the search bar functionality
 */
export function initializeSearch() {
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  
  // Handle search button click
  if (searchButton) {
    searchButton.addEventListener('click', handleSearch);
  }
  
  // Handle enter key press in search input
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    });
    
    // Set the input value to the last search if it exists
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
  const query = searchInput?.value?.trim();
  
  if (query) {
    // Store the search query in sessionStorage
    sessionStorage.setItem('animeSearchQuery', query);
    
    // Navigate to the search page
    if (typeof navigate === 'function') {
      navigate('#/search');
    } else {
      window.location.hash = '#/search';
    }
  } else {
    // Alert user if search is empty
    alert('Please enter a search term');
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
