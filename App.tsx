import React, { useState, Suspense, lazy, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BackgroundLayer } from './components/BackgroundLayer';
import { CustomCursor } from './components/CustomCursor';
import { ARTISTS, THEMES, getAllArtworks } from './constants';
import { ArtistId, Artwork } from './types';
import { X, Cpu, Play, SkipForward } from 'lucide-react';
import { useFarcaster } from './contexts/FarcasterContext';
import { updateMetaTags, resetMetaTags } from './utils/metaTags';

// Lazy load heavy components
const ConstellationMap = lazy(() => import('./components/ConstellationMap').then(module => ({ default: module.ConstellationMap })));
const ArtistView = lazy(() => import('./components/ArtistView').then(module => ({ default: module.ArtistView })));

// --- ASSET PRELOADER HELPER ---
const preloadImages = (urls: string[]) => {
  urls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
};

// --- COMPONENT: CINEMA OVERLAY (THE FILM - CLEAN VIEW) ---
const CinemaOverlay = ({ onComplete }: { onComplete: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
     // Auto-play attempt on mount
     const vid = videoRef.current;
     if (vid) {
         vid.currentTime = 0;
         const playPromise = vid.play();
         if (playPromise !== undefined) {
             playPromise
                .then(() => setIsPlaying(true))
                .catch(error => console.log("Auto-play prevented:", error));
         }
     }
  }, []);

  return (
    <motion.div
        key="cinema-video"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] bg-black flex items-center justify-center overflow-hidden"
    >
        {/* VIDEO CONTAINER - SCALING FIX: object-contain ensures full video is seen */}
        <div className="absolute inset-0 flex items-center justify-center bg-black">
            <video 
                ref={videoRef}
                className="w-full h-full object-contain"
                src="https://github.com/julkitomal/kismet-mini-app-final/raw/main/public/intro.mp4"
                playsInline
                preload="auto"
                controls={false} // No controls, pure cinema
                onEnded={onComplete}
            />
        </div>

        {/* CONTROLS - CENTERED BOTTOM */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[60] flex items-center justify-center">
            <button
                onClick={onComplete}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white hover:text-white text-xs font-mono uppercase tracking-widest transition-all rounded-full"
            >
                <span>Skip / Enter System</span>
                <SkipForward size={14} />
            </button>
        </div>
    </motion.div>
  );
};

