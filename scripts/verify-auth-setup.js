#!/usr/bin/env node

/**
 * Authentication Setup Verification Script
 * 
 * This script verifies that all required components for authentication are properly configured.
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔐 Etsy-Gen Authentication Setup Verification\n');
console.log('='.repeat(60));

let hasErrors = false;
let hasWarnings = false;

// Check 1: Environment Variables
console.log('\n📋 Checking Environment Variables...\n');

const requiredEnvVars = [
  { name: 'NEXTAUTH_SECRET', critical: true },
  { name: 'NEXT_PUBLIC_SUPABASE_URL', critical: true },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', critical: true },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', critical: true },
  { name: 'NEXTAUTH_URL', critical: false },
];

requiredEnvVars.forEach(({ name, critical }) => {
  const value = process.env[name];
  if (!value) {
    if (critical) {
      console.log(`   ❌ ${name} - MISSING (CRITICAL)`);
      hasErrors = true;
    } else {
      console.log(`   ⚠️  ${name} - Missing (recommended)`);
      hasWarnings = true;
    }
  } else {
    const preview = name.includes('SECRET') || name.includes('KEY') 
      ? value.substring(0, 10) + '...' 
      : value.length > 30 ? value.substring(0, 30) + '...' : value;
    console.log(`   ✅ ${name} - Set (${preview})`);
  }
});

// Check 2: Required Files
console.log('\n📁 Checking Required Files...\n');

const requiredFiles = [
  { path: 'lib/auth.ts', description: 'NextAuth configuration' },
  { path: 'middleware.ts', description: 'Authentication middleware' },
  { path: 'lib/auth-helper.ts', description: 'Authentication helpers' },
  { path: 'lib/db/client.ts', description: 'Database client' },
  { path: 'src/app/api/auth/[...nextauth]/route.ts', description: 'NextAuth route handler' },
  { path: 'src/app/login/page.tsx', description: 'Login page' },
];

requiredFiles.forEach(({ path: filePath, description }) => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✅ ${filePath} - Found`);
  } else {
    console.log(`   ❌ ${filePath} - MISSING (${description})`);
    hasErrors = true;
  }
});

// Check 3: Dependencies
console.log('\n📦 Checking Dependencies...\n');

try {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
  );
  
  const requiredDeps = [
    { name: 'next-auth', critical: true },
    { name: 'bcryptjs', critical: true },
    { name: '@supabase/supabase-js', critical: true },
  ];
  
  requiredDeps.forEach(({ name, critical }) => {
    const version = packageJson.dependencies?.[name];
    if (!version) {
      if (critical) {
        console.log(`   ❌ ${name} - NOT INSTALLED (CRITICAL)`);
        hasErrors = true;
      } else {
        console.log(`   ⚠️  ${name} - Not installed`);
        hasWarnings = true;
      }
    } else {
      console.log(`   ✅ ${name} - Installed (${version})`);
    }
  });
} catch (error) {
  console.log('   ❌ Could not read package.json');
  hasErrors = true;
}

// Check 4: File Contents Validation
console.log('\n🔍 Validating File Contents...\n');

// Check auth.ts
const authPath = path.join(process.cwd(), 'lib/auth.ts');
if (fs.existsSync(authPath)) {
  const authContent = fs.readFileSync(authPath, 'utf-8');
  
  const checks = [
    { 
      test: /supabaseAdmin/i, 
      message: 'Uses supabaseAdmin for auth queries',
      critical: true 
    },
    { 
      test: /bcrypt\.compare/i, 
      message: 'Uses bcrypt for password verification',
      critical: true 
    },
    { 
      test: /strategy:\s*["']jwt["']/i, 
      message: 'Uses JWT session strategy',
      critical: true 
    },
    { 
      test: /console\.log.*\[NextAuth\]/i, 
      message: 'Has debug logging enabled',
      critical: false 
    },
  ];
  
  checks.forEach(({ test, message, critical }) => {
    if (test.test(authContent)) {
      console.log(`   ✅ ${message}`);
    } else {
      if (critical) {
        console.log(`   ❌ ${message} - MISSING`);
        hasErrors = true;
      } else {
        console.log(`   ⚠️  ${message} - Not found`);
        hasWarnings = true;
      }
    }
  });
}

// Check middleware.ts
const middlewarePath = path.join(process.cwd(), 'middleware.ts');
if (fs.existsSync(middlewarePath)) {
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf-8');
  
  const checks = [
    { 
      test: /getToken/i, 
      message: 'Uses getToken to validate JWT',
      critical: true 
    },
    { 
      test: /x-user-id/i, 
      message: 'Sets x-user-id header',
      critical: true 
    },
    { 
      test: /console\.log.*\[Middleware\]/i, 
      message: 'Has debug logging enabled',
      critical: false 
    },
  ];
  
  checks.forEach(({ test, message, critical }) => {
    if (test.test(middlewareContent)) {
      console.log(`   ✅ ${message}`);
    } else {
      if (critical) {
        console.log(`   ❌ ${message} - MISSING`);
        hasErrors = true;
      } else {
        console.log(`   ⚠️  ${message} - Not found`);
        hasWarnings = true;
      }
    }
  });
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 Summary\n');

if (hasErrors) {
  console.log('   ❌ Authentication setup has CRITICAL issues');
  console.log('   → Please fix the issues above before proceeding');
  process.exit(1);
} else if (hasWarnings) {
  console.log('   ⚠️  Authentication setup is functional but has warnings');
  console.log('   → Consider addressing the warnings for better reliability');
  process.exit(0);
} else {
  console.log('   ✅ Authentication setup looks good!');
  console.log('   → All critical components are in place');
  process.exit(0);
}
