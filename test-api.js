// Quick test script for the news API
// Run with: node test-api.js

async function testNewsAPI() {
  console.log('🧪 Testing News API...\n');

  const tests = [
    { name: 'National News (general)', url: 'http://localhost:3001/api/news?category=general' },
    { name: 'National News (tech)', url: 'http://localhost:3001/api/news?category=tech' },
    { name: 'State News (Maharashtra)', url: 'http://localhost:3001/api/news?state=MH' },
    { name: 'State News (Kerala)', url: 'http://localhost:3001/api/news?state=KL' },
    { name: 'State News (Delhi)', url: 'http://localhost:3001/api/news?state=DL' },
  ];

  for (const test of tests) {
    try {
      console.log(`📡 Testing: ${test.name}`);
      const response = await fetch(test.url);
      
      if (!response.ok) {
        console.log(`   ❌ Failed: HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();
      console.log(`   ✅ Success: ${data.items?.length || 0} items`);
      console.log(`   📰 Source: ${data.source}`);
      
      if (data.items && data.items.length > 0) {
        console.log(`   📌 First headline: ${data.items[0].title.substring(0, 60)}...`);
      }
      console.log('');
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }

  console.log('✨ Test complete!');
  console.log('\n💡 Tip: Make sure the API server is running with: npm run dev:api');
}

testNewsAPI();
