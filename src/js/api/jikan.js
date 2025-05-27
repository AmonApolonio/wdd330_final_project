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
