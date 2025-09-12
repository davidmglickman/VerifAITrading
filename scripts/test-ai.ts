// Simple test script to verify AI functionality
// Run this to test if OpenAI integration is working properly

import { analyzeStock } from '../lib/openai'

async function testAI() {
  console.log('🧪 Testing AI functionality...')
  
  try {
    // Test with a simple AAPL analysis
    const testRequest = {
      symbol: 'AAPL',
      currentPrice: 185.00,
      priceHistory: [183.50, 185.00],
      volume: 50000000,
      marketCap: 2900000000000,
      news: [
        {
          title: 'Apple Reports Strong Q4 Earnings',
          summary: 'Apple Inc. reported better-than-expected earnings with strong iPhone sales'
        }
      ]
    }
    
    console.log('📊 Analyzing AAPL...')
    const result = await analyzeStock(testRequest)
    
    console.log('✅ AI Analysis successful!')
    console.log('📈 Recommendation:', result.recommendation)
    console.log('🎯 Confidence:', result.confidence + '%')
    console.log('💭 Summary:', result.summary)
    
    return true
  } catch (error) {
    console.error('❌ AI Test failed:', error)
    return false
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testAI().then(success => {
    process.exit(success ? 0 : 1)
  })
}

export { testAI }
