#!/usr/bin/env node
/**
 * Helper script to update farcaster.json manifest with credentials from .env
 * Run this after npx create-onchain --manifest generates your .env file
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env file
const envPath = join(__dirname, '.env');
const manifestPath = join(__dirname, 'public', '.well-known', 'farcaster.json');

try {
  const envContent = readFileSync(envPath, 'utf-8');
  const manifestContent = readFileSync(manifestPath, 'utf-8');
  
  // Parse .env
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
      envVars[key] = value;
    }
  });
  
  // Check for required vars
  if (!envVars.FARCASTER_HEADER || !envVars.FARCASTER_PAYLOAD || !envVars.FARCASTER_SIGNATURE) {
    console.error('❌ Missing required environment variables:');
    console.error('   - FARCASTER_HEADER');
    console.error('   - FARCASTER_PAYLOAD');
    console.error('   - FARCASTER_SIGNATURE');
    console.error('\nRun: npx create-onchain --manifest first');
    process.exit(1);
  }
  
  // Parse manifest
  const manifest = JSON.parse(manifestContent);
  
  // Update accountAssociation
  manifest.accountAssociation = {
    header: envVars.FARCASTER_HEADER,
    payload: envVars.FARCASTER_PAYLOAD,
    signature: envVars.FARCASTER_SIGNATURE
  };
  
  // Write updated manifest
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  
  console.log('✅ Successfully updated manifest with new accountAssociation credentials!');
  console.log(`   Updated: ${manifestPath}`);
  
} catch (error) {
  console.error('❌ Error updating manifest:', error.message);
  process.exit(1);
}

