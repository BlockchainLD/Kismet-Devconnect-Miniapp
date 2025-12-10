import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { getArtistMetaData, ARTISTS, APP_CONFIG } from '../constants';
import type { ArtistId } from '../types';

// Script reference - updated by post-build script
// This constant is automatically updated during build with the actual script path
const SCRIPT_REFERENCE = '/assets/index-DFUJ00CN.js';

// Get script reference from build output
async function getScriptReference(): Promise<string> {
  // First, try to use the embedded constant (updated by post-build script)
  if (SCRIPT_REFERENCE && SCRIPT_REFERENCE !== '/assets/index.js') {
    return SCRIPT_REFERENCE;
  }
  try {
    // In Vercel, static files are served from the output directory
    // Try to read the script reference file from various possible locations
    const possiblePaths = [
      join(process.cwd(), 'dist', '.script-ref.json'),
      join(process.cwd(), '.vercel', 'output', 'static', '.script-ref.json'),
      join('/var/task', 'dist', '.script-ref.json'),
      join('/var/task', '.script-ref.json'),
      join(process.cwd(), '.script-ref.json'),
    ];
    
    for (const scriptRefPath of possiblePaths) {
      try {
        const scriptRefData = await readFile(scriptRefPath, 'utf-8');
        const parsed = JSON.parse(scriptRefData);
        const scriptSrc = parsed.scriptSrc;
        if (scriptSrc) {
          console.log('Found script reference at:', scriptRefPath, scriptSrc);
          return scriptSrc;
        }
      } catch (pathError: any) {
        // Try next path - log only if it's not a file not found error
        if (pathError.code !== 'ENOENT') {
          console.log('Error reading', scriptRefPath, ':', pathError.message);
        }
        continue;
      }
    }
    
    // If no file found, try to find the built JS file in dist/assets
    const possibleAssetPaths = [
      join(process.cwd(), 'dist', 'assets'),
      join('/var/task', 'dist', 'assets'),
      join(process.cwd(), 'assets'),
    ];
    
    for (const distPath of possibleAssetPaths) {
      try {
        const files = await readdir(distPath);
        const jsFiles = files.filter((f: string) => f.endsWith('.js') && f.startsWith('index-'));
        if (jsFiles.length > 0) {
          const scriptSrc = `/assets/${jsFiles[0]}`;
          console.log('Found script file by scanning:', scriptSrc);
          return scriptSrc;
        }
      } catch (e: any) {
        if (e.code !== 'ENOENT') {
          console.log('Error reading assets directory', distPath, ':', e.message);
        }
        continue;
      }
    }
    
    // Final fallback - try to use the embedded constant
    if (SCRIPT_REFERENCE) {
      console.log('Using embedded script reference:', SCRIPT_REFERENCE);
      return SCRIPT_REFERENCE;
    }
    
    // Last resort fallback
    console.warn('Could not find script reference file, using pattern-based fallback');
    return '/assets/index.js';
  } catch (error: any) {
    console.error('Error getting script reference:', error.message || error);
    // Try embedded constant as fallback
    if (SCRIPT_REFERENCE) {
      return SCRIPT_REFERENCE;
    }
    // Final fallback
    return '/assets/index.js';
  }
}

// Generate artist data object for inline script
function generateArtistDataScript(): string {
  const artistDataEntries = Object.keys(ARTISTS).map((id) => {
    const meta = getArtistMetaData(id as ArtistId);
    if (!meta) return null;
    return `          '${id}': {
            name: '${meta.name.replace(/'/g, "\\'")}',
            imageUrl: '${meta.imageUrl}',
            description: '${meta.description.replace(/'/g, "\\'")}'
          }`;
  }).filter(Boolean).join(',\n');
  
  return `const artistData = {\n${artistDataEntries}\n        };`;
}

