import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { FarcasterProvider } from './contexts/FarcasterContext';
import { WagmiProvider } from './providers/WagmiProvider';
import { sdk } from '@farcaster/miniapp-sdk';

// Call ready() as early as possible - backup call
// The inline script in index.html should handle it first, but this is a fallback
if (typeof window !== 'undefined' && sdk?.actions?.ready) {
  // Try calling ready() immediately
  sdk.actions.ready().catch(() => {
    // Retry after a short delay
    setTimeout(() => {
      if (sdk?.actions?.ready) {
        sdk.actions.ready().catch(() => {});
      }
    }, 50);
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
// Remove StrictMode for production to avoid double renders that might interfere with ready()
// StrictMode causes components to render twice in development
const isDevelopment = import.meta.env.DEV;
const AppWrapper = (
  <WagmiProvider>
    <FarcasterProvider>
      <App />
    </FarcasterProvider>
  </WagmiProvider>
);

root.render(isDevelopment ? <React.StrictMode>{AppWrapper}</React.StrictMode> : AppWrapper);