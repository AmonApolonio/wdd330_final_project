const routes = {
  '#/home': () => renderHome(),
  '#/search': () => renderSearch(),
  '#/detail/:id': (id) => renderDetail(id),
  '#/my-list': () => renderMyList(),
  '#/settings': () => renderSettings(),
};

function parseRoute(hash) {
  if (hash.startsWith('#/detail/')) {
    const id = hash.split('/')[2];
    return { route: '#/detail/:id', param: id };
  }
  return { route: hash, param: null };
}

function router() {
  const { route, param } = parseRoute(window.location.hash);
  if (routes[route]) {
    routes[route](param);
  } else {
    renderHome();
  }
}

function handleRoute() {
  const hash = window.location.hash;
  if (hash.startsWith('#/detail/')) {
    const id = hash.split('/')[2];
    if (typeof DetailView !== 'undefined' && typeof DetailView.render === 'function') {
      DetailView.render(id);
    } else {
      renderDetail(id);
    }
    return;
  }
  switch (hash) {
    case '#/home':
      if (typeof HomeView !== 'undefined' && typeof HomeView.render === 'function') {
        HomeView.render();
      } else {
        renderHome();
      }
      break;
    case '#/search':
      if (typeof SearchView !== 'undefined' && typeof SearchView.render === 'function') {
        SearchView.render();
      } else {
        renderSearch();
      }
      break;
    case '#/my-list':
      if (typeof MyListView !== 'undefined' && typeof MyListView.render === 'function') {
        MyListView.render();
      } else {
        renderMyList();
      }
      break;
    case '#/settings':
      if (typeof SettingsView !== 'undefined' && typeof SettingsView.render === 'function') {
        SettingsView.render();
      } else {
        renderSettings();
      }
      break;
    default:
      if (typeof HomeView !== 'undefined' && typeof HomeView.render === 'function') {
        HomeView.render();
      } else {
        renderHome();
      }
  }
}

function navigate(hash) {
  if (window.location.hash !== hash) {
    window.location.hash = hash;
  } else {
    handleRoute();
  }
}

window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', handleRoute);

function renderHome() { /* ... */ }
function renderSearch() { /* ... */ }
function renderDetail(id) { /* ... */ }
function renderMyList() { /* ... */ }
function renderSettings() { /* ... */ }
