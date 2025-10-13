#!/usr/bin/env node

/**
 * Feature Test Script for FoundersForge
 * Tests all Zig modules and core functionality
 */

const baseUrl = 'http://localhost:3001';

const tests = [
  {
    name: 'Landing Page',
    url: '/',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Dashboard',
    url: '/dashboard',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Pricing Page',
    url: '/pricing',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Settings Page',
    url: '/settings',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Studio Page (Zig 3)',
    url: '/studio',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Generate Product API',
    url: '/api/generate',
    method: 'POST',
    expectedStatus: 400, // Expected 400 due to missing body
    body: {}
  },
  {
    name: 'Scan Trends API',
    url: '/api/scan',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Studio Generate API (Zig 3)',
    url: '/api/studio/generate',
    method: 'POST',
    expectedStatus: 400, // Expected 400 due to missing body
    body: {}
  },
  {
    name: 'Social Scan API (Zig 5)',
    url: '/api/social-scan',
    method: 'POST',
    expectedStatus: 400, // Expected 400 due to missing body
    body: {}
  },
  {
    name: 'Brand Generate API (Zig 6)',
    url: '/api/brand/generate',
    method: 'POST',
    expectedStatus: 400, // Expected 400 due to missing body
    body: {}
  }
];

async function runTest(test) {
  try {
    const url = `${baseUrl}${test.url}`;
    const options = {
      method: test.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (test.body) {
      options.body = JSON.stringify(test.body);
    }

    const response = await fetch(url, options);
    const status = response.status;
    
    console.log(`✅ ${test.name}: ${status} ${status === test.expectedStatus ? '(Expected)' : '(Unexpected)'}`);
    
    if (status !== test.expectedStatus) {
      console.log(`   Expected: ${test.expectedStatus}, Got: ${status}`);
    }
    
    return status === test.expectedStatus;
  } catch (error) {
    console.log(`❌ ${test.name}: Error - ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting FoundersForge Feature Tests\n');
  console.log(`Testing against: ${baseUrl}\n`);
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const success = await runTest(test);
    if (success) passed++;
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between tests
  }
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! FoundersForge is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.');
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(baseUrl);
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🔍 Checking if server is running...');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Server is not running. Please start the development server first:');
    console.log('   pnpm dev');
    process.exit(1);
  }
  
  console.log('✅ Server is running. Starting tests...\n');
  await runAllTests();
}

main().catch(console.error);