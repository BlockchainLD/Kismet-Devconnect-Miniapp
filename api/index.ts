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
  
  // If no artist parameter, redirect to static index.html
  if (!artistParam || !artistData[artistParam]) {
    return res.redirect(302, '/index.html');
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
  const htmlUrl = `${baseUrl}/index.html`;
  
  try {
    const htmlResponse = await fetch(htmlUrl);
    let html = await htmlResponse.text();
    
    // Escape JSON for HTML attributes
    const miniappEmbedJson = JSON.stringify(miniappEmbed).replace(/'/g, "&#39;").replace(/"/g, '&quot;');
    const frameEmbedJson = JSON.stringify(frameEmbed).replace(/'/g, "&#39;").replace(/"/g, '&quot;');
    
    // Replace meta tags - handle single quotes in content attribute
    html = html.replace(
      /<meta name="fc:miniapp" content='[^']*' \/>/,
      `<meta name="fc:miniapp" content='${miniappEmbedJson.replace(/'/g, "&#39;")}' />`
    );
    
    html = html.replace(
      /<meta name="fc:frame" content='[^']*' \/>/,
      `<meta name="fc:frame" content='${frameEmbedJson.replace(/'/g, "&#39;")}' />`
    );
    
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
