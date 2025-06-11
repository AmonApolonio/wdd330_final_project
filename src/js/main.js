import { loadHeaderFooter } from "./utils.mjs";
import "./router.js";
import { initializeSearch } from "./search.js";
import { fetchJSON } from "./fetchWrapper.js";

import "./views/HomeView.js";
import "./views/SearchView.js";
import "./views/DetailView.js";
import "./views/MyListView.js";
import "./views/QuotesView.js";

window.fetchJSON = fetchJSON;

async function init() {
  await loadHeaderFooter();
  initializeSearch();

  setTimeout(() => {
    console.log("Initializing router with HomeView defined:", !!window.HomeView);
    console.log("App element exists:", !!document.getElementById("app"));

    if (window.location.hash) {
      window.dispatchEvent(new Event('hashchange'));
    } else {
      window.location.hash = '#/home';
    }
  }, 100);
}

init();
