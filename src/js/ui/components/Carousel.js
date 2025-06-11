import AnimeCard from './AnimeCard.js';

/**
 * Creates and initializes a carousel
 * @param {HTMLElement} containerEl - The container element where the carousel will be placed
 * @param {Array} itemsArray - Array of items to display in the carousel
 * @returns {Object} - The carousel controller object
 */
export default function Carousel(containerEl, itemsArray) {
  if (!containerEl || !Array.isArray(itemsArray) || itemsArray.length === 0) {
    console.error('Carousel requires a valid container and non-empty items array');
    return null;
  }

  const ROTATION_INTERVAL = 5000;
  const ITEM_WIDTH = '250px';
  let currentIndex = 0;
  let autoRotationTimer = null;
  let visibleItems = calculateVisibleItems();
  let isAnimating = false;
  const carousel = document.createElement('div');
  carousel.className = 'carousel';
  const track = document.createElement('div');
  track.className = 'carousel-track';
  const prevButton = createControlButton('prev', '❮', 'Previous');
  const nextButton = createControlButton('next', '❯', 'Next');
  itemsArray.forEach((item, index) => {
    track.appendChild(createCarouselItem(item));
  });
  for (let i = 0; i < Math.min(itemsArray.length, 5); i++) {
    track.appendChild(createCarouselItem(itemsArray[i], true));
  }
  carousel.appendChild(track);
  carousel.appendChild(prevButton);
  carousel.appendChild(nextButton);
  containerEl.appendChild(carousel);
  addCarouselStyles();

  setupEventHandlers();
  startAutoRotation();
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

    const animeCardHTML = AnimeCard(item);
    itemElement.innerHTML = animeCardHTML;
    itemElement.style.width = ITEM_WIDTH;

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

    carousel.addEventListener('mouseenter', stopAutoRotation);
    carousel.addEventListener('mouseleave', startAutoRotation);

    window.addEventListener('resize', handleResize);

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
        goToNext();
        resetAutoRotation();
      } else if (touchEndX > touchStartX + swipeThreshold) {
        goToPrevious();
        resetAutoRotation();
      }
    }
  }

  /**
   * Calculate visible items based on screen width
   */
  function calculateVisibleItems() {
    const containerWidth = containerEl.offsetWidth;
    const itemWidthWithPadding = parseInt(ITEM_WIDTH) + 24;
    const visibleCount = Math.floor(containerWidth / itemWidthWithPadding) || 1;
    return Math.max(1, Math.min(5, visibleCount));
  }

  /**
   * Go to a specific slide by index
   */
  function goToSlide(index) {
    if (isAnimating) return;
    isAnimating = true;

    currentIndex = index;

    const pixelOffset = index * parseInt(ITEM_WIDTH);
    track.style.transform = `translateX(-${pixelOffset}px)`;

    const totalOriginalItems = itemsArray.length;

    if (index >= totalOriginalItems) {
      setTimeout(() => {
        track.style.transition = 'none';

        const newIndex = index % totalOriginalItems;

        currentIndex = newIndex;
        track.style.transform = `translateX(-${newIndex * parseInt(ITEM_WIDTH)}px)`;

        track.offsetHeight;

        track.style.transition = 'transform 0.5s ease';
      }, 500);
    }

    setTimeout(() => {
      isAnimating = false;
    }, 500);
  }

  /**
   * Go to next slide
   */
  function goToNext() {
    const nextIndex = currentIndex + visibleItems;
    goToSlide(nextIndex);
  }

  /**
   * Go to previous slide
   */
  function goToPrevious() {
    if (currentIndex === 0) {
      track.style.transition = 'none';
      const lastOriginalIndex = itemsArray.length - visibleItems;
      currentIndex = lastOriginalIndex;
      track.style.transform = `translateX(-${lastOriginalIndex * parseInt(ITEM_WIDTH)}px)`;

      track.offsetHeight;

      track.style.transition = 'transform 0.5s ease';
      setTimeout(() => {
        goToSlide(Math.max(0, currentIndex - visibleItems));
      }, 50);
    } else {
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
 * Set up carousel track width
 */
  function addCarouselStyles() {
    const trackWidth = itemsArray.length * parseInt(ITEM_WIDTH) + 'px';
    track.style.width = trackWidth;

    document.documentElement.style.setProperty('--carousel-item-width', ITEM_WIDTH);
  }
}
