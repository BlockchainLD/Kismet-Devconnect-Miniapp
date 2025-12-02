# Image Files Required

Please add the following image files to this `public/` directory:

1. **icon.png** (512x512px recommended)
   - Used as the app icon in Farcaster clients
   - Should be square, high quality
   - Will be served at: `https://kismet-miniapp-2025.vercel.app/icon.png`

2. **image.png** (1200x630px recommended)
   - Used for social sharing (Open Graph, Twitter Cards)
   - Used as the default embed image
   - Should represent your app/brand
   - Will be served at: `https://kismet-miniapp-2025.vercel.app/image.png`

3. **splash.png** (recommended: 1920x1080px or similar)
   - Used as the splash screen when the app loads
   - Should match your app's aesthetic
   - Will be served at: `https://kismet-miniapp-2025.vercel.app/splash.png`

## Notes

- All images will be automatically copied to the `dist/` directory during build
- These files are referenced in:
  - `public/.well-known/farcaster.json` (manifest)
  - `index.html` (embed meta tags)
- The dynamic embed system will use artist artwork images for individual artist profile shares