// Base HTML template embedded as string
async function getBaseHTML(): Promise<string> {
  const scriptSrc = await getScriptReference();
  const artistDataScript = generateArtistDataScript();
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${APP_CONFIG.APP_NAME}</title>
    
    <!-- Farcaster Mini App Embed Meta Tags (correct format per spec) -->
    <meta name="fc:miniapp" content='{"version":"1","imageUrl":"${APP_CONFIG.DEFAULT_IMAGE}","button":{"title":"Explore Kismet","action":{"type":"launch_miniapp","url":"${APP_CONFIG.BASE_URL}","name":"${APP_CONFIG.APP_NAME}","splashImageUrl":"${APP_CONFIG.SPLASH_IMAGE}","splashBackgroundColor":"${APP_CONFIG.SPLASH_BG_COLOR}"}}}' />
    <!-- Backward compatibility -->
    <meta name="fc:frame" content='{"version":"1","imageUrl":"${APP_CONFIG.DEFAULT_IMAGE}","button":{"title":"Explore Kismet","action":{"type":"launch_frame","url":"${APP_CONFIG.BASE_URL}","name":"${APP_CONFIG.APP_NAME}","splashImageUrl":"${APP_CONFIG.SPLASH_IMAGE}","splashBackgroundColor":"${APP_CONFIG.SPLASH_BG_COLOR}"}}}' />
    
    <!-- Open Graph / Social Sharing Meta Tags -->
    <meta property="og:title" content="${APP_CONFIG.APP_NAME}" />
    <meta property="og:description" content="${APP_CONFIG.DEFAULT_DESCRIPTION}" />
    <meta property="og:image" content="${APP_CONFIG.DEFAULT_IMAGE}" />
    <meta property="og:url" content="${APP_CONFIG.BASE_URL}" />
    <meta property="og:type" content="website" />
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${APP_CONFIG.APP_NAME}" />
    <meta name="twitter:description" content="${APP_CONFIG.SHORT_DESCRIPTION}" />
    <meta name="twitter:image" content="${APP_CONFIG.DEFAULT_IMAGE}" />
    
    <!-- Early script to update meta tags for artist profile embeds (runs before React) -->
    <script>
      (function() {
        // Check for artist parameter in URL
        const params = new URLSearchParams(window.location.search);
        const artistParam = params.get('artist');
        
        // Artist data mapping (for embed previews) - Generated from shared constants
        ${artistDataScript}
        
        // If artist parameter exists and is valid, update meta tags
        if (artistParam && artistData[artistParam]) {
          const artist = artistData[artistParam];
          const baseUrl = '${APP_CONFIG.BASE_URL}';
          const appName = '${APP_CONFIG.APP_NAME}';
          const splashImage = '${APP_CONFIG.SPLASH_IMAGE}';
          const splashBgColor = '${APP_CONFIG.SPLASH_BG_COLOR}';
          const artistDescSuffix = '${APP_CONFIG.ARTIST_DESCRIPTION_SUFFIX}';
          const artistUrl = baseUrl + '?artist=' + artistParam;
          
          // Update fc:miniapp meta tag
          const miniappEmbed = {
            version: "1",
            imageUrl: artist.imageUrl,
            button: {
              title: "View " + artist.name,
              action: {
                type: "launch_miniapp",
                url: artistUrl,
                name: appName,
                splashImageUrl: splashImage,
                splashBackgroundColor: splashBgColor
              }
            }
          };
          
          // Update fc:frame meta tag (backward compatibility)
          const frameEmbed = JSON.parse(JSON.stringify(miniappEmbed));
          frameEmbed.button.action.type = "launch_frame";
          
          // Update meta tags
          const updateMetaTag = function(name, content) {
            let meta = document.querySelector('meta[name="' + name + '"]');
            if (!meta) {
              meta = document.createElement('meta');
              meta.setAttribute('name', name);
              document.head.appendChild(meta);
            }
            meta.setAttribute('content', typeof content === 'string' ? content : JSON.stringify(content));
          };
          
          updateMetaTag('fc:miniapp', miniappEmbed);
          updateMetaTag('fc:frame', frameEmbed);
          
          // Update Open Graph tags
          const updateOGTag = function(property, content) {
            let meta = document.querySelector('meta[property="' + property + '"]');
            if (!meta) {
              meta = document.createElement('meta');
              meta.setAttribute('property', property);
              document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
          };
          
          updateOGTag('og:title', artist.name + ' | ' + appName);
          updateOGTag('og:description', artist.description + ' ' + artistDescSuffix);
          updateOGTag('og:image', artist.imageUrl);
          updateOGTag('og:url', artistUrl);
          
          // Update Twitter Card tags
          const updateTwitterTag = function(name, content) {
            let meta = document.querySelector('meta[name="' + name + '"]');
            if (!meta) {
              meta = document.createElement('meta');
              meta.setAttribute('name', name);
              document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
          };
          
          updateTwitterTag('twitter:title', artist.name + ' | ' + appName);
          updateTwitterTag('twitter:description', artist.description);
          updateTwitterTag('twitter:image', artist.imageUrl);
          
          // Update page title
          document.title = artist.name + ' | ' + appName;
        }
      })();
    </script>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=JetBrains+Mono:wght@400&family=Space+Grotesk:wght@400;700&family=VT323&family=Cormorant+Garamond:ital,wght@0,400;1,400&display=swap" rel="stylesheet">
    <style>
      /* Custom scrollbar hide for immersive feel */
      body, html {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden; /* CRITICAL: No Scroll */
        cursor: none; /* Hide default cursor */
        background-color: black;
      }
      
      .cursor-interactive {
        cursor: none;
      }

      /* Optimization classes */
      .will-change-transform {
        will-change: transform;
      }
      
      /* Typography Utilites */
      .text-balance {
        text-wrap: balance;
      }
      
      /* Smooth font rendering */
      * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      ::selection {
        background: rgba(255, 255, 255, 0.9);
        color: black;
      }

      .image-pixelated {
        image-rendering: pixelated;
      }

      /* SHAPE MORPHING ANIMATION */
      @keyframes morph {
        0% { 
          clip-path: circle(50%); 
          border-radius: 50%; 
        }
        14% { 
          /* Diamond */
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); 
          border-radius: 0; 
        }
        28% { 
          /* Triangle */
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%); 
          border-radius: 0; 
        }
        42% { 
          /* Star */
          clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); 
          border-radius: 0; 
        }
        56% { 
          /* Hexagon */
          clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%); 
          border-radius: 0; 
        }
        70% { 
           /* Inverted Triangle */
           clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
           border-radius: 0;
        }
        84% { 
           /* Cross */
           clip-path: polygon(20% 0%, 80% 0%, 80% 20%, 100% 20%, 100% 80%, 80% 80%, 80% 100%, 20% 100%, 20% 80%, 0% 80%, 0% 20%, 20% 20%);
           border-radius: 0;
        }
        100% { 
          clip-path: circle(50%); 
          border-radius: 50%; 
        }
      }

      .morph-shape {
        animation: morph 12s infinite ease-in-out;
      }

      /* Different timing offsets for chaos */
      .delay-1 { animation-delay: 0s; }
      .delay-2 { animation-delay: -2s; }
      .delay-3 { animation-delay: -5s; }
      .delay-4 { animation-delay: -7s; }
      .delay-5 { animation-delay: -9s; }

    </style>
  <script type="importmap">
{
  "imports": {
    "framer-motion": "https://aistudiocdn.com/framer-motion@^12.23.24",
    "react-dom/client": "https://aistudiocdn.com/react-dom@^19.2.0/client",
    "lucide-react": "https://aistudiocdn.com/lucide-react@^0.554.0",
    "react/": "https://aistudiocdn.com/react@^19.2.0/",
    "react": "https://aistudiocdn.com/react@^19.2.0",
    "react-dom/": "https://aistudiocdn.com/react-dom@^19.2.0/"
  }
}
</script>
</head>
  <body class="bg-black text-white antialiased">
    <div id="root" class="h-full w-full"></div>
    <!-- Early ready() call - critical for desktop Farcaster -->
    <script type="module">
      (async function() {
        console.log('=== INLINE SCRIPT START ===');
        console.log('Window parent:', window.parent !== window ? 'iframe' : 'top-level');
        console.log('User agent:', navigator.userAgent);
        
        let readyCalled = false;
        
        const callReady = async (sdk) => {
          if (readyCalled) return;
          try {
            if (sdk?.actions?.ready) {
              await sdk.actions.ready();
              readyCalled = true;
              console.log('✅ Early ready() called');
              return true;
            }
          } catch (e) {
            console.error('❌ ready() failed:', e);
          }
          console.log('Early ready() attempt failed, will retry in FarcasterContext');
          return false;
        };
        
        // Try miniapp-sdk
        try {
          const { sdk } = await import('https://esm.sh/@farcaster/miniapp-sdk@0.2.1');
          if (await callReady(sdk)) return;
        } catch (e) {
          console.log('Miniapp SDK import failed:', e.message);
        }
        
        console.log('=== INLINE SCRIPT END ===');
      })();
    </script>
    <script type="module" src="${scriptSrc}"></script>
  </body>