// --- COMPONENT: INTRO LOADER (BOOT SEQUENCE) ---
const IntroLoader = ({ onReady }: { onReady: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const { user, isContextLoaded } = useFarcaster();
  const userRef = useRef(user);
  const isContextLoadedRef = useRef(isContextLoaded);
  
  // Keep refs in sync with latest values
  useEffect(() => {
    userRef.current = user;
    isContextLoadedRef.current = isContextLoaded;
  }, [user, isContextLoaded]);
  
  // Cybernetic boot logs - Updated with Base Network references
  const systemLogs = [
    "INITIALIZING KISMET_OS KERNEL...",
    "HANDSHAKE: BASE_MAINNET [L2]...",
    "VERIFYING ONCHAIN IDENTITY...",
    "DECRYPTING ARTIST_NODES...",
    "LOADING NEURAL TEXTURES...",
    "ALLOCATING MEMORY BLOCKS...",
    "SYNCING WITH ZORA PROTOCOL...",
    "SMART_WALLET CONNECTED...",
    "BRIDGE ESTABLISHED: ETH <-> BASE...",
    "SYSTEM READY."
  ];

  useEffect(() => {
    // 1. Start Preloading Critical Assets
    const profileImages = Object.values(ARTISTS).map(a => a.profileImage).filter(Boolean) as string[];
    const artworkImages = Object.values(ARTISTS).map(a => a.mainArtwork.imageUrl);
    preloadImages([...profileImages, ...artworkImages]);

    // 2. Simulate Loading Progress
    const duration = 3500; // 3.5 seconds boot time
    const interval = 30; 
    const steps = duration / interval;
    let currentStep = 0;
    let userLogInjected = false;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min(100, (currentStep / steps) * 100);
      setProgress(newProgress);

      // Add random logs based on progress
      if (Math.random() > 0.85 && currentStep < steps) {
         const randomLog = systemLogs[Math.floor(Math.random() * systemLogs.length)];
         const timestamp = new Date().toISOString().split('T')[1].slice(0,8);
         setLogs(prev => [`[${timestamp}] ${randomLog}`, ...prev].slice(0, 6));
      }

      // Inject Farcaster User log if detected (only once, using refs for latest values)
      if (!userLogInjected && currentStep === Math.floor(steps * 0.5) && isContextLoadedRef.current && userRef.current) {
        userLogInjected = true;
        const currentUser = userRef.current;
        const timestamp = new Date().toISOString().split('T')[1].slice(0,8);
        setLogs(prev => [`[${timestamp}] ID_VERIFIED: @${currentUser.username?.toUpperCase()}`, ...prev].slice(0, 6));
        
        // Inject Wallet Log if available
        if (currentUser.verifications?.[0] || currentUser.custodyAddress) {
             const addr = currentUser.verifications?.[0] || currentUser.custodyAddress;
             const shortAddr = addr ? `${addr.slice(0,6)}...${addr.slice(-4)}` : '0x...';
             setTimeout(() => {
                 setLogs(prev => [`[${timestamp}] WALLET_CONNECTED: ${shortAddr}`, ...prev].slice(0, 6));
             }, 300);
        }
      }

      if (currentStep >= steps) {
        clearInterval(timer);
        setIsReady(true);
      }
    }, interval);

    // Safety timeout: always complete after max 6 seconds regardless of progress
    const safetyTimeout = setTimeout(() => {
      clearInterval(timer);
      setIsReady(true);
    }, 6000);

    return () => {
      clearInterval(timer);
      clearTimeout(safetyTimeout);
    };
  }, []); // Empty deps - only run once on mount, don't restart on context changes

  return (
    <motion.div 
      className="fixed inset-0 z-[9999] bg-black text-white font-mono flex flex-col items-center justify-center overflow-hidden"
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* Background Grid/Scanlines with Blue tint for Base */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(0,82,255,0.03),rgba(0,255,0,0.02),rgba(0,82,255,0.03))] z-0 bg-[length:100%_2px,3px_100%] pointer-events-none" />
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0052FF]/30 via-black to-black" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-8">
        
        {/* BRAND LOCKUP: KISMET x BASE */}
        <div className="flex items-center justify-center gap-6 md:gap-10 mb-12">
            
            {/* Kismet Logo */}
            <div className="relative group">
                <div className="absolute -inset-4 bg-green-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-50 transition-opacity" />
                <img 
                    src="https://i.postimg.cc/y65m8qp8/Kismet-Iso-Color-2.png" 
                    alt="Kismet Logo" 
                    className="w-20 md:w-32 object-contain relative z-10 mix-blend-screen opacity-90"
                />
            </div>

            {/* X Separator */}
            <div className="text-white/30 font-thin text-2xl md:text-3xl">×</div>

            {/* Base Logo (The Square) */}
            <div className="relative group flex flex-col items-center justify-center">
                {/* Glow */}
                <div className="absolute inset-0 bg-[#0052FF] blur-[20px] opacity-40 animate-pulse rounded-none" />
                
                {/* The Base Square */}
                <div className="w-16 h-16 md:w-20 md:h-20 bg-[#0052FF] rounded-none relative z-10 shadow-[0_0_20px_rgba(0,82,255,0.6)] flex items-center justify-center overflow-hidden">
                    {/* Inner highlight for 3D feel */}
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white blur-lg opacity-30 rounded-none" />
                </div>
            </div>
        </div>

        {/* LOADING BAR (Gradient Green to Base Blue) */}
        <div className="w-full h-1 bg-gray-900 border border-white/10 rounded-full overflow-hidden relative mb-4">
          <motion.div 
            className="h-full bg-gradient-to-r from-green-400 via-[#0052FF] to-[#0052FF] shadow-[0_0_15px_rgba(0,82,255,0.8)]"
            style={{ width: `${progress}%` }}
          />
          {/* Scanning light on bar */}
          <div className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-[shimmer_1s_infinite]" style={{ left: `${progress}%`, transform: 'translateX(-50%)' }} />
        </div>

        {/* PERCENTAGE & STATUS */}
        <div className="w-full flex justify-between text-[10px] uppercase tracking-widest mb-8 text-[#0052FF]/80 font-bold">
           <span>{user ? `Welcome_User: @${user.username}` : 'Establishing_Connection'}</span>
           <span>{Math.round(progress)}%</span>
        </div>

            {!isReady ? (
                <>
                    {/* LOADING BAR */}
                    <div className="w-full h-1 bg-gray-900 border border-white/10 rounded-full overflow-hidden relative mb-4">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-green-400 via-[#0052FF] to-[#0052FF] shadow-[0_0_15px_rgba(0,82,255,0.8)]"
                            style={{ width: `${progress}%` }}
                        />
                        {/* Scanning light on bar */}
                        <div className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-[shimmer_1s_infinite]" style={{ left: `${progress}%`, transform: 'translateX(-50%)' }} />
                    </div>
                    <div className="w-full flex justify-between text-[10px] uppercase tracking-widest mb-8 text-[#0052FF]/80 font-bold">
                        <span>{user ? `Welcome_User: @${user.username}` : 'Establishing_Connection'}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    {/* LOGS */}
                    <div className="w-full h-24 border-t border-[#0052FF]/20 pt-4 flex flex-col justify-end overflow-hidden mask-image-gradient bg-black/50 backdrop-blur-sm rounded-b-lg">
                    {logs.map((log, i) => (
                        <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1 - (i * 0.15), x: 0 }} 
                        className="text-[9px] md:text-[10px] whitespace-nowrap text-white/70 font-mono leading-relaxed px-2"
                        >
                        <span className="text-[#0052FF] mr-2">➜</span>
                        {log}
                        </motion.div>
                    ))}
                    </div>
                </>
            ) : (
                /* READY BUTTON */
                <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onReady}
                    className="group relative px-8 py-4 bg-transparent border border-[#0052FF] text-[#0052FF] font-mono text-sm tracking-[0.3em] uppercase overflow-hidden hover:bg-[#0052FF] hover:text-white transition-all duration-300 cursor-pointer"
                >
                    <span className="relative z-10 font-bold flex items-center gap-3">
                        <Play size={16} className="fill-current" />
                        Initialize System
                    </span>
                    <div className="absolute inset-0 bg-[#0052FF]/20 blur-xl group-hover:bg-[#0052FF]/60 transition-all" />
                </motion.button>
            )}
        </motion.div>
      </div>
    </motion.div>
  );
};

