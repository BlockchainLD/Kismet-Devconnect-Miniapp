import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { FarcasterProvider } from './contexts/FarcasterContext';
import { WagmiProvider } from './providers/WagmiProvider';
import { sdk } from '@farcaster/miniapp-sdk';

// Call ready() as early as possible to dismiss splash screen
// This is a backup call in case the one in FarcasterContext doesn't work
if (typeof window !== 'undefined') {
  // Try calling ready() immediately
  const tryReady = async () => {
    try {
      if (sdk?.actions?.ready) {
        await sdk.actions.ready();
        console.log('Early ready() call succeeded');
      }
    } catch (e) {
      console.log('Early ready() call failed:', e);
    }
  };

  // Call immediately if SDK is available
  tryReady();

  // Also try after a short delay as backup
  setTimeout(tryReady, 50);
  setTimeout(tryReady, 200);
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