import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { FarcasterProvider } from './contexts/FarcasterContext';
import { WagmiProvider } from './providers/WagmiProvider';
import sdk from '@farcaster/frame-sdk';

// Call ready() as early as possible to dismiss splash screen on desktop Farcaster
// This is critical - desktop Farcaster may not show the app until ready() is called
if (typeof window !== 'undefined') {
  // Call immediately when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      try {
        if (sdk?.actions?.ready) {
          sdk.actions.ready();
        }
      } catch (e) {
        console.log('Error calling ready() on DOMContentLoaded:', e);
      }
    });
  } else {
    // DOM already loaded, call immediately
    try {
      if (sdk?.actions?.ready) {
        sdk.actions.ready();
      }
    } catch (e) {
      console.log('Error calling ready() immediately:', e);
    }
  }
  
  // Also call after a short delay as backup
  setTimeout(() => {
    try {
      if (sdk?.actions?.ready) {
        sdk.actions.ready();
      }
    } catch (e) {
      // Ignore errors in backup call
    }
  }, 100);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <WagmiProvider>
      <FarcasterProvider>
        <App />
      </FarcasterProvider>
    </WagmiProvider>
  </React.StrictMode>
);