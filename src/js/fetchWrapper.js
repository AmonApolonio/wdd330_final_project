// fetchWrapper.js
// A wrapper around the fetch API with built-in error handling and retry logic for rate limiting

/**
 * Fetch JSON data from a URL with retry logic for rate limiting
 * @param {string} url - The URL to fetch data from
 * @param {Object} options - Fetch options (optional)
 * @returns {Promise<Object>} - JSON response data
 * @throws {Error} - Error with message for UI display
 */
export async function fetchJSON(url, options = {}) {
  // Keep track of retry attempts
  let attempts = 0;
  const maxAttempts = 3;
  
  // Exponential backoff delays in milliseconds
  const delays = [500, 1000, 2000];
  
  while (attempts <= maxAttempts) {
    try {
      // Make the fetch request
      const response = await fetch(url, options);
      
      // Check if response is OK (status in the range 200-299)
      if (response.ok) {
        return await response.json();
      }
      
      // If we hit rate limiting (status code 429)
      if (response.status === 429) {
        // If we've already tried the maximum number of times
        if (attempts === maxAttempts) {
          throw new Error(`Rate limit exceeded. Please try again later.`);
        }
        
        // Wait for the specified delay
        await new Promise(resolve => setTimeout(resolve, delays[attempts]));
        
        // Increment attempts and try again
        attempts++;
        continue;
      }
      
      // For other HTTP errors
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    } catch (error) {
      // For network errors or JSON parsing errors
      if (attempts === maxAttempts || !(error.message.includes('Rate limit'))) {
        // Create a user-friendly error object
        throw {
          message: error.message || 'Failed to fetch data',
          status: error.status || 'NETWORK_ERROR',
          originalError: error
        };
      }
      
      // Increment attempts for rate limit errors
      attempts++;
    }
  }
}
