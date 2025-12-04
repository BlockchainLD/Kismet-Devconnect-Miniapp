import React, { createContext, useContext, useEffect, useState } from 'react';
import sdk from '@farcaster/frame-sdk';
import { FarcasterUser, FarcasterContextType } from '../types';

// Call ready() immediately when SDK loads - critical for desktop Farcaster
// This dismisses the splash screen as soon as possible
try {
  if (typeof window !== 'undefined' && sdk?.actions?.ready) {
    // Use setTimeout to ensure it's called after the page is ready
    setTimeout(() => {
      try {
        sdk.actions.ready();
      } catch (e) {
        console.log('Early ready() call failed:', e);
      }
    }, 0);
  }
} catch (e) {
  console.log('Error setting up early ready() call:', e);
}

const FarcasterContext = createContext<FarcasterContextType>({
  user: null,
  isLoaded: false,
  isContextLoaded: false,
  isConnected: false,
});

export const useFarcaster = () => useContext(FarcasterContext);

export const FarcasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isContextLoaded, setIsContextLoaded] = useState(false);

  useEffect(() => {
    // Call ready() immediately to dismiss splash screen on desktop Farcaster
    // This must be called early, before waiting for context
    try {
      if (sdk?.actions?.ready) {
        sdk.actions.ready();
      }
    } catch (readyError) {
      console.log('Error calling ready() immediately:', readyError);
    }

    const load = async () => {
      try {
        // Check if SDK is available
        if (!sdk || !sdk.context) {
          throw new Error('SDK not available');
        }

        // Add timeout for desktop Farcaster compatibility (some environments may hang)
        const contextPromise = sdk.context;
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Context load timeout')), 3000)
        );
        
        // Attempt to load context - this promise resolves when running in a Frame
        const context = await Promise.race([contextPromise, timeoutPromise]) as any;
        
        if (context?.user) {
          // Access properties safely from the SDK user object
          const u = context.user as any; 
          setUser({
            fid: u.fid,
            username: u.username,
            displayName: u.displayName,
            pfpUrl: u.pfpUrl,
            location: u.location,
            custodyAddress: u.custodyAddress,
            verifications: u.verifications as string[],
          });
          setIsContextLoaded(true);
        }
      } catch (err) {
        // SDK load failed, timeout, or not in frame context - expected behavior
        console.log('Farcaster SDK context not available:', err);
      } finally {
        setIsLoaded(true);
      }
    };

    if (!isLoaded) {
      load();
    }
  }, [isLoaded]);

  return (
    <FarcasterContext.Provider value={{ user, isLoaded, isContextLoaded, isConnected: !!user }}>
      {children}
    </FarcasterContext.Provider>
  );
};