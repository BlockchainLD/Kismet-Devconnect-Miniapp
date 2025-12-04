import React, { Component, ErrorInfo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { FarcasterProvider } from './contexts/FarcasterContext';
import { WagmiProvider } from './providers/WagmiProvider';
import { sdk } from '@farcaster/miniapp-sdk';

// Error Boundary to ensure ready() is called even if app crashes
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ App error caught:', error, errorInfo);
    // Call ready() even if app errors to dismiss splash screen
    try {
      if (sdk?.actions?.ready) {
        sdk.actions.ready().catch(e => console.error('Error calling ready() in error boundary:', e));
      }
    } catch (e) {
      console.error('Failed to call ready() in error boundary:', e);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'white', background: 'black', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>Something went wrong. Please refresh.</div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Comprehensive ready() call with extensive logging
// This is a backup call - inline script in index.html should handle it first
if (typeof window !== 'undefined') {
  console.log('=== MINIAPP INITIALIZATION ===');
  console.log('Window:', typeof window);
  console.log('Parent window:', window.parent !== window ? 'iframe' : 'top-level');
  console.log('SDK available:', !!sdk);
  console.log('SDK.actions available:', !!sdk?.actions);
  console.log('SDK.actions.ready available:', !!sdk?.actions?.ready);
  
  const tryReady = async (attempt = 1) => {
    try {
      if (sdk?.actions?.ready) {
        console.log(`Calling ready() - attempt ${attempt}`);
        await sdk.actions.ready();
        console.log('✅ ready() succeeded in index.tsx');
      } else {
        console.warn(`⚠️ SDK not ready - attempt ${attempt}`);
        if (attempt < 3) {
          setTimeout(() => tryReady(attempt + 1), 100 * attempt);
        }
      }
    } catch (error) {
      console.error(`❌ ready() failed - attempt ${attempt}:`, error);
      if (attempt < 3) {
        setTimeout(() => tryReady(attempt + 1), 100 * attempt);
      }
    }
  };
  
  // Try immediately
  tryReady();
  
  // Also try after React renders
  setTimeout(() => tryReady(2), 200);
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
  <ErrorBoundary>
    <WagmiProvider>
      <FarcasterProvider>
        <App />
      </FarcasterProvider>
    </WagmiProvider>
  </ErrorBoundary>
);

root.render(isDevelopment ? <React.StrictMode>{AppWrapper}</React.StrictMode> : AppWrapper);