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

/**
 * Get anime details by ID
 * @param {number|string} id - The anime ID
 * @returns {Promise<Object>} - Anime details
 */
export function getAnime(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/anime/${id}`);
}

/**
 * Get anime characters by ID
 * @param {number|string} id - The anime ID
 * @returns {Promise<Object>} - Anime characters
 */
export function getAnimeCharacters(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/anime/${id}/characters`);
}

/**
 * Get anime staff by ID
 * @param {number|string} id - The anime ID
 * @returns {Promise<Object>} - Anime staff
 */
export function getAnimeStaff(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/anime/${id}/staff`);
}

/**
 * Get anime episodes by ID
 * @param {number|string} id - The anime ID
 * @param {number} [page] - Page number (optional)
 * @returns {Promise<Object>} - Anime episodes
 */
export function getAnimeEpisodes(id, page) {
  const pageParam = page ? `?page=${page}` : '';
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/anime/${id}/episodes${pageParam}`);
}

/**
 * Get a specific anime episode
 * @param {number|string} id - The anime ID
 * @param {number|string} episode - The episode number
 * @returns {Promise<Object>} - Anime episode details
 */
export function getAnimeEpisode(id, episode) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/anime/${id}/episodes/${episode}`);
}

/**
 * Get anime news by ID
 * @param {number|string} id - The anime ID
 * @returns {Promise<Object>} - Anime news
 */
export function getAnimeNews(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/anime/${id}/news`);
}

/**
 * Get anime forum topics by ID
 * @param {number|string} id - The anime ID
 * @returns {Promise<Object>} - Anime forum topics
 */
export function getAnimeForum(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/anime/${id}/forum`);
}

/**
 * Get anime videos by ID
 * @param {number|string} id - The anime ID
 * @returns {Promise<Object>} - Anime videos
 */
export function getAnimeVideos(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/anime/${id}/videos`);
}

/**
 * Get anime episode videos by ID
 * @param {number|string} id - The anime ID
 * @returns {Promise<Object>} - Anime episode videos
 */
export function getAnimeEpisodeVideos(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/anime/${id}/videos/episodes`);
}

/**
 * Get anime pictures by ID
 * @param {number|string} id - The anime ID
 * @returns {Promise<Object>} - Anime pictures
 */
export function getAnimePictures(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/anime/${id}/pictures`);
}

/**
 * Get anime statistics by ID
 * @param {number|string} id - The anime ID
 * @returns {Promise<Object>} - Anime statistics
 */
export function getAnimeStatistics(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/anime/${id}/statistics`);
}

/**
 * Get anime more info by ID
 * @param {number|string} id - The anime ID
 * @returns {Promise<Object>} - Anime more info
 */
export function getAnimeMoreInfo(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/anime/${id}/moreinfo`);
}

/**
 * Get anime recommendations by ID
 * @param {number|string} id - The anime ID
 * @returns {Promise<Object>} - Anime recommendations
 */
export function getAnimeRecommendations(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/anime/${id}/recommendations`);
}

/**
 * Get anime user updates by ID
 * @param {number|string} id - The anime ID
 * @returns {Promise<Object>} - Anime user updates
 */
export function getAnimeUserUpdates(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/anime/${id}/userupdates`);
}

/**
 * Get anime reviews by ID
 * @param {number|string} id - The anime ID
 * @returns {Promise<Object>} - Anime reviews
 */
export function getAnimeReviews(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/anime/${id}/reviews`);
}

/**
 * Get anime relations by ID
 * @param {number|string} id - The anime ID
 * @returns {Promise<Object>} - Anime relations
 */
export function getAnimeRelations(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/anime/${id}/relations`);
}

/**
 * Get anime themes by ID
 * @param {number|string} id - The anime ID
 * @returns {Promise<Object>} - Anime themes
 */
export function getAnimeThemes(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/anime/${id}/themes`);
}

/**
 * Get anime external links by ID
 * @param {number|string} id - The anime ID
 * @returns {Promise<Object>} - Anime external links
 */
export function getAnimeExternal(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/anime/${id}/external`);
}

/**
 * Get anime streaming links by ID
 * @param {number|string} id - The anime ID
 * @returns {Promise<Object>} - Anime streaming links
 */
export function getAnimeStreaming(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/anime/${id}/streaming`);
}

/**
 * Get anime list (search/filter)
 * @param {Object} options - Query parameters (q, type, status, rating, etc.)
 * @returns {Promise<Object>} - Anime list
 */
export function getAnimeList(options = {}) {
  const params = Object.entries(options).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  const query = params ? `?${params}` : '';
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/anime${query}`);
}

