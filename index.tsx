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

// ready() is now handled in FarcasterContext.tsx to avoid duplicate calls

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