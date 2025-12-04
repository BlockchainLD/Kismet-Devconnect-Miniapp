import React, { createContext, useContext, useEffect, useState } from 'react';
import sdk from '@farcaster/frame-sdk';
import { FarcasterUser, FarcasterContextType } from '../types';

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
    const load = async () => {
      try {
        // Check if SDK is available
        if (!sdk || !sdk.context) {
          throw new Error('SDK not available');
        }

        // Add timeout for desktop Farcaster compatibility (some environments may hang)
        const contextPromise = sdk.context;
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Context load timeout')), 5000)
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
        // Always call ready() to signal the app is loaded, even if context failed
        // This is critical for desktop Farcaster compatibility
        try {
          if (sdk?.actions?.ready) {
            sdk.actions.ready();
          }
        } catch (readyError) {
          console.log('Error calling ready():', readyError);
        }
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