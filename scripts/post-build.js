#!/usr/bin/env node
import { readFile, writeFile, unlink } from 'fs/promises';
import { join } from 'path';

/**
 * Post-build script to extract script reference from dist/index.html
 * and save it for the API function, then remove dist/index.html
 * This allows Vercel's rewrite rule to route / to /api/index
 * The API function will serve the HTML dynamically with correct meta tags
 */
const distIndexPath = join(process.cwd(), 'dist', 'index.html');
const scriptRefPath = join(process.cwd(), 'dist', '.script-ref.json');

try {
  // Read the built index.html
  const html = await readFile(distIndexPath, 'utf-8');
  
  // Extract the script tag that loads the main entry point
  // Look for script tags with type="module" and src starting with /assets/
  const scriptMatch = html.match(/<script[^>]*type=["']module["'][^>]*src=["']([^"']+)["'][^>]*><\/script>/);
  
  if (scriptMatch && scriptMatch[1]) {
    const scriptSrc = scriptMatch[1];
    // Save the script reference for the API function
    await writeFile(scriptRefPath, JSON.stringify({ scriptSrc }), 'utf-8');
    console.log(`✅ Extracted script reference: ${scriptSrc}`);
  } else {
    // Fallback to /index.tsx for development
    await writeFile(scriptRefPath, JSON.stringify({ scriptSrc: '/index.tsx' }), 'utf-8');
    console.log('⚠️  Could not extract script reference, using fallback: /index.tsx');
  }
  
  // Now remove index.html
  await unlink(distIndexPath);
  console.log('✅ Removed dist/index.html - API function will serve HTML dynamically');
} catch (error) {
  if (error.code === 'ENOENT' && error.path === distIndexPath) {
    console.log('ℹ️  dist/index.html not found (already removed or not built)');
  } else {
    console.error('❌ Error processing dist/index.html:', error.message);
    process.exit(1);
  }
}

