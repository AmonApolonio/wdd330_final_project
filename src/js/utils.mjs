export function renderWithTemplate(template, parentElement, data, callback, position = "afterbegin") {
  parentElement.insertAdjacentHTML(position, template);
  if (callback) {
    callback(data);
  }
}

export async function loadTemplate(path) {
  try {
    console.log(`Attempting to fetch template from: ${path}`);
    const res = await fetch(path);
    
    if (!res.ok) {
      console.error(`Failed to load template: ${path}, Status: ${res.status}`);
      throw new Error(`Failed to load template: ${path}, Status: ${res.status}`);
    }
    
    const template = await res.text();
    console.log(`Successfully loaded template from: ${path}`);
    return template;
  } catch (error) {
    console.error(`Error loading template from ${path}:`, error);
    throw error;
  }
}

export async function loadHeaderFooter() {
  try {
    // Create base path that works both in development and production
    const basePath = (import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : "/wdd330_final_project/";
    console.log(`Using base path: ${basePath}`);
      // Load header template
    const headerTemplate = await loadTemplate(`${basePath}partials/header.html`);
    
    // Load footer template
    const footerTemplate = await loadTemplate(`${basePath}partials/footer.html`);
    
    const headerElement = document.querySelector("#main-header");
    const footerElement = document.querySelector("#main-footer");

    if (headerElement && headerTemplate) {
      console.log("Rendering header template");
      renderWithTemplate(headerTemplate, headerElement);
      // Initialize hamburger menu functionality after header is loaded
      initHamburgerMenu();
    } else {
      console.error("Could not render header template:", 
                    !headerElement ? "Header element not found" : "Header template not loaded");
    }
    
    if (footerElement && footerTemplate) {
      console.log("Rendering footer template");
      renderWithTemplate(footerTemplate, footerElement);
    } else {
      console.error("Could not render footer template:", 
                    !footerElement ? "Footer element not found" : "Footer template not loaded");
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error loading header/footer:", error);
    return { success: false, error };
  }
}

function initHamburgerMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent click from closing search
      mainNav.classList.toggle('active');
      menuToggle.classList.toggle('menu-active');
      
      // Update aria-expanded attribute for accessibility
      const isExpanded = mainNav.classList.contains('active');
      menuToggle.setAttribute('aria-expanded', isExpanded);
      
      // If search is active, ensure mobile menu is still visible
      if (document.body.classList.contains('search-active') && mainNav.classList.contains('active')) {
        mainNav.style.opacity = '1';
        mainNav.style.visibility = 'visible';
        mainNav.style.pointerEvents = 'auto';
      }
    });
    
    // Close menu when a link is clicked
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          mainNav.classList.remove('active');
          menuToggle.classList.remove('menu-active');
          menuToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }
}

