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
  }  // Constants and state
  const ROTATION_INTERVAL = 5000; // 5 seconds
  const IMAGE_HEIGHT = '350px'; // Fixed height for all images
  const IMAGE_WIDTH = '225px'; // Fixed width for all images
  const ITEM_HEIGHT = '450px'; // Fixed height for carousel items
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
   * Creates a carousel item from data
   * @param {Object} item - The item data to display
   * @param {boolean} isClone - Whether this item is a clone for infinite scrolling
   * @returns {HTMLElement} - The carousel item element
   */
  function createCarouselItem(item, isClone = false) {
    const itemElement = document.createElement('div');
    itemElement.className = 'carousel-item';    // Create image container with fixed height and width
    const imageContainer = document.createElement('div');
    imageContainer.className = 'carousel-image-container';
    imageContainer.style.height = IMAGE_HEIGHT;
    imageContainer.style.width = IMAGE_WIDTH;
    
    // Add loading spinner
    const spinner = document.createElement('div');
    spinner.className = 'carousel-spinner';
    imageContainer.appendChild(spinner);    // Create and configure image
    const image = document.createElement('img');
    image.loading = 'lazy';
    image.alt = item.title || 'Carousel image';
    image.style.height = IMAGE_HEIGHT;
    image.style.width = IMAGE_WIDTH;
    
    // Find the best available image URL
    const imageUrl = item.images?.jpg?.large_image_url || 
                     item.images?.jpg?.image_url || 
                     item.images?.webp?.large_image_url || 
                     item.images?.webp?.image_url || 
                     item.image || 
                     item.img_url || 
                     `https://via.placeholder.com/225x350?text=${encodeURIComponent(item.title || 'No Image')}`;
    
    // Set image events
    image.onerror = () => {
      image.src = `https://via.placeholder.com/225x350?text=${encodeURIComponent(item.title || 'No Image')}`;
      spinner.style.display = 'none';
    };
    
    image.onload = () => {
      image.classList.add('loaded');
      spinner.style.display = 'none';
    };
    
    // Assign source last to trigger loading
    image.src = imageUrl;
    imageContainer.appendChild(image);
    
    // Create title and rating
    const titleElement = document.createElement('div');
    titleElement.className = 'carousel-title';
    
    const title = item.title_english || item.title || 'No Title';
    
    if (item.score) {
      titleElement.innerHTML = `
        ${title}
        <div class="carousel-rating">★ ${item.score}</div>
      `;
    } else {
      titleElement.textContent = title;
    }
    
    // Make item clickable if it has an ID
    if (item.mal_id || item.id) {
      itemElement.addEventListener('click', () => {
        window.location.hash = `#/detail/${item.mal_id || item.id}`;
      });
    }    // Set fixed height and width for the item element
    itemElement.style.height = ITEM_HEIGHT;    itemElement.style.width = ITEM_WIDTH;
    
    // Mark clones with data attribute for potential styling or identification
    if (isClone) {
      itemElement.dataset.clone = "true";
    }
    
    // Assemble item
    itemElement.appendChild(imageContainer);
    itemElement.appendChild(titleElement);
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
    styleSheet.textContent = `      .carousel {
        position: relative;
        width: 100%;
        overflow: hidden;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        margin: 20px 0;
        background-color: #f8f8f8;
        height: ${ITEM_HEIGHT} 
        /* Width remains 100% to fill container, but content inside has fixed widths */
      }.carousel-track {
        display: flex;
        transition: transform 0.5s ease;
        height: ${ITEM_HEIGHT};
        /* Width will be set dynamically in JS based on number of items */
      }.carousel-item {
        flex: 0 0 ${ITEM_WIDTH};
        padding: 12px;
        box-sizing: border-box;
        cursor: pointer;
        transition: transform 0.3s ease;
        height: ${ITEM_HEIGHT};
        width: ${ITEM_WIDTH};
      }
      
      .carousel-item:hover {
        transform: translateY(-5px);
      }      .carousel-image-container {
        position: relative;
        overflow: hidden;
        border-radius: 6px;
        background-color: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        height: ${IMAGE_HEIGHT};
        width: ${IMAGE_WIDTH};
        margin: 0 auto;
      }      .carousel-item img {
        width: ${IMAGE_WIDTH};
        height: ${IMAGE_HEIGHT};
        object-fit: cover;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .carousel-item img.loaded {
        opacity: 1;
      }
      
      .carousel-spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 30px;
        height: 30px;
        border: 3px solid rgba(0, 0, 0, 0.1);
        border-top-color: #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        to { transform: translate(-50%, -50%) rotate(360deg); }
      }
        .carousel-title {
        margin-top: 12px;
        font-size: 0.95rem;
        font-weight: bold;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: ${IMAGE_WIDTH};
        margin-left: auto;
        margin-right: auto;
      }
      
      .carousel-rating {
        font-size: 0.85rem;
        color: #f5c518;
        margin-top: 4px;
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
        /* Item clones styling can be added if desired */
      [data-clone="true"] {
        /* You could style clones differently if needed */
      }
        /* Responsive adjustments */
      @media (max-width: 992px) {
        /* Keep consistent width regardless of screen size */
        .carousel-control {
          width: 32px;
          height: 32px;
          font-size: 18px;
        }
      }
      
      @media (max-width: 576px) {
        .carousel-item:hover {
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
