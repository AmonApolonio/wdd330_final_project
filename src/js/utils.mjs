export function renderWithTemplate(template, parentElement, data, callback, position = "afterbegin") {
  parentElement.insertAdjacentHTML(position, template);
  if (callback) {
    callback(data);
  }
}

export async function loadTemplate(path) {
  const res = await fetch(path);
  const template = await res.text();
  return template;
}

export async function loadHeaderFooter() {
  try {
    const headerTemplate = await loadTemplate("./public/partials/header.html");
    const footerTemplate = await loadTemplate("./public/partials/footer.html");

    const headerElement = document.querySelector("#main-header");
    const footerElement = document.querySelector("#main-footer");

    if (headerElement) {
      renderWithTemplate(headerTemplate, headerElement);
      // Initialize hamburger menu functionality after header is loaded
      initHamburgerMenu();
    }
    if (footerElement) {
      renderWithTemplate(footerTemplate, footerElement);
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

