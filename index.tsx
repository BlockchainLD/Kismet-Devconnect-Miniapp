import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { FarcasterProvider } from './contexts/FarcasterContext';
import { WagmiProvider } from './providers/WagmiProvider';

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