/**
 * Get character full details by ID
 * @param {number|string} id - The character ID
 * @returns {Promise<Object>} - Character full details
 */
export function getCharacterFull(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/characters/${id}/full`);
}

/**
 * Get character details by ID
 * @param {number|string} id - The character ID
 * @returns {Promise<Object>} - Character details
 */
export function getCharacter(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/characters/${id}`);
}

/**
 * Get character anime by ID
 * @param {number|string} id - The character ID
 * @returns {Promise<Object>} - Character anime
 */
export function getCharacterAnime(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/characters/${id}/anime`);
}

/**
 * Get character manga by ID
 * @param {number|string} id - The character ID
 * @returns {Promise<Object>} - Character manga
 */
export function getCharacterManga(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/characters/${id}/manga`);
}

/**
 * Get character voices by ID
 * @param {number|string} id - The character ID
 * @returns {Promise<Object>} - Character voices
 */
export function getCharacterVoices(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/characters/${id}/voices`);
}

/**
 * Get character pictures by ID
 * @param {number|string} id - The character ID
 * @returns {Promise<Object>} - Character pictures
 */
export function getCharacterPictures(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/characters/${id}/pictures`);
}

/**
 * Get character list (search/filter)
 * @param {Object} options - Query parameters (q, page, etc.)
 * @returns {Promise<Object>} - Character list
 */
export function getCharacterList(options = {}) {
  const params = Object.entries(options).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  const query = params ? `?${params}` : '';
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/characters${query}`);
}

/**
 * Get club details by ID
 * @param {number|string} id - The club ID
 * @returns {Promise<Object>} - Club details
 */
export function getClub(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/clubs/${id}`);
}

/**
 * Get club members by ID
 * @param {number|string} id - The club ID
 * @returns {Promise<Object>} - Club members
 */
export function getClubMembers(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/clubs/${id}/members`);
}

/**
 * Get club staff by ID
 * @param {number|string} id - The club ID
 * @returns {Promise<Object>} - Club staff
 */
export function getClubStaff(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/clubs/${id}/staff`);
}

/**
 * Get club relations by ID
 * @param {number|string} id - The club ID
 * @returns {Promise<Object>} - Club relations
 */
export function getClubRelations(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/clubs/${id}/relations`);
}

/**
 * Get club list (search/filter)
 * @param {Object} options - Query parameters (q, page, etc.)
 * @returns {Promise<Object>} - Club list
 */
export function getClubList(options = {}) {
  const params = Object.entries(options).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  const query = params ? `?${params}` : '';
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/clubs${query}`);
}

/**
 * Get anime genres
 * @returns {Promise<Object>} - Anime genres
 */
export function getAnimeGenres() {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/genres/anime`);
}

/**
 * Get manga genres
 * @returns {Promise<Object>} - Manga genres
 */
export function getMangaGenres() {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/genres/manga`);
}

/**
 * Get magazines
 * @returns {Promise<Object>} - Magazines
 */
export function getMagazines() {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/magazines`);
}

/**
 * Get manga full details by ID
 * @param {number|string} id - The manga ID
 * @returns {Promise<Object>} - Manga full details
 */
export function getMangaFull(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/manga/${id}/full`);
}

/**
 * Get manga details by ID
 * @param {number|string} id - The manga ID
 * @returns {Promise<Object>} - Manga details
 */
export function getManga(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/manga/${id}`);
}

/**
 * Get manga characters by ID
 * @param {number|string} id - The manga ID
 * @returns {Promise<Object>} - Manga characters
 */
export function getMangaCharacters(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/manga/${id}/characters`);
}

/**
 * Get manga news by ID
 * @param {number|string} id - The manga ID
 * @returns {Promise<Object>} - Manga news
 */
export function getMangaNews(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/manga/${id}/news`);
}

/**
 * Get manga forum topics by ID
 * @param {number|string} id - The manga ID
 * @returns {Promise<Object>} - Manga forum topics
 */
export function getMangaForum(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/manga/${id}/forum`);
}

/**
 * Get manga pictures by ID
 * @param {number|string} id - The manga ID
 * @returns {Promise<Object>} - Manga pictures
 */
export function getMangaPictures(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/manga/${id}/pictures`);
}

/**
 * Get manga statistics by ID
 * @param {number|string} id - The manga ID
 * @returns {Promise<Object>} - Manga statistics
 */
export function getMangaStatistics(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/manga/${id}/statistics`);
}

