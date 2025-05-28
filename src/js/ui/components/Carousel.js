/**
 * Carousel component for displaying a rotating set of items.
 * Features:
 * - Auto rotation every 5 seconds
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
  // Ensure we have valid parameters
  if (!containerEl || !Array.isArray(itemsArray) || itemsArray.length === 0) {
    console.error('Carousel requires a valid container and non-empty items array');
    return null;
  }

  // Internal state
  let currentIndex = 0;
  let intervalId = null;
  const ROTATION_INTERVAL = 5000; // 5 seconds
  
  // Create carousel structure
  const carouselEl = document.createElement('div');
  carouselEl.className = 'carousel';
  
  const carouselInner = document.createElement('div');
  carouselInner.className = 'carousel-inner';
  
  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-control prev';
  prevBtn.innerHTML = '&lsaquo;';
  prevBtn.setAttribute('aria-label', 'Previous slide');
  
  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-control next';
  nextBtn.innerHTML = '&rsaquo;';
  nextBtn.setAttribute('aria-label', 'Next slide');
  
  const indicators = document.createElement('div');
  indicators.className = 'carousel-indicators';
  
  // Build carousel items and indicators
  itemsArray.forEach((item, index) => {
    // Create carousel item
    const itemEl = document.createElement('div');
    itemEl.className = 'carousel-item';
    if (index === 0) itemEl.classList.add('active');
      // Create image
    const img = document.createElement('img');
    // Try to get the best quality image from various possible sources in the API response
    img.src = item.image || 
              item.img_url || 
              item.images?.jpg?.large_image_url || 
              item.images?.jpg?.image_url || 
              item.images?.webp?.large_image_url || 
              item.images?.webp?.image_url || 
              `https://via.placeholder.com/800x450?text=${encodeURIComponent(item.title || 'No Image')}`;
    img.alt = item.title || 'Carousel image';
      // Create title overlay
    const titleOverlay = document.createElement('div');
    titleOverlay.className = 'carousel-title-overlay';
    
    // Find the best title to display (english title preferred if available)
    const displayTitle = item.title_english || item.title || '';
    
    // Add rating if available
    let overlayContent = displayTitle;
    if (item.score) {
      overlayContent += `<div class="carousel-rating">★ ${item.score}</div>`;
      titleOverlay.innerHTML = overlayContent;
    } else {
      titleOverlay.textContent = overlayContent;
    }
    
    // Make item clickable
    itemEl.addEventListener('click', () => {
      if (item.mal_id || item.id) {
        // Navigate to detail page
        window.location.hash = `#/detail/${item.mal_id || item.id}`;
      }
    });
    
    // Add to carousel
    itemEl.appendChild(img);
    itemEl.appendChild(titleOverlay);
    carouselInner.appendChild(itemEl);
    
    // Create indicator
    const indicator = document.createElement('span');
    indicator.className = 'carousel-indicator';
    if (index === 0) indicator.classList.add('active');
    indicator.addEventListener('click', () => {
      showItem(index);
    });
    indicators.appendChild(indicator);
  });
  
  // Assemble carousel
  carouselEl.appendChild(carouselInner);
  carouselEl.appendChild(prevBtn);
  carouselEl.appendChild(nextBtn);
  carouselEl.appendChild(indicators);
  containerEl.appendChild(carouselEl);
  
  // Add CSS if not already present
  if (!document.getElementById('carousel-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'carousel-styles';
    styleSheet.textContent = `
      .carousel {
        position: relative;
        width: 100%;
        max-width: 100%;
        height: 400px;
        overflow: hidden;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        margin: 20px 0;
      }
      
      .carousel-inner {
        position: relative;
        width: 100%;
        height: 100%;
      }
      
      .carousel-item {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        transition: opacity 0.5s ease-in-out;
        cursor: pointer;
        overflow: hidden;
      }
      
      .carousel-item.active {
        opacity: 1;
        z-index: 1;
      }
      
      .carousel-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
        .carousel-title-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 10px 15px;
        font-size: 1.1rem;
        font-weight: bold;
        text-align: center;
      }
      
      .carousel-rating {
        display: block;
        font-size: 0.9rem;
        color: #ffdd00;
        margin-top: 5px;
      }
      
      .carousel-control {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.5);
        border: none;
        border-radius: 50%;
        font-size: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 2;
        transition: background-color 0.3s;
      }
      
      .carousel-control:hover {
        background: rgba(255, 255, 255, 0.8);
      }
      
      .carousel-control.prev {
        left: 10px;
      }
      
      .carousel-control.next {
        right: 10px;
      }
      
      .carousel-indicators {
        position: absolute;
        bottom: 50px;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        gap: 8px;
        z-index: 2;
      }
      
      .carousel-indicator {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        cursor: pointer;
        transition: background-color 0.3s;
      }
      
      .carousel-indicator.active {
        background: white;
      }
      
      @media (max-width: 768px) {
        .carousel {
          height: 300px;
        }
        
        .carousel-title-overlay {
          font-size: 0.9rem;
        }
      }
    `;
    document.head.appendChild(styleSheet);
  }
  
  // Carousel functions
  function showItem(index) {
    // Ensure index is within bounds
    if (index < 0) {
      index = itemsArray.length - 1;
    } else if (index >= itemsArray.length) {
      index = 0;
    }
    
    // Update current index
    currentIndex = index;
    
    // Update carousel items
    const items = carouselInner.querySelectorAll('.carousel-item');
    items.forEach((item, i) => {
      if (i === index) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    
    // Update indicators
    const dots = indicators.querySelectorAll('.carousel-indicator');
    dots.forEach((dot, i) => {
      if (i === index) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }
  
  function startAutoRotation() {
    // Clear any existing interval
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    // Set new interval
    intervalId = setInterval(() => {
      showItem(currentIndex + 1);
    }, ROTATION_INTERVAL);
  }
  
  function stopAutoRotation() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
  
  // Event listeners
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showItem(currentIndex - 1);
    stopAutoRotation(); // Stop auto rotation momentarily
    startAutoRotation(); // Restart auto rotation
  });
  
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showItem(currentIndex + 1);
    stopAutoRotation(); // Stop auto rotation momentarily
    startAutoRotation(); // Restart auto rotation
  });
  
  // Pause on hover
  carouselEl.addEventListener('mouseenter', () => {
    stopAutoRotation();
  });
  
  carouselEl.addEventListener('mouseleave', () => {
    startAutoRotation();
  });
  
  // Initialize auto rotation
  startAutoRotation();
  
  // Public API
  return {
    next: () => showItem(currentIndex + 1),
    previous: () => showItem(currentIndex - 1),
    goTo: (index) => showItem(index),
    getCurrentIndex: () => currentIndex,
    stop: () => stopAutoRotation(),
    start: () => startAutoRotation(),
    getElement: () => carouselEl
  };
}
