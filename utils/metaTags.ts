/**
 * Utility for dynamically updating meta tags for Farcaster embeds and social sharing
 * Following Farcaster spec: https://miniapps.farcaster.xyz/docs/guides/sharing
 */

export interface MetaTagConfig {
  title?: string;
  description?: string;
  imageUrl?: string;
  url?: string;
  buttonTitle?: string;
  splashImageUrl?: string;
  splashBackgroundColor?: string;
  appName?: string;
}

interface MiniAppEmbed {
  version: string;
  imageUrl: string;
  button: {
    title: string;
    action: {
      type: string;
      url?: string;
      name?: string;
      splashImageUrl?: string;
      splashBackgroundColor?: string;
    };
  };
}

/**
 * Updates or creates a meta tag in the document head
 */
function setMetaTag(property: string, content: string, isProperty = true) {
  const attribute = isProperty ? 'property' : 'name';
  let meta = document.querySelector(`meta[${attribute}="${property}"]`);
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, property);
    document.head.appendChild(meta);
  }
  
  meta.setAttribute('content', content);
}

/**
 * Updates all meta tags for Farcaster embeds and social sharing
 * Uses the correct Farcaster format: fc:miniapp with stringified JSON
 */
export function updateMetaTags(config: MetaTagConfig) {
  const {
    title = 'Based House Collection',
    description = 'An immersive, experimental digital exhibition space for the Kismet Casa x Basehouse residency artists.',
    imageUrl = 'https://kismet-miniapp-2025.vercel.app/image.png',
    url = 'https://kismet-miniapp-2025.vercel.app',
    buttonTitle = 'Explore Kismet',
    splashImageUrl = 'https://kismet-miniapp-2025.vercel.app/splash.png',
    splashBackgroundColor = '#000000',
    appName = 'Based House Collection'
  } = config;

  // Update page title
  if (title) {
    document.title = title;
  }

  // Build Farcaster Mini App Embed JSON object
  const miniappEmbed: MiniAppEmbed = {
    version: "1",
    imageUrl: imageUrl,
    button: {
      title: buttonTitle,
      action: {
        type: "launch_miniapp",
        url: url,
        name: appName,
        splashImageUrl: splashImageUrl,
        splashBackgroundColor: splashBackgroundColor
      }
    }
  };

  // Set fc:miniapp meta tag with stringified JSON (correct format per Farcaster spec)
  const embedJson = JSON.stringify(miniappEmbed);
  setMetaTag('fc:miniapp', embedJson, false);
  
  // Backward compatibility with fc:frame
  const frameEmbed = { ...miniappEmbed };
  frameEmbed.button.action.type = 'launch_frame';
  setMetaTag('fc:frame', JSON.stringify(frameEmbed), false);

  // Open Graph Meta Tags
  setMetaTag('og:title', title);
  setMetaTag('og:description', description);
  setMetaTag('og:image', imageUrl);
  setMetaTag('og:url', url);
  setMetaTag('og:type', 'website');

  // Twitter Card Meta Tags
  setMetaTag('twitter:card', 'summary_large_image', false);
  setMetaTag('twitter:title', title, false);
  setMetaTag('twitter:description', description, false);
  setMetaTag('twitter:image', imageUrl, false);
}

/**
 * Resets meta tags to default (home page) values
 */
export function resetMetaTags() {
  updateMetaTags({
    title: 'Based House Collection',
    description: 'An immersive, experimental digital exhibition space for the Kismet Casa x Basehouse residency artists. A living interface that morphs to match the aesthetic soul of each creator.',
    imageUrl: 'https://kismet-miniapp-2025.vercel.app/image.png',
    url: 'https://kismet-miniapp-2025.vercel.app',
    buttonTitle: 'Explore Kismet',
    splashImageUrl: 'https://kismet-miniapp-2025.vercel.app/splash.png',
    splashBackgroundColor: '#000000',
    appName: 'Based House Collection'
  });
}