/**
 * Get manga more info by ID
 * @param {number|string} id - The manga ID
 * @returns {Promise<Object>} - Manga more info
 */
export function getMangaMoreInfo(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/manga/${id}/moreinfo`);
}

/**
 * Get manga recommendations by ID
 * @param {number|string} id - The manga ID
 * @returns {Promise<Object>} - Manga recommendations
 */
export function getMangaRecommendations(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/manga/${id}/recommendations`);
}

/**
 * Get manga user updates by ID
 * @param {number|string} id - The manga ID
 * @returns {Promise<Object>} - Manga user updates
 */
export function getMangaUserUpdates(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/manga/${id}/userupdates`);
}

/**
 * Get manga reviews by ID
 * @param {number|string} id - The manga ID
 * @returns {Promise<Object>} - Manga reviews
 */
export function getMangaReviews(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/manga/${id}/reviews`);
}

/**
 * Get manga relations by ID
 * @param {number|string} id - The manga ID
 * @returns {Promise<Object>} - Manga relations
 */
export function getMangaRelations(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/manga/${id}/relations`);
}

/**
 * Get manga external links by ID
 * @param {number|string} id - The manga ID
 * @returns {Promise<Object>} - Manga external links
 */
export function getMangaExternal(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/manga/${id}/external`);
}

/**
 * Get manga list (search/filter)
 * @param {Object} options - Query parameters (q, type, status, rating, etc.)
 * @returns {Promise<Object>} - Manga list
 */
export function getMangaList(options = {}) {
  const params = Object.entries(options).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  const query = params ? `?${params}` : '';
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/manga${query}`);
}

/**
 * Get person full details by ID
 * @param {number|string} id - The person ID
 * @returns {Promise<Object>} - Person full details
 */
export function getPersonFull(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/people/${id}/full`);
}

/**
 * Get person details by ID
 * @param {number|string} id - The person ID
 * @returns {Promise<Object>} - Person details
 */
export function getPerson(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/people/${id}`);
}

/**
 * Get person anime by ID
 * @param {number|string} id - The person ID
 * @returns {Promise<Object>} - Person anime
 */
export function getPersonAnime(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/people/${id}/anime`);
}

/**
 * Get person voices by ID
 * @param {number|string} id - The person ID
 * @returns {Promise<Object>} - Person voices
 */
export function getPersonVoices(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/people/${id}/voices`);
}

/**
 * Get person manga by ID
 * @param {number|string} id - The person ID
 * @returns {Promise<Object>} - Person manga
 */
export function getPersonManga(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/people/${id}/manga`);
}

/**
 * Get person pictures by ID
 * @param {number|string} id - The person ID
 * @returns {Promise<Object>} - Person pictures
 */
export function getPersonPictures(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/people/${id}/pictures`);
}

/**
 * Get people list (search/filter)
 * @param {Object} options - Query parameters (q, page, etc.)
 * @returns {Promise<Object>} - People list
 */
export function getPeopleList(options = {}) {
  const params = Object.entries(options).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  const query = params ? `?${params}` : '';
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/people${query}`);
}

/**
 * Get producer details by ID
 * @param {number|string} id - The producer ID
 * @returns {Promise<Object>} - Producer details
 */
export function getProducer(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/producers/${id}`);
}

/**
 * Get producer full details by ID
 * @param {number|string} id - The producer ID
 * @returns {Promise<Object>} - Producer full details
 */
export function getProducerFull(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/producers/${id}/full`);
}

/**
 * Get producer external links by ID
 * @param {number|string} id - The producer ID
 * @returns {Promise<Object>} - Producer external links
 */
export function getProducerExternal(id) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/producers/${id}/external`);
}

/**
 * Get producer list (search/filter)
 * @param {Object} options - Query parameters (q, page, etc.)
 * @returns {Promise<Object>} - Producer list
 */
export function getProducerList(options = {}) {
  const params = Object.entries(options).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  const query = params ? `?${params}` : '';
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/producers${query}`);
}

/**
 * Get a random manga
 * @returns {Promise<Object>} - A random manga
 */
export function getRandomManga() {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/random/manga`);
}

/**
 * Get a random character
 * @returns {Promise<Object>} - A random character
 */
export function getRandomCharacter() {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/random/characters`);
}

/**
 * Get a random person
 * @returns {Promise<Object>} - A random person
 */
