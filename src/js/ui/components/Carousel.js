/**
 * Carousel component for displaying a rotating row of items.
 * Features:
 * - Auto rotation with smooth sliding animation
 * - Display multiple items simultaneously in a row
 * - Responsive layout - shows more or fewer items based on screen size
 * - Pause on hover
 * - Next/Previous navigation buttons
 * - Click to navigate to detail page
 * 
 * @module Carousel
 */

// Import AnimeCard and its utility functions
import AnimeCard, { 
  setupAnimeCardInteractivity, 
  isAnimeInMyList 
} from './AnimeCard.js';

/**
 * Creates and initializes a carousel
 * @param {HTMLElement} containerEl - The container element where the carousel will be placed
 * @param {Array} itemsArray - Array of items to display in the carousel
 * @returns {Object} - The carousel controller object
 */
export default function Carousel(containerEl, itemsArray) {
  // Validate inputs
  if (!containerEl || !Array.isArray(itemsArray) || itemsArray.length === 0) {
    console.error('Carousel requires a valid container and non-empty items array');
    return null;
  }  
  
  // Constants and state
  const ROTATION_INTERVAL = 5000; // 5 seconds
  const ITEM_WIDTH = '250px'; // Fixed width for carousel items
  let currentIndex = 0;
  let autoRotationTimer = null;
  let visibleItems = calculateVisibleItems();
  let isAnimating = false;
  
  // Create main carousel container
  const carousel = document.createElement('div');
  carousel.className = 'carousel';
  
  // Create carousel track for sliding items
  const track = document.createElement('div');
  track.className = 'carousel-track';
  
  // Create navigation controls
  const prevButton = createControlButton('prev', '❮', 'Previous');
  const nextButton = createControlButton('next', '❯', 'Next');
  
  // Add items to carousel track
  // Add original items first
  itemsArray.forEach((item, index) => {
    track.appendChild(createCarouselItem(item));
  });
  
  // Add clone items for infinite scrolling (repeat first set of items)
  for (let i = 0; i < Math.min(itemsArray.length, 5); i++) {
    track.appendChild(createCarouselItem(itemsArray[i], true));
  }
  
  // Assemble carousel structure
  carousel.appendChild(track);
  carousel.appendChild(prevButton);
  carousel.appendChild(nextButton);
  containerEl.appendChild(carousel);
  
  // Add carousel styles
  addCarouselStyles();
  
  // Set up event handlers
  setupEventHandlers();
  
  // Start auto-rotation
  startAutoRotation();
  
  // Return public API
  return {
    next: goToNext,
    previous: goToPrevious,
    goTo: (index) => goToSlide(index),
    getCurrentIndex: () => currentIndex,
    stop: stopAutoRotation,
    start: startAutoRotation,
    getElement: () => carousel
  };
  
  /**
   * Creates a carousel item from data using AnimeCard
   * @param {Object} item - The item data to display
   * @param {boolean} isClone - Whether this item is a clone for infinite scrolling
   * @returns {HTMLElement} - The carousel item element
   */
  function createCarouselItem(item, isClone = false) {
    const itemElement = document.createElement('div');
    itemElement.className = 'carousel-item';
    
    // Use AnimeCard to generate the HTML
    const animeCardHTML = AnimeCard(item);
    
    // Set the HTML content
    itemElement.innerHTML = animeCardHTML;
    
    // Set fixed width but let height be determined by content
    itemElement.style.width = ITEM_WIDTH;
    
    // Mark clones with data attribute for potential styling
    if (isClone) {
      itemElement.dataset.clone = "true";
    }
    
    return itemElement;
  }
  
  /**
   * Create a control button (prev/next)
   */
  function createControlButton(className, html, ariaLabel) {
    const button = document.createElement('button');
    button.className = `carousel-control ${className}`;
    button.innerHTML = html;
    button.setAttribute('aria-label', ariaLabel);
    return button;
  }
  
  /**
   * Set up event handlers for buttons and carousel
   */
  function setupEventHandlers() {
    // Navigation button clicks
    prevButton.addEventListener('click', (e) => {
      e.stopPropagation();
      goToPrevious();
      resetAutoRotation();
    });
    
    nextButton.addEventListener('click', (e) => {
      e.stopPropagation();
      goToNext();
      resetAutoRotation();
    });
    
    // Pause on hover
    carousel.addEventListener('mouseenter', stopAutoRotation);
    carousel.addEventListener('mouseleave', startAutoRotation);
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    // Add swipe support for touch devices
    let touchStartX = 0;
    let touchEndX = 0;
    
    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    carousel.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
      const swipeThreshold = 50;
      if (touchEndX < touchStartX - swipeThreshold) {
        goToNext(); // Swipe left
        resetAutoRotation();
      } else if (touchEndX > touchStartX + swipeThreshold) {
        goToPrevious(); // Swipe right
        resetAutoRotation();
      }
    }
  }
  
  /**
   * Calculate visible items based on screen width
   */
  function calculateVisibleItems() {
    // Since we're using fixed widths now, calculate how many items fit
    const containerWidth = containerEl.offsetWidth;
    // Use item width (including padding) to calculate how many fit
    const itemWidthWithPadding = parseInt(ITEM_WIDTH) + 24; // account for padding
    const visibleCount = Math.floor(containerWidth / itemWidthWithPadding) || 1;
    // Ensure at least 1 item is shown, and not more than 5
    return Math.max(1, Math.min(5, visibleCount));
  }
  
  /**
   * Go to a specific slide by index
   */
  function goToSlide(index) {
    if (isAnimating) return;
    isAnimating = true;
    
    // For infinite scroll, we use the actual index directly
    // No need to wrap around since we have duplicate items
    currentIndex = index;
      
    // Calculate and apply transform using pixel values
    const pixelOffset = index * parseInt(ITEM_WIDTH);
    track.style.transform = `translateX(-${pixelOffset}px)`;
    
    // Check if we're near the end (original items)
    const totalOriginalItems = itemsArray.length;
    
    if (index >= totalOriginalItems) {
      // We've reached the cloned items
      // After transition finishes, silently move back to the beginning
      setTimeout(() => {
        // Disable transition temporarily
        track.style.transition = 'none';
        
        // Calculate the equivalent position in the original items
        const newIndex = index % totalOriginalItems;
        
        // Update position silently
        currentIndex = newIndex;
        track.style.transform = `translateX(-${newIndex * parseInt(ITEM_WIDTH)}px)`;
        
        // Force reflow to apply changes immediately
        track.offsetHeight;
        
        // Re-enable transitions
        track.style.transition = 'transform 0.5s ease';
      }, 500);
    }
    
    // Reset animation lock after transition completes
    setTimeout(() => {
      isAnimating = false;
    }, 500); // Match transition duration from CSS
  }
  
  /**
   * Go to next slide
   */
  function goToNext() {
    // Always move forward by visible items
    const nextIndex = currentIndex + visibleItems;
    goToSlide(nextIndex);
  }
  
  /**
   * Go to previous slide
   */
  function goToPrevious() {
    if (currentIndex === 0) {
      // If at the beginning, silently move to end of original items
      track.style.transition = 'none';
      const lastOriginalIndex = itemsArray.length - visibleItems;
      currentIndex = lastOriginalIndex;
      track.style.transform = `translateX(-${lastOriginalIndex * parseInt(ITEM_WIDTH)}px)`;
      
      // Force reflow
      track.offsetHeight;
      
      // Re-enable transitions and move back by one group
      track.style.transition = 'transform 0.5s ease';
      setTimeout(() => {
        goToSlide(Math.max(0, currentIndex - visibleItems));
      }, 50);
    } else {
      // Normal case - just move back
      goToSlide(Math.max(0, currentIndex - visibleItems));
    }
  }
  
  /**
   * Update carousel when window is resized
   */
  function handleResize() {
    const previousVisibleItems = visibleItems;
    visibleItems = calculateVisibleItems();
    
    if (previousVisibleItems !== visibleItems) {
      // Reset to first position when layout changes
      goToSlide(0);
    }
  }
  
  /**
   * Start auto-rotation of carousel
   */
  function startAutoRotation() {
    if (autoRotationTimer) return;
    autoRotationTimer = setInterval(goToNext, ROTATION_INTERVAL);
  }
  
  /**
   * Stop auto-rotation of carousel
   */
  function stopAutoRotation() {
    if (autoRotationTimer) {
      clearInterval(autoRotationTimer);
      autoRotationTimer = null;
    }
  }
  
  /**
   * Reset auto-rotation timer
   */
  function resetAutoRotation() {
    stopAutoRotation();
    startAutoRotation();
  }
  
  /**
   * Add carousel styles to document
   */
  function addCarouselStyles() {
    if (document.getElementById('carousel-styles')) return;
    
    const styleSheet = document.createElement('style');
    styleSheet.id = 'carousel-styles';
    styleSheet.textContent = `
      .carousel {
        position: relative;
        width: 100%;
        overflow: hidden;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        margin: 20px 0;
        background-color: #f8f8f8;
      }
      
      .carousel-track {
        display: flex;
        transition: transform 0.5s ease;
      }
      
      .carousel-item {
        flex: 0 0 ${ITEM_WIDTH};
        padding: 12px;
        box-sizing: border-box;
        width: ${ITEM_WIDTH};
      }
      
      /* Ensure AnimeCard fills the carousel item */
      .carousel-item .anime-card {
        width: 100%;
        margin: 0;
        box-shadow: none;
      }
      
      /* Style overrides for AnimeCard inside carousel */
      .carousel-item .anime-card:hover {
        transform: translateY(-5px);
        transition: transform 0.3s ease;
      }
      
      .carousel-control {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.8);
        border: none;
        border-radius: 50%;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 2;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        transition: background-color 0.2s, transform 0.1s;
      }
      
      .carousel-control:hover {
        background: white;
        transform: translateY(-50%) scale(1.1);
      }
      
      .carousel-control:active {
        transform: translateY(-50%) scale(0.95);
      }
      
      .carousel-control.prev {
        left: 10px;
      }
      
      .carousel-control.next {
        right: 10px;
      }
      
      /* Responsive adjustments */
      @media (max-width: 992px) {
        .carousel-control {
          width: 32px;
          height: 32px;
          font-size: 18px;
        }
      }
      
      @media (max-width: 576px) {
        .carousel-item .anime-card:hover {
          transform: none;
        }
        
        .carousel-control {
          width: 30px;
          height: 30px;
          font-size: 16px;
        }
      }
    `;
    document.head.appendChild(styleSheet);
    
    // Calculate carousel track width based on items
    const trackWidth = itemsArray.length * parseInt(ITEM_WIDTH) + 'px';
    track.style.width = trackWidth;
  }
}
