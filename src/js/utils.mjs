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
  const headerTemplate = await loadTemplate("/partials/header.html");
  const footerTemplate = await loadTemplate("/partials/footer.html");

  const headerElement = document.querySelector("#main-header");
  const footerElement = document.querySelector("#main-footer");

  if (headerElement) {
    renderWithTemplate(headerTemplate, headerElement);
  }
  if (footerElement) {
    renderWithTemplate(footerTemplate, footerElement);
  }
}