export function getRandomPerson() {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/random/people`);
}

/**
 * Get a random user
 * @returns {Promise<Object>} - A random user
 */
export function getRandomUser() {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/random/users`);
}

/**
 * Get anime recommendations
 * @returns {Promise<Object>} - Anime recommendations
 */
export function getAnimeRecommendationsList() {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/recommendations/anime`);
}

/**
 * Get manga recommendations
 * @returns {Promise<Object>} - Manga recommendations
 */
export function getMangaRecommendationsList() {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/recommendations/manga`);
}

/**
 * Get anime reviews
 * @returns {Promise<Object>} - Anime reviews
 */
export function getAnimeReviewsList() {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/reviews/anime`);
}

/**
 * Get manga reviews
 * @returns {Promise<Object>} - Manga reviews
 */
export function getMangaReviewsList() {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/reviews/manga`);
}

/**
 * Get anime schedules
 * @returns {Promise<Object>} - Anime schedules
 */
export function getSchedules() {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/schedules`);
}

/**
 * Get user about info
 * @param {string} username - The username
 * @returns {Promise<Object>} - User about info
 */
export function getUserAbout(username) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/users/${username}/about`);
}

/**
 * Get user history
 * @param {string} username - The username
 * @returns {Promise<Object>} - User history
 */
export function getUserHistory(username) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/users/${username}/history`);
}

/**
 * Get user friends
 * @param {string} username - The username
 * @returns {Promise<Object>} - User friends
 */
export function getUserFriends(username) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/users/${username}/friends`);
}

/**
 * Get user anime list
 * @param {string} username - The username
 * @returns {Promise<Object>} - User anime list
 */
export function getUserAnimeList(username) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/users/${username}/animelist`);
}

/**
 * Get user manga list
 * @param {string} username - The username
 * @returns {Promise<Object>} - User manga list
 */
export function getUserMangaList(username) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/users/${username}/mangalist`);
}

/**
 * Get user reviews
 * @param {string} username - The username
 * @returns {Promise<Object>} - User reviews
 */
export function getUserReviews(username) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/users/${username}/reviews`);
}

/**
 * Get user recommendations
 * @param {string} username - The username
 * @returns {Promise<Object>} - User recommendations
 */
export function getUserRecommendations(username) {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/users/${username}/recommendations`);
}

/**
 * Get all seasons
 * @returns {Promise<Object>} - All seasons
 */
export function getSeasons() {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/seasons`);
}

/**
 * Get upcoming seasons
 * @returns {Promise<Object>} - Upcoming seasons
 */
export function getUpcomingSeasons() {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/seasons/upcoming`);
}

/**
 * Get top manga
 * @param {Object} options - Query parameters
 * @returns {Promise<Object>} - Top manga
 */
export function getTopManga(options = {}) {
  const params = Object.entries(options).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  const query = params ? `?${params}` : '';
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/top/manga${query}`);
}

/**
 * Get top people
 * @param {Object} options - Query parameters
 * @returns {Promise<Object>} - Top people
 */
export function getTopPeople(options = {}) {
  const params = Object.entries(options).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  const query = params ? `?${params}` : '';
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/top/people${query}`);
}

/**
 * Get top characters
 * @param {Object} options - Query parameters
 * @returns {Promise<Object>} - Top characters
 */
export function getTopCharacters(options = {}) {
  const params = Object.entries(options).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  const query = params ? `?${params}` : '';
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/top/characters${query}`);
}

/**
 * Get top reviews
 * @param {Object} options - Query parameters
 * @returns {Promise<Object>} - Top reviews
 */
export function getTopReviews(options = {}) {
  const params = Object.entries(options).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  const query = params ? `?${params}` : '';
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/top/reviews${query}`);
}

/**
 * Get watch episodes
 * @returns {Promise<Object>} - Watch episodes
 */
export function getWatchEpisodes() {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/watch/episodes`);
}

/**
 * Get popular watch episodes
 * @returns {Promise<Object>} - Popular watch episodes
 */
export function getWatchEpisodesPopular() {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/watch/episodes/popular`);
}

/**
 * Get watch promos
 * @returns {Promise<Object>} - Watch promos
 */
export function getWatchPromos() {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/watch/promos`);
}

/**
 * Get popular watch promos
 * @returns {Promise<Object>} - Popular watch promos
 */
export function getWatchPromosPopular() {
  return fetchJSON(`${API_BASE_URL}/${API_VERSION}/watch/promos/popular`);
}
