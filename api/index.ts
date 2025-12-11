import type { VercelRequest, VercelResponse } from '@vercel/node';

// Script reference - updated by post-build script
const SCRIPT_REFERENCE = '/assets/index-C-sNiEcn.js';

// App configuration - inline to avoid import issues
const APP_CONFIG = {
  APP_NAME: 'Based House Collection',
  BASE_URL: 'https://kismet-miniapp-2025.vercel.app',
  DEFAULT_IMAGE: 'https://kismet-miniapp-2025.vercel.app/image.png',
  SPLASH_IMAGE: 'https://kismet-miniapp-2025.vercel.app/splash.png',
  SPLASH_BG_COLOR: '#000000',
  DEFAULT_DESCRIPTION: 'An immersive, experimental digital exhibition space for the Kismet Casa x Basehouse residency artists. A living interface that morphs to match the aesthetic soul of each creator.',
  SHORT_DESCRIPTION: 'An immersive, experimental digital exhibition space for the Kismet Casa x Basehouse residency artists.',
  ARTIST_DESCRIPTION_SUFFIX: 'Explore this artist\'s work in the Kismet Casa x Basehouse residency exhibition.'
};

// Artist data - inline to avoid import issues
const ARTISTS_DATA: Record<string, { name: string; imageUrl: string; description: string }> = {
  'qab': {
    name: 'QABQABQAB',
    imageUrl: 'https://i.postimg.cc/RZSqXtGT/qab-da-kismet-female-energy.png',
    description: 'QABQABQAB - Pop Gestual Urbano. Da Kismet Female Energy.'
  },
  'gressie': {
    name: 'GRESSIE',
    imageUrl: 'https://i.postimg.cc/nhFM0mT4/gressie-house-of-chaos.png',
    description: 'GRESSIE - Etéreo Suave. House of Chaos.'
  },
  'noistruct': {
    name: 'NOISTRUCT',
    imageUrl: 'https://i.postimg.cc/mgLh89VQ/noistruct-17h-maho-shoujo-error-bronze.png',
    description: 'NOISTRUCT - Biomecánico / Reliquia Gótica. 17h Maho Shoujo Error Bronze.'
  },
  'sulkian': {
    name: 'SULKIAN',
    imageUrl: 'https://i.postimg.cc/mgLh89V6/sulkian-DS-L-Oₓₓₓ-1.png',
    description: 'SULKIAN - Biomecanoide Tech-Futurista. DS-L-Oₓₓₓ I.'
  },
  'kathonejo': {
    name: 'KATHONEJO',
    imageUrl: 'https://i.postimg.cc/HkYjBM3X/kathonejo-Collage-Kismet-residence.png',
    description: 'KATHONEJO - Modo Cielo Kawaii Místico. Collage Kismet Residence.'
  },
  'arbstein': {
    name: 'ARBSTEIN',
    imageUrl: 'https://i.postimg.cc/13m4JFMq/arbstein-phyloem.png',
    description: 'ARBSTEIN - Orgánico-Viscoso. Phyloem.'
  },
  'sato': {
    name: 'SATO',
    imageUrl: 'https://i.postimg.cc/Vkf5Dt4W/sato-Untitled.png',
    description: 'SATO - Cuaderno de Grafito. Untitled.'
  },
  'alva': {
    name: 'ALVABRINA',
    imageUrl: 'https://i.postimg.cc/c4MrRh78/alva-Yellow-Birth.png',
    description: 'ALVABRINA - Portal Energético. Yellow Birth.'
  },
  'pinkyblue': {
    name: 'PINKYBLU',
    imageUrl: 'https://i.postimg.cc/pTTD77ZD/pinkyblu-Other-sunlights.gif',
    description: 'PINKYBLU - Pixel-Sueño Líquido. Other Sunlights.'
  }
};

// Helper to get artist metadata
function getArtistMetaData(id: string): { name: string; imageUrl: string; description: string } | null {
  return ARTISTS_DATA[id] || null;
}

// Generate artist data object for inline script
function generateArtistDataScript(): string {
  // Use JSON.stringify to properly escape all characters including Unicode
  // This ensures special characters like subscript letters are handled correctly
  const artistDataEntries = Object.keys(ARTISTS_DATA).map((id) => {
    const artist = ARTISTS_DATA[id];
    if (!artist) return null;
    
    // Use JSON.stringify to properly escape all characters
    const idStr = JSON.stringify(id);
    const nameStr = JSON.stringify(artist.name);
    const imageUrlStr = JSON.stringify(artist.imageUrl);
    const descStr = JSON.stringify(artist.description);
    
    // Remove the outer quotes from JSON.stringify since we're building the object manually
    return `          ${idStr}: {
            name: ${nameStr},
            imageUrl: ${imageUrlStr},
            description: ${descStr}
          }`;
  }).filter(Boolean).join(',\n');
  
  return `const artistData = {\n${artistDataEntries}\n        };`;
}

// Base HTML template embedded as string
function getBaseHTML(scriptSrc: string): string {
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
    
    // Use the embedded script reference
    const scriptSrc = SCRIPT_REFERENCE;
    
    // Get base HTML template
    let html: string;
    try {
      html = getBaseHTML(scriptSrc);
    } catch (error: any) {
      console.error('Error generating base HTML:', error?.message || error);
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
    <script type="module" src="${scriptSrc}"></script>
  </body>
</html>`;
    }
    
    // If no artist parameter, serve default HTML as-is
    if (!artistParam) {
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60, max-age=300');
      return res.send(html);
    }
    
    const artist = getArtistMetaData(artistParam);
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
    } catch (error: any) {
      console.error('Error modifying HTML:', error?.message || error);
      // Continue with unmodified HTML
    }
    
    res.setHeader('Content-Type', 'text/html');
    // Set cache headers to allow caching but ensure fresh content for scrapers
    // Use s-maxage for CDN cache and stale-while-revalidate for better performance
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60, max-age=300');
    res.send(html);
  } catch (error: any) {
    console.error('Fatal error in API handler:', error?.message || error, error?.stack);
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
    <pre>${error?.message || 'Unknown error'}</pre>
  </body>
</html>`);
  }
}
