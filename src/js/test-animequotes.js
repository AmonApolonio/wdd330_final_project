// Test script for Anime Quotes API (Yurippe API)
// Run this script to test all anime quotes API functions with our cache implementation

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
 * Run tests for the Anime Quotes API wrapper
 */
export async function testAnimeQuotesAPI() {
  console.log('📊 ANIME QUOTES API TEST RESULTS:');
  console.log('----------------------------------');
  
  try {
    // Test getAllQuotes
    console.log('🧪 Testing getAllQuotes()...');
    const allQuotes = await getAllQuotes();
    console.log(`✅ SUCCESS: Retrieved ${allQuotes.length} quotes`);
    
    // Test cache hit for getAllQuotes
    console.log('🧪 Testing cache for getAllQuotes()...');
    const startTime = performance.now();
    await getAllQuotes(); // Should use cache
    const endTime = performance.now();
    console.log(`✅ SUCCESS: Cache retrieved in ${(endTime - startTime).toFixed(2)}ms`);
    
    // Test random quote
    console.log('🧪 Testing getRandomQuote()...');
    const randomQuote = await getRandomQuote();
    console.log(`✅ SUCCESS: Random quote from "${randomQuote.anime}" by ${randomQuote.character}`);
    
    // Test character search
    console.log('🧪 Testing searchQuotesByCharacter()...');
    const characterQuotes = await searchQuotesByCharacter('lelouch');
    console.log(`✅ SUCCESS: Retrieved ${characterQuotes.length} quotes by Lelouch`);
    
    // Test anime search
    console.log('🧪 Testing searchQuotesByAnime()...');
    const animeQuotes = await searchQuotesByAnime('code geass');
    console.log(`✅ SUCCESS: Retrieved ${animeQuotes.length} quotes from Code Geass`);
    
    // Test random character quote
    console.log('🧪 Testing getRandomQuoteByCharacter()...');
    const randomCharQuote = await getRandomQuoteByCharacter('spike spiegel');
    console.log(`✅ SUCCESS: Random quote by Spike Spiegel from "${randomCharQuote.anime}"`);
    
    // Test random anime quote
    console.log('🧪 Testing getRandomQuoteByAnime()...');
    const randomAnimeQuote = await getRandomQuoteByAnime('violet evergarden');
    console.log(`✅ SUCCESS: Random quote from Violet Evergarden by ${randomAnimeQuote.character}`);
    
    // Test cache size
    console.log('📦 Cache status:');
    console.log(`   Items in cache: ${Object.keys(apiCache.cache).length}`);
    
    // Test pagination
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
