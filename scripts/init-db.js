#!/usr/bin/env node

/**
 * Database Initialization Script
 * 
 * This script initializes the database by calling the /api/init endpoint
 * 
 * Usage:
 *   node scripts/init-db.js http://localhost:3000
 *   node scripts/init-db.js https://mysite.com
 */

const http = require('http');
const https = require('https');

const baseUrl = process.argv[2] || 'http://localhost:3000';

console.log(`🚀 Starting database initialization...`);
console.log(`📍 Target: ${baseUrl}/api/init\n`);

const url = new URL(`${baseUrl}/api/init`);
const client = url.protocol === 'https:' ? https : http;

const options = {
  hostname: url.hostname,
  port: url.port,
  path: url.pathname + url.search,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

const req = client.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);

      if (response.status === 'success') {
        console.log('✅ Database initialization successful!\n');
        console.log('Created tables:');
        Object.entries(response.tables).forEach(([table, exists]) => {
          console.log(`  ${exists ? '✓' : '✗'} ${table}`);
        });
        
        console.log('\nStorage:');
        Object.entries(response.storage).forEach(([bucket, exists]) => {
          console.log(`  ${exists ? '✓' : '✗'} ${bucket}`);
        });

        if (response.next_steps) {
          console.log('\nNext steps:');
          response.next_steps.forEach((step, idx) => {
            console.log(`  ${idx + 1}. ${step}`);
          });
        }
        
        process.exit(0);
      } else if (response.status === 'partial_success') {
        console.warn('⚠️  Database initialization partially successful\n');
        console.warn(`Message: ${response.message}`);
        console.warn(`Details: ${response.details}\n`);
        console.log('Please check DATABASE_SETUP.md for manual setup instructions.');
        process.exit(0);
      } else {
        console.error('❌ Database initialization failed\n');
        console.error(`Status: ${response.status}`);
        console.error(`Message: ${response.message}`);
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Failed to parse response:', error.message);
      console.error('Response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  console.error('\nMake sure:');
  console.error('  1. The application is running at:', baseUrl);
  console.error('  2. Environment variables are properly configured');
  process.exit(1);
});

req.setTimeout(60000, () => {
  req.destroy();
  console.error('❌ Request timeout after 60 seconds');
  process.exit(1);
});

req.write(JSON.stringify({}));
req.end();
