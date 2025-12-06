#!/usr/bin/env node
import { unlink } from 'fs/promises';
import { join } from 'path';

/**
 * Post-build script to remove dist/index.html
 * This allows Vercel's rewrite rule to route / to /api/index
 * The API function will serve the HTML dynamically with correct meta tags
 */
const distIndexPath = join(process.cwd(), 'dist', 'index.html');

try {
  await unlink(distIndexPath);
  console.log('✅ Removed dist/index.html - API function will serve HTML dynamically');
} catch (error) {
  if (error.code === 'ENOENT') {
    console.log('ℹ️  dist/index.html not found (already removed or not built)');
  } else {
    console.error('❌ Error removing dist/index.html:', error.message);
    process.exit(1);
  }
}

