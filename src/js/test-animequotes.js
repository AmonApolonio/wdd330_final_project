import {
  getAllQuotes,
  getRandomQuote,
  searchQuotesByCharacter,
  searchQuotesByAnime,
  getRandomQuoteByCharacter,
  getRandomQuoteByAnime
} from './api/animequotes.js';

import { apiCache } from './cache.js';

/**
 * @returns {Promise<void>}
 */
export async function testAnimeQuotesAPI() {
  console.log('📊 ANIME QUOTES API TEST RESULTS:');
  console.log('----------------------------------');

  try {
    console.log('🧪 Testing getAllQuotes()...');
    const allQuotes = await getAllQuotes();
    console.log(`✅ SUCCESS: Retrieved ${allQuotes.length} quotes`);

    console.log('🧪 Testing cache for getAllQuotes()...');
    const startTime = performance.now();
    await getAllQuotes();
    const endTime = performance.now();
    console.log(`✅ SUCCESS: Cache retrieved in ${(endTime - startTime).toFixed(2)}ms`);

    console.log('🧪 Testing getRandomQuote()...');
    const randomQuote = await getRandomQuote();
    console.log(`✅ SUCCESS: Random quote from "${randomQuote.anime}" by ${randomQuote.character}`);

    console.log('🧪 Testing searchQuotesByCharacter()...');
    const characterQuotes = await searchQuotesByCharacter('lelouch');
    console.log(`✅ SUCCESS: Retrieved ${characterQuotes.length} quotes by Lelouch`);

    console.log('🧪 Testing searchQuotesByAnime()...');
    const animeQuotes = await searchQuotesByAnime('code geass');
    console.log(`✅ SUCCESS: Retrieved ${animeQuotes.length} quotes from Code Geass`);

    console.log('🧪 Testing getRandomQuoteByCharacter()...');
    const randomCharQuote = await getRandomQuoteByCharacter('spike spiegel');
    console.log(`✅ SUCCESS: Random quote by Spike Spiegel from "${randomCharQuote.anime}"`);

    console.log('🧪 Testing getRandomQuoteByAnime()...');
    const randomAnimeQuote = await getRandomQuoteByAnime('violet evergarden');
    console.log(`✅ SUCCESS: Random quote from Violet Evergarden by ${randomAnimeQuote.character}`);

    console.log('📦 Cache status:');
    console.log(`   Items in cache: ${Object.keys(apiCache.cache).length}`);

    console.log('🧪 Testing pagination...');
    const page2 = await getAllQuotes(2);
    console.log(`✅ SUCCESS: Retrieved ${page2.length} quotes from page 2`);

    console.log('----------------------------------');
    console.log('✅ ALL ANIME QUOTES API TESTS PASSED!');
    return true;
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    return false;
  }
}
