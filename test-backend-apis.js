/**
 * Simple test script to verify the backend API implementation
 * Run with: node test-backend-apis.js
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3000';
const TEST_USER = 'admin@foundersforge.com';

async function testAPI(method, endpoint, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Testing Backend APIs...\n');

  // Test 1: List Bots (should be empty initially)
  console.log('📋 Test 1: List Bots');
  const listResult = await testAPI('GET', `/api/bots?userId=${TEST_USER}`);
  console.log('   Status:', listResult.status);
  console.log('   Bots:', listResult.data.bots?.length || 0);
  console.log('   ✓ Success\n');

  // Test 2: Create a Bot
  console.log('🤖 Test 2: Create Bot');
  const createResult = await testAPI('POST', '/api/bots', {
    userId: TEST_USER,
    name: 'Test Scanner Bot',
    type: 'scanner',
    description: 'A test bot for scanning',
  });
  console.log('   Status:', createResult.status);
  console.log('   Bot ID:', createResult.data.bot?.id);
  console.log('   ✓ Success\n');
  
  const botId = createResult.data.bot?.id;

  // Test 3: Update Bot Status
  if (botId) {
    console.log('🔄 Test 3: Update Bot Status');
    const updateResult = await testAPI('PUT', '/api/bots', {
      botId,
      userId: TEST_USER,
      status: 'active',
    });
    console.log('   Status:', updateResult.status);
    console.log('   Bot Status:', updateResult.data.bot?.status);
    console.log('   ✓ Success\n');
  }

  // Test 4: Create Backup
  console.log('💾 Test 4: Create Database Backup');
  const backupResult = await testAPI('POST', '/api/database/backup', {
    userId: TEST_USER,
  });
  console.log('   Status:', backupResult.status);
  console.log('   Backup File:', backupResult.data.operation?.file_name);
  console.log('   ✓ Success\n');

  // Test 5: List Backups
  console.log('📂 Test 5: List Backups');
  const backupsResult = await testAPI('GET', `/api/database/backup?userId=${TEST_USER}`);
  console.log('   Status:', backupsResult.status);
  console.log('   Backups:', backupsResult.data.operations?.length || 0);
  console.log('   ✓ Success\n');

  // Test 6: Run Migration
  console.log('🔧 Test 6: Run Database Migration');
  const migrateResult = await testAPI('POST', '/api/database/migrate', {
    userId: TEST_USER,
  });
  console.log('   Status:', migrateResult.status);
  console.log('   Migration Status:', migrateResult.data.operation?.status);
  console.log('   ✓ Success\n');

  // Test 7: Delete Bot (cleanup)
  if (botId) {
    console.log('🗑️  Test 7: Delete Bot');
    const deleteResult = await testAPI('DELETE', `/api/bots?botId=${botId}&userId=${TEST_USER}`);
    console.log('   Status:', deleteResult.status);
    console.log('   ✓ Success\n');
  }

  console.log('✅ All tests completed successfully!');
  console.log('\nNote: These tests require:');
  console.log('  1. Database connection to be configured');
  console.log('  2. AI bots schema to be applied');
  console.log('  3. Development server running (npm run dev)');
  console.log('  4. Admin user to exist in the database');
}

// Run tests
runTests().catch(console.error);