</html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const artistParam = req.query.artist as string | undefined;
    
    // Log for debugging
    console.log('API handler called with artist param:', artistParam);
    
    // Get base HTML template
    let html: string;
    try {
      html = await getBaseHTML();
    } catch (error) {
      console.error('Error generating base HTML:', error);
      // Return a minimal HTML fallback
      html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${APP_CONFIG.APP_NAME}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>`;
    }
    
    // If no artist parameter, serve default HTML as-is
    if (!artistParam) {
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60, max-age=300');
      return res.send(html);
    }
    
    const artist = getArtistMetaData(artistParam as ArtistId);
    if (!artist) {
      console.log('Artist not found:', artistParam);
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60, max-age=300');
      return res.send(html);
    }
    const artistUrl = `${APP_CONFIG.BASE_URL}?artist=${artistParam}`;
    
    // Build miniapp embed JSON
    const miniappEmbed = {
      version: "1",
      imageUrl: artist.imageUrl,
      button: {
        title: `View ${artist.name}`,
        action: {
          type: "launch_miniapp",
          url: artistUrl,
          name: APP_CONFIG.APP_NAME,
          splashImageUrl: APP_CONFIG.SPLASH_IMAGE,
          splashBackgroundColor: APP_CONFIG.SPLASH_BG_COLOR
        }
      }
    };
    
    const frameEmbed = JSON.parse(JSON.stringify(miniappEmbed));
    frameEmbed.button.action.type = "launch_frame";
    
    // Modify HTML with artist-specific meta tags
    try {
      // Escape JSON for HTML attributes - escape single quotes for content='...'
      const miniappEmbedJson = JSON.stringify(miniappEmbed).replace(/'/g, "&#39;");
      const frameEmbedJson = JSON.stringify(frameEmbed).replace(/'/g, "&#39;");
      
      // Replace meta tags - the HTML uses single quotes: content='...'
      const fcMiniappRegex = /<meta name="fc:miniapp" content='[^']*' \/>/;
      const fcFrameRegex = /<meta name="fc:frame" content='[^']*' \/>/;
      
      html = html.replace(fcMiniappRegex, `<meta name="fc:miniapp" content='${miniappEmbedJson}' />`);
      html = html.replace(fcFrameRegex, `<meta name="fc:frame" content='${frameEmbedJson}' />`);
      
      // Replace other meta tags
      const escapedName = artist.name.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      const escapedDesc = artist.description.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      
      html = html.replace(
        /<meta property="og:title" content="[^"]*" \/>/,
        `<meta property="og:title" content="${escapedName} | ${APP_CONFIG.APP_NAME}" />`
      );
      
      html = html.replace(
        /<meta property="og:description" content="[^"]*" \/>/,
        `<meta property="og:description" content="${escapedDesc} ${APP_CONFIG.ARTIST_DESCRIPTION_SUFFIX}" />`
      );
      
      html = html.replace(
        /<meta property="og:image" content="[^"]*" \/>/,
        `<meta property="og:image" content="${artist.imageUrl}" />`
      );
      
      html = html.replace(
        /<meta property="og:url" content="[^"]*" \/>/,
        `<meta property="og:url" content="${artistUrl}" />`
      );
      
      html = html.replace(
        /<meta name="twitter:title" content="[^"]*" \/>/,
        `<meta name="twitter:title" content="${escapedName} | ${APP_CONFIG.APP_NAME}" />`
      );
      
      html = html.replace(
        /<meta name="twitter:description" content="[^"]*" \/>/,
        `<meta name="twitter:description" content="${escapedDesc}" />`
      );
      
      html = html.replace(
        /<meta name="twitter:image" content="[^"]*" \/>/,
        `<meta name="twitter:image" content="${artist.imageUrl}" />`
      );
      
      html = html.replace(
        /<title>[^<]*<\/title>/,
        `<title>${artist.name} | ${APP_CONFIG.APP_NAME}</title>`
      );
      
      console.log('Successfully modified HTML for artist:', artistParam);
    } catch (error) {
      console.error('Error modifying HTML:', error);
      // Continue with unmodified HTML
    }
    
    res.setHeader('Content-Type', 'text/html');
    // Set cache headers to allow caching but ensure fresh content for scrapers
    // Use s-maxage for CDN cache and stale-while-revalidate for better performance
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60, max-age=300');
    res.send(html);
  } catch (error) {
    console.error('Fatal error in API handler:', error);
    // Return a basic error page
    res.status(500).setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Error</title>
  </head>
  <body>
    <h1>Server Error</h1>
    <p>An error occurred while processing your request.</p>
  </body>
</html>`);
  }
}
