#!/usr/bin/env node
import { readFile, writeFile, unlink, readdir } from 'fs/promises';
import { join } from 'path';

/**
 * Post-build script to extract script reference from dist/index.html
 * and save it for the API function, then remove dist/index.html
 * This allows Vercel's rewrite rule to route / to /api/index
 * The API function will serve the HTML dynamically with correct meta tags
 */
const distIndexPath = join(process.cwd(), 'dist', 'index.html');
const scriptRefPath = join(process.cwd(), 'dist', '.script-ref.json');
const apiIndexPath = join(process.cwd(), 'api', 'index.ts');

try {
  let scriptSrc = '/index.tsx'; // Default fallback
  
  // Read the built index.html
  const html = await readFile(distIndexPath, 'utf-8');
  
  // Extract the script tag that loads the main entry point
  // Look for script tags with type="module" and src starting with /assets/
  const scriptMatch = html.match(/<script[^>]*type=["']module["'][^>]*src=["']([^"']+)["'][^>]*><\/script>/);
  
  if (scriptMatch && scriptMatch[1]) {
    scriptSrc = scriptMatch[1];
    console.log(`✅ Extracted script reference: ${scriptSrc}`);
  } else {
    // Try to find it by scanning assets directory
    try {
      const assetsPath = join(process.cwd(), 'dist', 'assets');
      const files = await readdir(assetsPath);
      const jsFiles = files.filter(f => f.endsWith('.js') && f.startsWith('index-'));
      if (jsFiles.length > 0) {
        scriptSrc = `/assets/${jsFiles[0]}`;
        console.log(`✅ Found script reference by scanning: ${scriptSrc}`);
      } else {
        console.log('⚠️  Could not extract script reference, using fallback: /index.tsx');
      }
    } catch (e) {
      console.log('⚠️  Could not scan assets directory, using fallback: /index.tsx');
    }
  }
  
  // Save the script reference for the API function
  await writeFile(scriptRefPath, JSON.stringify({ scriptSrc }), 'utf-8');
  
  // Also update the API function directly with the script reference as a constant
  // This ensures it's available even if the file can't be read
  try {
    let apiContent = await readFile(apiIndexPath, 'utf-8');
    // Replace the SCRIPT_REFERENCE constant if it exists, or add it
    const scriptRefConstant = `const SCRIPT_REFERENCE = '${scriptSrc}';`;
    if (apiContent.includes('const SCRIPT_REFERENCE =')) {
      apiContent = apiContent.replace(/const SCRIPT_REFERENCE = '[^']+';/, scriptRefConstant);
    } else {
      // Add it after the imports
      const importEnd = apiContent.indexOf('import type { ArtistId }');
      if (importEnd !== -1) {
        const insertPos = apiContent.indexOf('\n', importEnd + 50) + 1;
        apiContent = apiContent.slice(0, insertPos) + '\n' + scriptRefConstant + '\n' + apiContent.slice(insertPos);
      }
    }
    await writeFile(apiIndexPath, apiContent, 'utf-8');
    console.log(`✅ Updated API function with script reference: ${scriptSrc}`);
  } catch (e) {
    console.log('⚠️  Could not update API function directly:', e.message);
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

