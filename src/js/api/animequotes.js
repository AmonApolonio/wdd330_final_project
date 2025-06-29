// Anime Quotes API Wrapper
// Based on documentation from https://github.com/4rnv/QuotesAPI

import { fetchJSON } from "../fetchWrapper.js";
import { withCache } from "../cache.js";

const API_BASE_URL = "https://yurippe.vercel.app/api";

const CACHE_DURATION = {
  DEFAULT: 60 * 60 * 1000,
  SHORT: 10 * 60 * 1000,
  LONG: 24 * 60 * 60 * 1000
};

/**
 * @param {Object} options - Filter options
 * @param {string|string[]} [options.character] - Character name(s)
 * @param {string|string[]} [options.show] - Anime show name(s)
 * @param {boolean} [options.random] - Whether to get a random quote
 * @param {number} [options.page] - Page number for pagination
 */
export function fetchQuotes(options = {}) {
  const { character, show, random, page } = options;

  const endpoint = '/quotes';
  const queryParams = [];

  if (character) {
    if (Array.isArray(character)) {
      queryParams.push(`character=${encodeURIComponent(character.join(','))}`);
    } else {
      queryParams.push(`character=${encodeURIComponent(character)}`);
    }
  }

  if (show) {
    if (Array.isArray(show)) {
      queryParams.push(`show=${encodeURIComponent(show.join(','))}`);
    } else {
      queryParams.push(`show=${encodeURIComponent(show)}`);
    }
  }
  if (random) {
    queryParams.push(`random=1`);
  }
  if (!random && page) {
    queryParams.push(`page=${page}`);
  }
  let url = `${API_BASE_URL}${endpoint}`;
  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`;
  }

  return fetchJSON(url);
}

/**
 * Get a random quote
 * @returns {Promise<Object>} - A random quote
 */
function _getRandomQuote() {
  return fetchQuotes({ random: true }).then(response => {
    if (Array.isArray(response)) {
      return response[0];
    } else if (response && response.data && Array.isArray(response.data)) {
      return response.data[0];
    }
    return response;
  });
}

export const getRandomQuote = withCache(
  _getRandomQuote,
  () => `random_quote_${Date.now().toString().slice(0, -4)}`,
  CACHE_DURATION.SHORT
);

/**
 * Get a random quote by character
 * @param {string} character - Character name
 * @returns {Promise<Object>} - A random quote by the character
 */
function _getRandomQuoteByCharacter(character) {
  return fetchQuotes({ random: true, character }).then(response => {
    if (Array.isArray(response)) {
      return response[0];
    } else if (response && response.data && Array.isArray(response.data)) {
      return response.data[0];
    }
    return response;
  });
}

export const getRandomQuoteByCharacter = withCache(
  _getRandomQuoteByCharacter,
  (character) => `random_quote_character_${character}_${Date.now().toString().slice(0, -4)}`,
  CACHE_DURATION.SHORT
);

/**
 * Get a random quote from an anime
 * @param {string} show - Anime show name
 * @returns {Promise<Object>} - A random quote from the show
 */
function _getRandomQuoteByAnime(show) {
  return fetchQuotes({ random: true, show }).then(response => {
    if (Array.isArray(response)) {
      return response[0];
    } else if (response && response.data && Array.isArray(response.data)) {
      return response.data[0];
    }
    return response;
  });
}

export const getRandomQuoteByAnime = withCache(
  _getRandomQuoteByAnime,
  (show) => `random_quote_anime_${show}_${Date.now().toString().slice(0, -4)}`,
  CACHE_DURATION.SHORT
);

/**
 * Search quotes by character
 * @param {string|string[]} character - Character name(s)
 * @param {number} page - Page number for pagination
 * @returns {Promise<Object>} - Quotes by the character(s)
 */
function _searchQuotesByCharacter(character, page = 1) {
  return fetchQuotes({ character, page });
}

export const searchQuotesByCharacter = withCache(
  _searchQuotesByCharacter,
  (character, page) => `quotes_character_${character}_page_${page}`,
  CACHE_DURATION.DEFAULT
);

/**
 * Search quotes by anime
 * @param {string|string[]} show - Anime show name(s)
 * @returns {Promise<Object>} - Quotes from the anime(s)
 */
function _searchQuotesByAnime(show) {
  return fetchQuotes({ show });
}

export const searchQuotesByAnime = withCache(
  _searchQuotesByAnime,
  (show) => `quotes_anime_${show}`,
  CACHE_DURATION.DEFAULT
);

/**
 * Get all quotes
 * @param {number} page - Page number for pagination
 * @returns {Promise<Object>} - All quotes for the given page
 */
function _getAllQuotes(page = 1) {
  return fetchQuotes({ page });
}

export const getAllQuotes = withCache(
  _getAllQuotes,
  (page) => `all_quotes_page_${page}`,
  CACHE_DURATION.DEFAULT
);
