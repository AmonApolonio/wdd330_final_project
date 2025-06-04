// Anime Quotes API Wrapper
// Based on documentation from https://github.com/4rnv/QuotesAPI

import { fetchJSON } from "../fetchWrapper.js";
import { withCache } from "../cache.js";

const API_BASE_URL = "https://yurippe.vercel.app/api";

// Configure cache durations (in milliseconds)
const CACHE_DURATION = {
  DEFAULT: 60 * 60 * 1000, // 1 hour
  SHORT: 10 * 60 * 1000,   // 10 minutes
  LONG: 24 * 60 * 60 * 1000 // 24 hours
};

/**
 * Fetch quotes with optional filters
 * @param {Object} options - Filter options
 * @param {string|string[]} [options.character] - Character name(s)
 * @param {string|string[]} [options.show] - Anime show name(s)
 * @param {boolean} [options.random] - Whether to get a random quote (number of quotes to return)
 * @param {number} [options.page] - Page number for pagination
 * @returns {Promise<Object>} - The quotes data
 */
export function fetchQuotes(options = {}) {
  const { character, show, random, page } = options;
  
  // Build the endpoint path (this API uses query parameters for everything)
  const endpoint = '/quotes';
  
  // Build query parameters
  const queryParams = [];
  
  if (character) {
    // Handle arrays for multiple characters
    if (Array.isArray(character)) {
      queryParams.push(`character=${encodeURIComponent(character.join(','))}`);
    } else {
      queryParams.push(`character=${encodeURIComponent(character)}`);
    }
  }
  
  if (show) {
    // Handle arrays for multiple shows
    if (Array.isArray(show)) {
      queryParams.push(`show=${encodeURIComponent(show.join(','))}`);
    } else {
      queryParams.push(`show=${encodeURIComponent(show)}`);
    }
  }
  
  // Handle random quotes
  if (random) {
    // For this API, random=1 means get 1 random quote
    queryParams.push(`random=1`);
  }
  
  // Add pagination for non-random quotes (if supported by the API)
  if (!random && page) {
    queryParams.push(`page=${page}`);
  }
  
  // Build the full URL
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
  return fetchQuotes({ random: true });
}

// Random quotes are cached for a short time only
export const getRandomQuote = withCache(
  _getRandomQuote,
  () => `random_quote_${Date.now().toString().slice(0, -4)}`, // Cache key changes every 10 seconds
  CACHE_DURATION.SHORT
);

/**
 * Get a random quote by character
 * @param {string} character - Character name
 * @returns {Promise<Object>} - A random quote by the character
 */
function _getRandomQuoteByCharacter(character) {
  return fetchQuotes({ random: true, character });
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
  return fetchQuotes({ random: true, show });
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