// --- COMPONENT: TRANSITION LOADER (BETWEEN SCREENS) ---
const TransitionLoader = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-[9990]">
     {/* Scanline overlay */}
     <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)_50%,rgba(0,0,0,0.2)_50%,rgba(0,0,0,0.2))] bg-[length:100%_4px] pointer-events-none z-20 opacity-20" />
    
    <div className="relative flex items-center justify-center mb-8">
       {/* Tech Ring - Updated to Base Blue */}
       <div className="w-16 h-16 border border-[#0052FF]/30 rounded-full border-t-[#0052FF] animate-spin" />
       <div className="absolute w-12 h-12 border border-white/10 rounded-full border-b-white/50 animate-spin direction-reverse" style={{ animationDirection: 'reverse', animationDuration: '3s' }} />
       <Cpu size={20} className="absolute text-[#0052FF] animate-pulse" />
    </div>
    
    <div className="flex flex-col items-center gap-1">
      <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#0052FF]/80 animate-pulse">
         Processing_Data
      </div>
      <div className="h-0.5 w-24 bg-gray-900 rounded overflow-hidden mt-2">
         <div className="h-full bg-[#0052FF] w-1/2 animate-[loading_1s_infinite_ease-in-out]" />
      </div>
    </div>
  </div>
);

function App() {
  // App States
  const [isBooted, setIsBooted] = useState(false); // Has the intro loader finished?
  const [showCinema, setShowCinema] = useState(false); // Are we watching the film?
  const [hasWatchedIntro, setHasWatchedIntro] = useState(false); // Have we seen it once?
  const [activeArtistId, setActiveArtistId] = useState<ArtistId | null>(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [presentationIndex, setPresentationIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Handlers
  const handleBootComplete = () => {
    setIsBooted(true);
    setShowCinema(true); // Start film immediately after boot
  };

  const handleCinemaComplete = () => {
    setShowCinema(false);
    setHasWatchedIntro(true);
  };

  // Re-trigger film from ConstellationMap
  const handlePlayVideo = () => {
      setShowCinema(true);
  };

  // Handle deep links from shared artist profile URLs
  // Check URL parameter early and update meta tags immediately for proper embed previews
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    const artistParam = params.get('artist') as ArtistId | null;
    
    // If URL has artist parameter, update meta tags immediately (even before app loads)
    // This ensures embed previews show the correct artwork
    if (artistParam && artistParam in ARTISTS) {
      const artist = ARTISTS[artistParam];
      const currentWork = artist.mainArtwork;
      
      // Update meta tags immediately for embed preview
      updateMetaTags({
        title: `${artist.name} | Based House Collection`,
        description: `${artist.name} - ${artist.shortDescription}. ${currentWork.title}. Explore this artist's work in the Kismet Casa x Basehouse residency exhibition.`,
        imageUrl: currentWork.imageUrl,
        url: `https://kismet-miniapp-2025.vercel.app?artist=${artist.id}`,
        buttonTitle: `View ${artist.name}`,
        splashImageUrl: 'https://kismet-miniapp-2025.vercel.app/splash.png',
        splashBackgroundColor: '#000000',
        appName: 'Based House Collection'
      });
      
      // Navigate to artist once app is loaded
      if (isBooted && !showCinema && artistParam !== activeArtistId) {
        setActiveArtistId(artistParam);
      }
    }
  }, [isBooted, showCinema, activeArtistId]);

  // Also listen for browser back/forward navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const artistParam = params.get('artist') as ArtistId | null;
      
      if (artistParam && artistParam in ARTISTS) {
        setActiveArtistId(artistParam);
      } else if (!artistParam) {
        setActiveArtistId(null);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Gather all artworks for presentation mode
  const allArtworks = useMemo(() => {
    const works: { work: Artwork, artistName: string, artistId: ArtistId }[] = [];
    Object.values(ARTISTS).forEach(artist => {
       const list = [artist.mainArtwork, ...(artist.gallery || [])];
       list.forEach(w => works.push({ work: w, artistName: artist.name, artistId: artist.id }));
    });
    return works.sort(() => Math.random() - 0.5);
  }, []);

  // Automatic cycling for presentation mode
  useEffect(() => {
    if (!isPresentationMode) return;
    const interval = setInterval(() => {
      setPresentationIndex(prev => (prev + 1) % allArtworks.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPresentationMode, allArtworks.length]);

  const handleArtistSelect = (id: ArtistId) => {
    setActiveArtistId(id);
    // Update URL for deep linking
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('artist', id);
      window.history.pushState({}, '', url.toString());
    }
  };

  const handleBackToMap = () => {
    setActiveArtistId(null);
    // Clear URL parameter when returning to map
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('artist');
      window.history.pushState({}, '', url.toString());
    }
  };

  // Update meta tags dynamically when viewing an artist
  useEffect(() => {
    if (activeArtistId) {
      const artist = ARTISTS[activeArtistId];
      const currentWork = artist.mainArtwork;
      
      // Update meta tags with artist-specific information
      updateMetaTags({
        title: `${artist.name} | Based House Collection`,
        description: `${artist.name} - ${artist.shortDescription}. ${currentWork.title}. Explore this artist's work in the Kismet Casa x Basehouse residency exhibition.`,
        imageUrl: currentWork.imageUrl, // Use the artist's main artwork as the share image
        url: `https://kismet-miniapp-2025.vercel.app?artist=${artist.id}`, // Deep link to artist profile
        buttonTitle: `View ${artist.name}`,
        splashImageUrl: 'https://kismet-miniapp-2025.vercel.app/splash.png',
        splashBackgroundColor: '#000000',
        appName: 'Based House Collection'
      });
    } else {
      // Reset to default (home page) meta tags
      resetMetaTags();
    }
  }, [activeArtistId]);

  const handleTogglePresentation = () => {
     setIsPresentationMode(!isPresentationMode);
     setPresentationIndex(0);
  };
  
  const handleImageClick = (url: string) => {
      setLightboxImage(url);
  };

  const activeTheme = activeArtistId ? THEMES[activeArtistId] : null;

  return (
    <div className="relative w-full h-full overflow-hidden bg-transparent">
      <CustomCursor />
      
      {/* 1. INITIAL BOOT LOADER */}
      <AnimatePresence>
        {!isBooted && (
          <IntroLoader onReady={handleBootComplete} />
        )}
      </AnimatePresence>

      {/* 2. CINEMA MODE OVERLAY (Can be triggered anytime) */}
      <AnimatePresence>
        {showCinema && (
            <CinemaOverlay onComplete={handleCinemaComplete} />
        )}
      </AnimatePresence>

      {/* The Living Background Layer */}
      <BackgroundLayer activeTheme={activeTheme} />

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {lightboxImage && (
            <motion.div
                key="lightbox"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
                onClick={() => setLightboxImage(null)}
            >
                <div className="absolute top-6 right-6 z-[201] p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer">
                    <X size={24} />
                </div>
                <motion.img 
                    src={lightboxImage}
                    alt="Fullscreen view"
                    className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()} 
                />
            </motion.div>
        )}
      </AnimatePresence>

      {/* Presentation Mode Overlay */}
      <AnimatePresence>
        {isPresentationMode && !lightboxImage && (
           <motion.div 
              key="presentation"
              className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
           >
              <button 
                onClick={handleTogglePresentation}
                className="absolute top-6 right-6 z-[101] p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>

              <AnimatePresence mode="wait">
                 <motion.div 
                   key={allArtworks[presentationIndex].work.id}
                   className="relative w-full h-full flex flex-col items-center justify-center p-4"
                   initial={{ opacity: 0, scale: 1.05 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0 }}
                   transition={{ duration: 1, ease: "easeInOut" }}
                 >
                    <img 
                       src={allArtworks[presentationIndex].work.imageUrl}
                       alt={allArtworks[presentationIndex].work.title}
                       className="max-w-full max-h-[85vh] object-contain drop-shadow-2xl"
                    />
                    
                    <div className="absolute bottom-8 left-0 right-0 text-center">
                       <h2 className="text-white text-xl md:text-2xl font-light tracking-[0.3em] uppercase mb-1">
                          {allArtworks[presentationIndex].artistName}
                       </h2>
                       <p className="text-white/50 text-xs md:text-sm font-mono tracking-widest">
                          {allArtworks[presentationIndex].work.title}
                       </p>
                    </div>
                 </motion.div>
              </AnimatePresence>
           </motion.div>
        )}
      </AnimatePresence>

      {/* 5. MAIN CONTENT - Only rendered after boot AND once intro is watched (or skipped) */}
      {isBooted && !showCinema && (
        <AnimatePresence mode="wait">
          {!activeArtistId ? (
            <motion.div
              key="map"
              initial={{ opacity: 0, filter: 'blur(20px)', scale: 1.1 }}
              animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="absolute inset-0 w-full h-full will-change-transform z-10"
            >
              <Suspense fallback={<TransitionLoader />}>
                <ConstellationMap 
                    onSelectArtist={handleArtistSelect} 
                    onTogglePresentation={handleTogglePresentation}
                    onImageClick={handleImageClick}
                    onPlayVideo={handlePlayVideo}
                />
              </Suspense>
            </motion.div>
          ) : (
            <motion.div
              key="artist"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 w-full h-full overflow-hidden z-50 will-change-opacity"
            >
              <Suspense fallback={<TransitionLoader />}>
                <ArtistView 
                    artist={ARTISTS[activeArtistId]} 
                    theme={THEMES[activeArtistId]} 
                    onBack={handleBackToMap}
                    onImageClick={handleImageClick}
                />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      )}
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes shimmer {
            0% { transform: translateX(-150%) skewX(-20deg); }
            100% { transform: translateX(150%) skewX(-20deg); }
        }
      `}</style>
    </div>
  );
}

export default App;