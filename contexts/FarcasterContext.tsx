import React, { createContext, useContext, useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
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
    // Call ready() to dismiss splash screen
    // According to docs: "You should call ready as soon as possible while avoiding jitter and content reflows"
    // "If you're using React, call ready inside a useEffect hook to prevent it from running on every re-render"
    let readyCalled = false;
    
    const callReady = async () => {
      if (readyCalled) return; // Prevent multiple calls
      
      try {
        // Check if SDK and actions are available
        if (sdk && sdk.actions && sdk.actions.ready) {
          await sdk.actions.ready();
          readyCalled = true;
          console.log('ready() called successfully in FarcasterContext');
        } else {
          console.log('SDK not available yet, will retry');
          // Retry after a short delay
          setTimeout(() => {
            if (!readyCalled && sdk?.actions?.ready) {
              sdk.actions.ready().then(() => {
                readyCalled = true;
                console.log('ready() called on retry');
              }).catch(e => console.log('Retry ready() failed:', e));
            }
          }, 100);
        }
      } catch (readyError) {
        console.log('Error calling ready():', readyError);
      }
    };

    // Call ready() immediately when component mounts
    callReady();

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
        
        // Attempt to load context - this promise resolves when running in a Mini App
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
        // SDK load failed, timeout, or not in miniapp context - expected behavior
        console.log('Farcaster SDK context not available:', err);
      } finally {
        setIsLoaded(true);
      }
    };

    if (!isLoaded) {
      load();
    }
  }, []); // Empty deps - only run once on mount

  return (
    <FarcasterContext.Provider value={{ user, isLoaded, isContextLoaded, isConnected: !!user }}>
      {children}
    </FarcasterContext.Provider>
  );
};