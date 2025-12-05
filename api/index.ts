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
  
  // If no artist parameter, serve default HTML (don't redirect, just serve static)
  if (!artistParam || !artistData[artistParam]) {
    // For root URL without artist param, we want to serve the default HTML
    // But we need to fetch it first
    try {
      const htmlResponse = await fetch(`${baseUrl}/index.html`);
      const html = await htmlResponse.text();
      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    } catch (error) {
      console.error('Error fetching default HTML:', error);
      return res.redirect(302, '/index.html');
    }
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
  
  // Fetch the original HTML and modify meta tags
  // Try to fetch from the static file, with fallback to production URL
  let html: string;
  
  try {
    // First, try to read from the static file system (if available in Vercel)
    // If that fails, fetch from the production URL
    try {
      const fs = await import('fs');
      const path = await import('path');
      const htmlPath = path.join(process.cwd(), 'dist', 'index.html');
      html = fs.readFileSync(htmlPath, 'utf-8');
    } catch (fsError) {
      // Fallback: fetch from production URL
      const htmlUrl = `${baseUrl}/index.html`;
      const htmlResponse = await fetch(htmlUrl);
      html = await htmlResponse.text();
    }
    
    // Escape JSON for HTML attributes
    // The HTML uses single quotes: content='...', so we need to escape single quotes in the JSON
    // But the JSON itself uses double quotes, so we just need to escape any single quotes that might appear
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
