# Video File Required

The `intro.mp4` file is required for the CinemaOverlay feature to work.

## To add the video:

1. Place the video file in this directory (`public/intro.mp4`)
2. The file should be named exactly `intro.mp4`
3. Vite will automatically copy it to `dist/` during build
4. It will be served at `/intro.mp4` on Vercel

## Current fallback behavior:

If the video file is not found, the app will:
1. Try `/intro.mp4` (local file)
2. Try `https://kismet-miniapp-2025.vercel.app/intro.mp4` (Vercel CDN)
3. Try GitHub raw URL as final fallback

## Video specifications:

- Format: MP4
- Recommended: H.264 codec for maximum compatibility
- The video will be displayed fullscreen in the CinemaOverlay component
