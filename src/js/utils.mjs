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
    let basePath = "/";
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) {
        basePath = import.meta.env.BASE_URL;
      } else {
        basePath = "/wdd330_final_project/";
      }
    } catch (e) {
      console.warn("Could not access import.meta.env, using fallback base path:", e);
      basePath = "/wdd330_final_project/";
    }    console.log(`Using base path: ${basePath}`);
    let headerTemplate, footerTemplate;
    try {
      headerTemplate = await loadTemplate(`${basePath}partials/header.html`);
      footerTemplate = await loadTemplate(`${basePath}partials/footer.html`);
    } catch (e) {
      console.warn("Failed to load templates with base path, trying alternative paths:", e);
      try {
        headerTemplate = await loadTemplate("/wdd330_final_project/partials/header.html");
        footerTemplate = await loadTemplate("/wdd330_final_project/partials/footer.html");
      } catch (e2) {
        console.error("All attempts to load templates failed:", e2);
        headerTemplate = "<div>Header failed to load</div>";
        footerTemplate = "<div>Footer failed to load</div>";
      }
    }
    
    const headerElement = document.querySelector("#main-header");
    const footerElement = document.querySelector("#main-footer");

    if (headerElement && headerTemplate) {
      console.log("Rendering header template");
      renderWithTemplate(headerTemplate, headerElement);
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
      e.stopPropagation();
      mainNav.classList.toggle('active');
      menuToggle.classList.toggle('menu-active');
      
      const isExpanded = mainNav.classList.contains('active');
      menuToggle.setAttribute('aria-expanded', isExpanded);
      
      if (document.body.classList.contains('search-active') && mainNav.classList.contains('active')) {
        mainNav.style.opacity = '1';
        mainNav.style.visibility = 'visible';
        mainNav.style.pointerEvents = 'auto';
      }
    });
    
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

