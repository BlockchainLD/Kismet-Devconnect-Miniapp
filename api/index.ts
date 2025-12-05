import type { VercelRequest, VercelResponse } from '@vercel/node';

// Artist data mapping (for embed previews)  
const artistData: Record<string, { name: string; imageUrl: string; description: string }> = {
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
    name: 'SULKIAN CORE',
    imageUrl: 'https://i.postimg.cc/mgLh89V6/sulkian-DS-L-Oₓₓₓ-1.png',
    description: 'SULKIAN CORE - Biomecanoide Tech-Futurista. DS-L-Oₓₓₓ I.'
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const artistParam = req.query.artist as string | undefined;
  const baseUrl = 'https://kismet-miniapp-2025.vercel.app';
  
  // Log for debugging
  console.log('API handler called with artist param:', artistParam);
  
  // Always fetch the HTML first
  // In Vercel, static files are in the .vercel/output/static directory or we can read from dist
  let html: string;
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    // Try multiple possible paths for the HTML file
    const possiblePaths = [
      path.join(process.cwd(), 'dist', 'index.html'),
      path.join(process.cwd(), '.vercel', 'output', 'static', 'index.html'),
      path.join('/var/task', 'dist', 'index.html'), // Vercel serverless function path
    ];
    
    let htmlFound = false;
    for (const htmlPath of possiblePaths) {
      try {
        if (fs.existsSync(htmlPath)) {
          html = fs.readFileSync(htmlPath, 'utf-8');
          htmlFound = true;
          console.log('Successfully read HTML from:', htmlPath);
          break;
        }
      } catch (e) {
        // Try next path
        continue;
      }
    }
    
    if (!htmlFound) {
      // Last resort: fetch from a CDN URL that won't trigger our function
      // Use the raw deployment URL to avoid circular dependency
      const deploymentUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : baseUrl;
      const htmlUrl = `${deploymentUrl}/index.html`;
      console.log('Fetching HTML from URL:', htmlUrl);
      const htmlResponse = await fetch(htmlUrl, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (!htmlResponse.ok) {
        throw new Error(`Failed to fetch HTML: ${htmlResponse.status}`);
      }
      html = await htmlResponse.text();
    }
  } catch (error) {
    console.error('Error fetching HTML:', error);
    // Don't redirect - return error response so we can debug
    res.status(500).json({ 
      error: 'Failed to load HTML', 
      message: error instanceof Error ? error.message : 'Unknown error',
      artistParam 
    });
    return;
  }
  
  // If no artist parameter, serve default HTML as-is
  if (!artistParam || !artistData[artistParam]) {
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  }
  
  const artist = artistData[artistParam];
  const artistUrl = `${baseUrl}?artist=${artistParam}`;
  
  // Build miniapp embed JSON
  const miniappEmbed = {
    version: "1",
    imageUrl: artist.imageUrl,
    button: {
      title: `View ${artist.name}`,
      action: {
        type: "launch_miniapp",
        url: artistUrl,
        name: "Based House Collection",
        splashImageUrl: `${baseUrl}/splash.png`,
        splashBackgroundColor: "#000000"
      }
    }
  };
  
  const frameEmbed = JSON.parse(JSON.stringify(miniappEmbed));
  frameEmbed.button.action.type = "launch_frame";
  
  // HTML is already fetched above, now modify it
  try {
    // Escape JSON for HTML attributes
    // The HTML uses single quotes: content='...', so we need to escape single quotes in the JSON
    const miniappEmbedJson = JSON.stringify(miniappEmbed).replace(/'/g, "&#39;");
    const frameEmbedJson = JSON.stringify(frameEmbed).replace(/'/g, "&#39;");
    
    console.log('Original HTML length:', html.length);
    console.log('Miniapp embed JSON:', miniappEmbedJson.substring(0, 100));
    
    // Replace meta tags - the HTML uses single quotes: content='...'
    // Match the exact format from the HTML
    const fcMiniappRegex = /<meta name="fc:miniapp" content='[^']*' \/>/;
    const fcFrameRegex = /<meta name="fc:frame" content='[^']*' \/>/;
    
    if (fcMiniappRegex.test(html)) {
      html = html.replace(fcMiniappRegex, `<meta name="fc:miniapp" content='${miniappEmbedJson}' />`);
      console.log('Replaced fc:miniapp meta tag');
    } else {
      console.log('WARNING: fc:miniapp meta tag not found in HTML');
    }
    
    if (fcFrameRegex.test(html)) {
      html = html.replace(fcFrameRegex, `<meta name="fc:frame" content='${frameEmbedJson}' />`);
      console.log('Replaced fc:frame meta tag');
    } else {
      console.log('WARNING: fc:frame meta tag not found in HTML');
    }
    
    // Replace other meta tags
    const escapedName = artist.name.replace(/"/g, '&quot;');
    const escapedDesc = artist.description.replace(/"/g, '&quot;');
    
    html = html.replace(
      /<meta property="og:title" content="[^"]*" \/>/,
      `<meta property="og:title" content="${escapedName} | Based House Collection" />`
    );
    
    html = html.replace(
      /<meta property="og:description" content="[^"]*" \/>/,
      `<meta property="og:description" content="${escapedDesc} Explore this artist's work in the Kismet Casa x Basehouse residency exhibition." />`
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
      `<meta name="twitter:title" content="${escapedName} | Based House Collection" />`
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
      `<title>${artist.name} | Based House Collection</title>`
    );
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(html);
  } catch (error) {
    console.error('Error fetching/modifying HTML:', error);
    // Fallback: redirect to static HTML
    res.redirect(302, '/index.html');
  }
}
