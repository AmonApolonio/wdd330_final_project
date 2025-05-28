// Jikan API Wrapper
// Based on documentation from https://docs.api.jikan.moe/

import { fetchJSON } from "../fetchWrapper.js";

const API_BASE_URL = "https://api.jikan.moe";
const API_VERSION = "v4";

/**
 * Search for anime based on a query string
 * @param {string} query - The search query
 * @param {number} page - The page number for pagination (default: 1)
 * @returns {Promise<Object>} - The search results
 */
export function searchAnime(query, page = 1) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/anime?q=${encodeURIComponent(query)}&page=${page}`);
}

/**
 * Get currently airing anime from the current season
 * @returns {Promise<Object>} - The current season's anime
 */
export function getSeasonsNow() {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/seasons/now`);
}

/**
 * Get anime from a specific season and year
 * @param {number} year - The year
 * @param {string} season - The season (winter, spring, summer, fall)
 * @returns {Promise<Object>} - The specified season's anime
 */
export function getSeason(year, season) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/seasons/${year}/${season}`);
}

/**
 * Get a random anime
 * @returns {Promise<Object>} - A random anime
 */
export function getRandomAnime() {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/random/anime`);
}

/**
 * Get full details about a specific anime
 * @param {number|string} id - The anime ID
 * @returns {Promise<Object>} - Detailed information about the anime
 */
export function getAnimeFull(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/anime/${id}/full`);
}

/**
 * Get top anime based on different filters
 * @param {Object} options - Query parameters
 * @param {string} options.type - Type of anime (tv, movie, ova, special, ona, music)
 * @param {string} options.filter - Filter (airing, upcoming, bypopularity, favorite)
 * @param {number} options.page - Page number
 * @param {number} options.limit - Number of results (default: 25, max: 25)
 * @returns {Promise<Object>} - Top anime results
 */
export function getTopAnime(options = {}) {
  // Build query string from options
  const queryParams = [];
  
  if (options.type) queryParams.push(`type=${options.type}`);
  if (options.filter) queryParams.push(`filter=${options.filter}`);
  if (options.page) queryParams.push(`page=${options.page}`);
  if (options.limit) queryParams.push(`limit=${options.limit}`);
  
  const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/top/anime${queryString}`);
}

/**
 * Get trending anime (most popular currently)
 * @param {number} limit - Number of results to return (default: 10, max: 25)
 * @returns {Promise<Object>} - Trending anime results
 */
export function getTrendingAnime(limit = 10) {
  return getTopAnime({
    filter: 'bypopularity',
    limit: Math.min(limit, 25)  // Ensure we don't exceed API limit
  });
}

/**
 * Get top airing anime
 * @param {number} limit - Number of results to return (default: 10, max: 25)
 * @returns {Promise<Object>} - Top airing anime results
 */
export function getTopAiringAnime(limit = 10) {
  return getTopAnime({
    filter: 'airing',
    limit: Math.min(limit, 25)  // Ensure we don't exceed API limit
  });
}

/**
 * Get top upcoming anime
 * @param {number} limit - Number of results to return (default: 10, max: 25)
 * @returns {Promise<Object>} - Top upcoming anime results
 */
export function getUpcomingAnime(limit = 10) {
  return getTopAnime({
    filter: 'upcoming',
    limit: Math.min(limit, 25)  // Ensure we don't exceed API limit
  });
}
