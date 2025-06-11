/**
 * Fetch JSON data from a URL with retry logic for rate limiting and network issues
 * @param {string} url - The URL to fetch data from
 * @param {Object} options - Fetch options (optional)
 * @returns {Promise<Object>} - JSON response data
 * @throws {Error} - Error with message for UI display
 */
export async function fetchJSON(url, options = {}) {
  let attempts = 0;
  const maxAttempts = 3;
  const delays = [500, 1000, 2000];

  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 8);
  while (attempts <= maxAttempts) {
    try {
      console.log(`[${requestId}] Fetching: ${url} (Attempt ${attempts + 1}/${maxAttempts + 1})`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        const duration = Date.now() - startTime;
        console.log(`[${requestId}] Success: ${url} (${duration}ms)`);
        return data;
      }

      if (response.status === 429) {
        if (attempts === maxAttempts) {
          const duration = Date.now() - startTime;
          console.error(`[${requestId}] Rate limit exceeded (${duration}ms): ${url}`);
          throw new Error(`Rate limit exceeded. Please try again later.`);
        }

        console.warn(`[${requestId}] Rate limited, waiting ${delays[attempts]}ms before retry`);
        await new Promise(resolve => setTimeout(resolve, delays[attempts]));
        attempts++;
        continue;
      }

      if (response.status === 404) {
        throw new Error(`Resource not found: The requested data could not be found.`);
      } else if (response.status === 500) {
        throw new Error(`Server error: The API server encountered an error.`);
      } else if (response.status === 400) {
        throw new Error(`Invalid request: Please check your search parameters.`);
      }

      const duration = Date.now() - startTime;
      console.error(`[${requestId}] API Error (${duration}ms): ${response.status} ${response.statusText}`);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error(`[${requestId}] Request timeout: ${url}`);

        if (attempts === maxAttempts) {
          throw {
            message: 'Request timed out. Please try again later.',
            status: 'TIMEOUT',
            originalError: error
          };
        }

        attempts++;
        continue;
      }

      if (attempts === maxAttempts || !(error.message.includes('Rate limit'))) {
        const duration = Date.now() - startTime;
        console.error(`[${requestId}] Fetch error (${duration}ms):`, error);

        throw {
          message: error.message || 'Failed to fetch data',
          status: error.status || 'NETWORK_ERROR',
          originalError: error
        };
      }

      attempts++;
    }
  }
}
