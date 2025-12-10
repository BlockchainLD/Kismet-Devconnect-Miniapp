import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ARTISTS, THEMES, getAllArtworks, RESIDENCY_PHOTOS } from '../constants';
import { ArtistId } from '../types';
import { Play, X as CloseIcon, ExternalLink, Sparkles, Image as ImageIcon, Film, ShoppingBag } from 'lucide-react';
import { useFarcaster } from '../contexts/FarcasterContext';

interface ConstellationMapProps {
  onSelectArtist: (id: ArtistId) => void;
  onTogglePresentation?: () => void;
  onImageClick?: (url: string) => void;
  onPlayVideo?: () => void;
}

// --- SUB COMPONENT: Floating Artwork with Glitch Effect & Loader ---
const FloatingArtwork: React.FC<{ art: any, index: number, onClick?: (url: string) => void }> = ({ art, index, onClick }) => {
  const [isActive, setIsActive] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Random glitch effect: occasionally turn full color and opaque
    const triggerGlitch = () => {
      // 10% chance to trigger, check every 2-5 seconds
      const duration = Math.random() * 2000 + 500; // Stay active for 0.5s to 2.5s
      setIsActive(true);
      setTimeout(() => setIsActive(false), duration);
    };

    const loop = () => {
        const delay = Math.random() * 10000 + 2000; // Random interval between 2s and 12s
        setTimeout(() => {
            if (Math.random() > 0.6) triggerGlitch(); // 40% chance to trigger when interval hits
            loop();
        }, delay);
    };

    loop();
  }, []);

  return (
    <div
      onClick={(e) => {
          e.stopPropagation();
          onClick && onClick(art.imageUrl);
      }}
      className={`absolute transition-all duration-700 ease-in-out will-change-transform cursor-pointer pointer-events-auto
        ${isActive ? 'grayscale-0 opacity-90 z-10 scale-110' : 'grayscale opacity-20 z-0 scale-100 hover:opacity-60 hover:scale-105 hover:grayscale-0'}
      `}
      style={{
        left: `${(index * 25) + 5}%`,
        top: `${(index % 2 === 0 ? 15 : 65)}%`,
        animation: `float ${25 + index * 5}s infinite ease-in-out alternate`
      }}
    >
      {/* Skeleton Loader */}
      {!isLoaded && (
        <div className="w-32 h-32 bg-white/5 animate-pulse rounded-lg border border-white/10 absolute inset-0" />
      )}

      <img 
        src={art.imageUrl} 
        alt="" 
        className={`w-32 h-32 object-contain rounded-lg transition-all duration-700 ${isActive ? 'shadow-[0_0_30px_rgba(255,255,255,0.3)]' : ''} ${isLoaded ? 'opacity-100' : 'opacity-0'}`} 
        loading="lazy" 
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
};


// Optimized Worker Script: Handles DPR caps and simpler math
const workerScript = `
  let canvas;
  let ctx;
  let width;
  let height;
  let particles;
  let sizes;
  let particleCount;
  let connectionDistanceSq;
  let mouseX = -1000;
  let mouseY = -1000;

  self.onmessage = function(e) {
    const { type, payload } = e.data;

    if (type === 'init') {
      canvas = payload.canvas;
      ctx = canvas.getContext('2d', { alpha: false }); 
      width = payload.width;
      height = payload.height;
      particleCount = payload.particleCount;
      const dist = 120;
      connectionDistanceSq = dist * dist;
      
      initParticles();
      requestAnimationFrame(animate);
    } else if (type === 'resize') {
      width = payload.width;
      height = payload.height;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    } else if (type === 'mousemove') {
      mouseX = payload.x;
      mouseY = payload.y;
    }
  };

  function initParticles() {
    particles = new Float32Array(particleCount * 4); 
    sizes = new Float32Array(particleCount);

    for(let i = 0; i < particleCount; i++) {
      particles[i * 4] = Math.random() * width;
      particles[i * 4 + 1] = Math.random() * height;
      particles[i * 4 + 2] = (Math.random() - 0.5) * 0.3; // Slower speed for stability
      particles[i * 4 + 3] = (Math.random() - 0.5) * 0.3;
      sizes[i] = Math.random() * 1.5 + 0.5;
    }
  }

  function animate() {
    if (!ctx) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Slightly higher trail fade for perf
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(74, 222, 128, 0.5)'; // Green particles
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.08)'; // Green lines
    ctx.lineWidth = 0.5;

    for(let i = 0; i < particleCount; i++) {
      const idx = i * 4;
      
      particles[idx] += particles[idx + 2];
      particles[idx + 1] += particles[idx + 3];

      // Simplified Boundary Bounce
      if (particles[idx] < 0 || particles[idx] > width) particles[idx + 2] *= -1;
      if (particles[idx + 1] < 0 || particles[idx + 1] > height) particles[idx + 3] *= -1;

      // Draw particle
      ctx.beginPath();
      ctx.arc(particles[idx], particles[idx + 1], sizes[i], 0, Math.PI * 2);
      ctx.fill();

      // Draw connections - Limit checks for performance
      for (let j = i + 1; j < particleCount; j++) {
        const jdx = j * 4;
        const dx = particles[idx] - particles[jdx];
        const dy = particles[idx + 1] - particles[jdx + 1];
        
        // Quick check before square root
        if (Math.abs(dx) > 120 || Math.abs(dy) > 120) continue;

        const distSq = dx*dx + dy*dy;
        if (distSq < connectionDistanceSq) {
           ctx.beginPath();
           ctx.moveTo(particles[idx], particles[idx + 1]);
           ctx.lineTo(particles[jdx], particles[jdx + 1]);
           ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
`;

export const ConstellationMap: React.FC<ConstellationMapProps> = ({ onSelectArtist, onTogglePresentation, onImageClick, onPlayVideo }) => {
  const artistIds = Object.keys(ARTISTS) as ArtistId[];
  const [hoveredArtist, setHoveredArtist] = useState<ArtistId | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showHomebaseInfo, setShowHomebaseInfo] = useState(false);
  const [showMemories, setShowMemories] = useState(false);
  
  // State for continuous orbital rotation
  const [rotationOffset, setRotationOffset] = useState(0);

  const { user } = useFarcaster();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const isInitialized = useRef(false);
  
  // Memoized shuffled photos for the memory archive to ensure random order on mount
  const shuffledMemories = useMemo(() => {
    return [...RESIDENCY_PHOTOS].sort(() => Math.random() - 0.5);
  }, []);
  
  const floatingArtworks = useMemo(() => {
    const all = getAllArtworks();
    return all.sort(() => 0.5 - Math.random()).slice(0, 4);
  }, []);

  // --- ORBITAL ANIMATION LOOP ---
  useEffect(() => {
    let frameId: number;
    const animate = () => {
        // Slow rotation: approx 1 full rotation every 3-4 minutes
        setRotationOffset(prev => (prev + 0.0003) % (Math.PI * 2));
        frameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frameId);
  }, []);

  // --- NODE POSITION CALCULATOR ---
  const nodePositions = useMemo(() => {
    const positions: Record<string, {x: number, y: number, delay: string}> = {};
    const total = artistIds.length;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const winHeight = typeof window !== 'undefined' ? window.innerHeight : 1000;
    
    // ADJUSTED GEOMETRY
    // Mobile: Narrow Width (0.30) to add margins.
    // Mobile: Reduced Height (0.25) to prevent nodes from hitting bottom UI.
    // Desktop: Slightly wider X but significantly reduced Y and shifted up to avoid bottom buttons.
    const radiusX = isMobile ? winWidth * 0.30 : Math.min(winWidth, winHeight) * 0.38;
    const radiusY = isMobile ? winHeight * 0.25 : Math.min(winWidth, winHeight) * 0.28;

    // Shift center up slightly on mobile to clear bottom area
    // Desktop: Shift up by larger amount to clear Presentation Mode button area
    const verticalShift = isMobile ? -20 : -45;

    artistIds.forEach((id, index) => {
      const angleStep = (2 * Math.PI) / total;
      const baseAngle = index * angleStep + rotationOffset; // Add rotation
      
      const angleNoise = Math.sin(index * 99) * 0.1; // Slight irregularity
      const finalAngle = baseAngle + angleNoise;

      positions[id] = {
        x: Math.cos(finalAngle) * radiusX,
        y: Math.sin(finalAngle) * radiusY + verticalShift,
        delay: `delay-${(index % 5) + 1}`
      };
    });
    return positions;
  }, [artistIds, rotationOffset]); // Re-calculates on frame update

  useEffect(() => {
    if (isInitialized.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    if ('transferControlToOffscreen' in canvas) {
      isInitialized.current = true;
      
      const offscreen = canvas.transferControlToOffscreen();
      const blob = new Blob([workerScript], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));
      workerRef.current = worker;

      const dpr = Math.min(window.devicePixelRatio, 1.5); // CAP DPR at 1.5 for performance
      const width = window.innerWidth * dpr;
      const height = window.innerHeight * dpr;
      const isMobile = window.innerWidth < 768;
      const particleCount = isMobile ? 25 : 60;

      worker.postMessage({
        type: 'init',
        payload: { canvas: offscreen, width, height, particleCount }
      }, [offscreen]);

      const handleResize = () => {
        worker.postMessage({
          type: 'resize',
          payload: { width: window.innerWidth * dpr, height: window.innerHeight * dpr }
        });
      };

      // Throttle mouse events
      let lastTime = 0;
      const handleMouseMove = (e: MouseEvent) => {
         const now = Date.now();
         if (now - lastTime > 32) { // ~30fps cap for mouse updates
             worker.postMessage({
                type: 'mousemove',
                payload: { x: e.clientX * dpr, y: e.clientY * dpr }
             });
             lastTime = now;
         }
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('mousemove', handleMouseMove);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', handleMouseMove);
        worker.terminate();
      };
    }
  }, []);

  
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
      
      {/* LAYER 0: Worker Canvas (Will Change Transform for Compositing) */}
      <motion.div 
         className="absolute inset-0 z-0 w-full h-full"
      >
        <canvas 
            ref={canvasRef} 
            className="absolute inset-0 pointer-events-none opacity-60 w-full h-full will-change-transform" 
        />
      </motion.div>

      {/* LAYER 1: Floating Random Artworks (Updated with Glitch Effect) */}
      <motion.div 
        className="absolute inset-0 overflow-hidden pointer-events-none z-0"
      >
        {floatingArtworks.map((art, i) => (
           <FloatingArtwork key={art.id} art={art} index={i} onClick={onImageClick} />
        ))}
      </motion.div>

      {/* LAYER 2: Central Core Identity */}
      <div className="absolute z-30 text-center select-none flex flex-col items-center justify-center w-full px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative flex flex-col items-center cursor-pointer group pointer-events-auto max-w-md"
        >
          {/* Logo with Glow on Hover AND HALO */}
          <div className="relative" onClick={() => setShowInfo(true)}>
             {/* THE HALO: Scales up and fades in on hover. Pointer-events-none to let click pass through. */}
             <div className="absolute -inset-8 md:-inset-10 border border-green-500/60 rounded-full opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-out shadow-[0_0_30px_rgba(34,197,94,0.2)] pointer-events-none" />
             
             {/* Existing Ambient Glow */}
             <div className="absolute inset-0 bg-green-400/0 group-hover:bg-green-400/20 blur-2xl transition-all duration-700 rounded-full" />
             
             <img 
                src="https://i.postimg.cc/y65m8qp8/Kismet-Iso-Color-2.png" 
                alt="Kismet Logo" 
                className="w-24 md:w-52 object-contain mb-2 mix-blend-screen transition-transform duration-500 group-hover:scale-105 group-hover:brightness-125 relative z-10"
                width="200"
                height="200"
            />
          </div>

          {/* SPLIT TITLE - Interactive HOMEBASE */}
          <div className="flex flex-col items-center gap-3 mb-12 md:mb-24 transition-opacity group-hover:opacity-100">
            {/* User Profile Logic & Wallet Status */}
            {user ? (
               <div className="flex flex-col items-center gap-1 mb-2 animate-in fade-in zoom-in duration-1000">
                  <div className="flex items-center gap-2 border border-green-500/30 bg-green-900/10 px-3 py-1 rounded-full backdrop-blur-md">
                     {user.pfpUrl && <img src={user.pfpUrl} alt="User" className="w-5 h-5 rounded-full border border-green-500/50" />}
                     <div className="flex flex-col items-start leading-none">
                         <span className="text-[10px] font-mono text-green-400 uppercase tracking-widest font-bold">
                           @{user.username || 'ANON'}
                         </span>
                         {/* Wallet Address Display */}
                         {(user.verifications?.[0] || user.custodyAddress) && (
                            <span className="text-[8px] font-mono text-green-500/60 uppercase">
                                {((user.verifications?.[0] || user.custodyAddress) as string).slice(0, 4)}...{((user.verifications?.[0] || user.custodyAddress) as string).slice(-4)}
                            </span>
                         )}
                     </div>
                     {/* Status Dot */}
                     <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse ml-1 shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
                  </div>
                  <div className="w-px h-4 bg-green-500/20" />
               </div>
            ) : null}

            {/* Links Block */}
            <div className="flex flex-col items-center gap-3 z-50 pointer-events-auto">
              {/* Homebase Link */}
              <div className="flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase tracking-widest text-green-400 text-center">
                <span>KISMET CASA X</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHomebaseInfo(true);
                  }}
                  className="font-bold border-b border-green-500/30 hover:border-green-400 hover:text-green-300 transition-colors duration-300 cursor-pointer"
                >
                  HOMEBASE
                </button>
              </div>

              {/* Memory Archive Link - NEW */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMemories(true);
                }}
                className="flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase tracking-widest text-green-500/70 hover:text-green-300 transition-colors duration-300 cursor-pointer border border-green-500/20 px-4 py-1.5 rounded-full hover:bg-green-900/20"
              >
                 <ImageIcon size={10} />
                 <span>[ MEMORY ARCHIVE ]</span>
              </button>
            </div>
            
            <h3 className="text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-green-500/50 text-center mt-2">
              DEVCONNECT BUENOS AIRES 2025
            </h3>
            
            {/* CTA Hint - FIX: Fixed height and Opacity transition to prevent layout shift */}
             <div className="h-4 w-full flex justify-center items-center overflow-hidden" onClick={() => setShowInfo(true)}>
                <span className="text-[9px] text-green-400 font-bold uppercase tracking-widest block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    [ Enter System ]
                </span>
             </div>
          </div>

        </motion.div>
      </div>

      {/* LAYER 2.4: Presentation Button */}
      <div className="absolute bottom-20 md:bottom-24 z-40 pointer-events-none w-full flex justify-center">
         {onTogglePresentation && (
             <motion.button 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                onClick={(e) => {
                    e.stopPropagation();
                    onTogglePresentation();
                }}
                className="cursor-pointer pointer-events-auto px-5 py-2 bg-black/40 hover:bg-green-900/30 border border-green-500/20 hover:border-green-500/50 rounded-full backdrop-blur-md text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] flex items-center gap-3 transition-all duration-300 active:scale-95 text-green-500/80 hover:text-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)]"
             >
                <Play size={10} className="fill-current" />
                <span>Presentation Mode</span>
             </motion.button>
         )}
      </div>

      {/* LAYER 2.5: Base Footer Branding */}
      <div className="absolute bottom-6 md:bottom-8 z-30 pointer-events-none select-none flex flex-col items-center justify-center w-full">
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.8, y: 0 }}
            transition={{ delay: 2, duration: 1 }}
            className="flex flex-col items-center gap-1"
         >
            <div className="flex items-center gap-2">
                <div className="relative">
                    <div className="absolute inset-0 bg-[#0052FF] blur-sm opacity-50 rounded-none" />
                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-[#0052FF] rounded-none relative z-10" />
                </div>
                <span className="text-xs md:text-sm font-bold text-white tracking-wider font-sans">Base</span>
            </div>
            <span className="text-[8px] md:text-[10px] text-white/40 uppercase tracking-widest font-mono">
                mini app by sulkian
            </span>
         </motion.div>
      </div>

      {/* LAYER 3: The Artists Nodes - Orbiting */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {artistIds.map((id) => {
          const pos = nodePositions[id] || { x: 0, y: 0, delay: '' };
          const isActive = hoveredArtist === id;
          const isInactive = hoveredArtist && hoveredArtist !== id;
          const artist = ARTISTS[id];

          return (
            <motion.button
              key={id}
              type="button"
              className="absolute group cursor-pointer z-50 outline-none flex flex-col items-center justify-center pointer-events-auto touch-manipulation"
              initial={{ opacity: 0, scale: 0 }}
              // Fix: Use animate for x/y to prevent transform conflict with scale
              animate={{ 
                x: pos.x, 
                y: pos.y, 
                opacity: isInactive ? 0.4 : 1, 
                scale: isActive ? 1.1 : 1 
              }}
              transition={{ 
                  x: { duration: 0 }, // Sync with frame loop
                  y: { duration: 0 },
                  default: { duration: 0.3, ease: "easeOut" }
              }}
              onMouseEnter={() => setHoveredArtist(id)}
              onMouseLeave={() => setHoveredArtist(null)}
              onClick={(e) => {
                e.stopPropagation();
                onSelectArtist(id);
              }}
            >
              {/* Large Hit Area */}
              <div className="absolute -inset-10 bg-transparent rounded-full z-40" />

              {/* Node Body - UPDATED: Blue border on hover */}
              <div className="relative flex items-center justify-center pointer-events-none">
                {/* Morphing Shape */}
                <div className={`
                  w-14 h-14 md:w-16 md:h-16 bg-zinc-900
                  border border-green-500/20
                  group-hover:border-green-400/50 group-hover:shadow-[0_0_30px_rgba(74,222,128,0.6)]
                  transition-all duration-500
                  morph-shape ${pos.delay} overflow-hidden flex items-center justify-center
                  will-change-transform relative
                `}>
                  {/* Profile Image - Masked by parent clip-path */}
                  {artist.profileImage && (
                     <img 
                       src={artist.profileImage} 
                       alt={artist.name}
                       className="absolute inset-0 w-full h-full object-cover transition-all duration-500 opacity-80 grayscale group-hover:opacity-100 group-hover:grayscale-0"
                     />
                  )}
                </div>
              </div>

              {/* Text Label */}
              <div className={`mt-2 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-60'} bg-black/60 px-2 py-0.5 rounded pointer-events-none`}>
                <h3 className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-green-400 font-mono">
                  ${artist.name}
                </h3>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* LAYER 4: INFO MODAL (KISMET CASA MANIFESTO + FILM + CREDITS) */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
            onClick={() => setShowInfo(false)}
          >
             <motion.div 
               initial={{ scale: 0.95, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.95, y: 20 }}
               onClick={(e) => e.stopPropagation()}
               className="bg-zinc-950 border border-zinc-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative flex flex-col"
             >
                {/* CLOSE BUTTON */}
                <button 
                  onClick={() => setShowInfo(false)}
                  className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <CloseIcon size={20} />
                </button>

                {/* 1. VIDEO PLAYER - RESPONSIVE (CONTAINED ON DESKTOP, FULL ON MOBILE) */}
                <div className="w-full md:w-[80%] md:mx-auto aspect-video bg-black relative border-b md:border md:border-zinc-800 shrink-0 md:mt-8 md:rounded-xl overflow-hidden shadow-2xl">
                        <video 
                        src="https://github.com/julkitomal/kismet-mini-app-final/raw/main/public/intro.mp4" 
                        controls 
                        className="w-full h-full object-contain"
                        />
                        {/* Option to view fullscreen */}
                        {onPlayVideo && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowInfo(false);
                                onPlayVideo();
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-white/10 rounded text-xs text-white/50 hover:text-white transition-colors"
                            title="Fullscreen"
                        >
                            <Play size={12} />
                        </button>
                        )}
                </div>

                {/* SCROLLABLE CONTENT AREA */}
                <div className="p-8 flex flex-col items-center">
                    
                    {/* 2. POEM & CREDITS (CENTERED) */}
                    <div className="w-full max-w-lg text-center mb-8">
                        <h2 className="text-white font-bold text-2xl tracking-tighter uppercase mb-4">Time</h2>
                        <div className="text-zinc-400 font-mono text-xs space-y-3 leading-relaxed tracking-wide italic mb-6">
                            <p>I left...</p>
                            <p>Thinking that those searching for me would wait.<br/>Thinking that my rigid home would hold firm.</p>
                            <p>When I returned, there was no longer a home. I no longer found you.</p>
                            <p>Among these ashes, I found others like me—orphans in their search. Companions in solitude.</p>
                            <p>We walked aimlessly. Ashamed. Waiting to be found. With our dignity for sale.</p>
                            <p>I finally understood that home is our creation. That the search is inward.</p>
                            <p className="text-white font-bold">Time doesn't go back—it doesn't wait.<br/>You shouldn't either.</p>
                        </div>
                        
                        {/* 3. COLLECT BUTTON */}
                         <a 
                            href="https://zora.co/coin/base:0x8b10a509a0f95aa7ebb775844b9b115ac9398fa1?referrer=0xceaaa9422a8fcc90690fc3b6d37afbc4cbc12889"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-500/50 transition-all text-white font-mono text-xs uppercase tracking-widest group mb-6"
                        >
                            <ShoppingBag size={14} className="text-green-500 group-hover:text-green-400" />
                            <span>Collect Film on Zora</span>
                        </a>

                        <div className="text-[10px] text-zinc-600 font-mono space-y-1.5 uppercase tracking-widest border-t border-zinc-800 pt-6">
                            <p><span className="text-zinc-500">Dir:</span> @stipinpixel & @pinkyblu</p>
                            <p><span className="text-zinc-500">Edit:</span> @stevenspliffhead</p>
                            <p><span className="text-zinc-500">Cam:</span> @stipinpixel, @alvabrina, @qabqabqab, @gressie, @sulkian_core, @kathonejo, @sato99, @arbstein, @noistruct</p>
                            <p><span className="text-zinc-500">Music:</span> @mattlee</p>
                            <p><span className="text-zinc-500">Txt:</span> @lokapal</p>
                        </div>
                    </div>

                    <div className="w-full h-px bg-zinc-800 mb-8" />

                    {/* 4. TEAM IMAGE (COLOR) */}
                    <div className="w-full max-w-xl aspect-[16/9] mb-8 relative rounded-lg overflow-hidden border border-zinc-800">
                         <img 
                            src="https://i.postimg.cc/JzRCfVy4/photo-4985567191201680220-y.jpg" 
                            alt="Kismet Casa Team" 
                            className="w-full h-full object-cover"
                         />
                         <div className="absolute bottom-4 left-6 z-20 pointer-events-none">
                            <h2 className="text-2xl font-bold text-white uppercase tracking-tighter drop-shadow-md">Kismet Casa</h2>
                            <p className="text-green-400 font-mono text-[10px] uppercase tracking-widest drop-shadow-md">Manifesto v1.0</p>
                         </div>
                    </div>

                    {/* 5. MANIFESTO TEXT */}
                    <div className="w-full max-w-lg text-center space-y-4 text-zinc-300 font-sans leading-relaxed text-sm text-balance mb-8">
                        <p>
                            <strong className="text-white">Kismet Casa</strong> is a collective effort to support talented individuals in attending crypto-native events, hackathons and art exhibitions.
                        </p>
                        <p>
                            We are a family that forges its fate together by creating an inclusive and collaborative environment where builders and creators of all kinds can share ideas and work together to solve mutual challenges.
                        </p>
                        <p>
                            Our mission is to provide our residents with as many opportunities as possible to jumpstart their careers and help them create the future they want to live in.
                        </p>
                    </div>

                    {/* 6. LINKS */}
                    <div className="flex flex-col gap-3 w-full max-w-sm">
                        <a href="https://app.uniswap.org/explore/tokens/base/0x91169bfa46481ba2b0db01bfdfd3d5be3d3dceb8" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-blue-900/10 border border-blue-500/20 hover:bg-blue-900/20 hover:border-blue-500/50 transition-all group">
                            <div className="p-2 bg-blue-500/10 rounded-full text-blue-400 group-hover:text-blue-300">
                                <Sparkles size={18} />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">Buy Creator Coin</span>
                                <span className="text-[10px] text-zinc-500 font-mono">0x9116...ceb8</span>
                            </div>
                        </a>

                        <div className="flex gap-3">
                            <a href="https://x.com/KismetCasa" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                                </svg>
                                <span className="text-xs font-bold uppercase">X</span>
                            </a>
                            <a href="https://base.app/profile/kismetcasa.eth" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors">
                                <div className="w-4 h-4 rounded-full bg-[#0052FF]" />
                                <span className="text-xs font-bold uppercase">Base Profile</span>
                            </a>
                        </div>
                    </div>

                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LAYER 5: INFO MODAL (HOMEBASE) */}
      <AnimatePresence>
        {showHomebaseInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
            onClick={() => setShowHomebaseInfo(false)}
          >
             <motion.div 
               initial={{ scale: 0.95, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.95, y: 20 }}
               onClick={(e) => e.stopPropagation()}
               className="bg-zinc-950 border border-zinc-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative flex flex-col md:flex-row"
             >
                {/* CLOSE BUTTON */}
                <button 
                  onClick={() => setShowHomebaseInfo(false)}
                  className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <CloseIcon size={20} />
                </button>

                {/* LEFT: IMAGE */}
                <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800">
                    <div className="absolute inset-0 opacity-20 bg-gradient-to-t from-zinc-950 to-transparent z-10" />
                    <img 
                      src="https://i.postimg.cc/kgkj8WxB/homebase.jpg" 
                      alt="Homebase Community" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-6 left-6 z-20">
                       <h2 className="text-3xl font-bold text-white uppercase tracking-tighter drop-shadow-md">Homebase</h2>
                       <p className="text-blue-400 font-mono text-xs uppercase tracking-widest drop-shadow-md">Base Ecosystem</p>
                    </div>
                </div>

                {/* RIGHT: TEXT CONTENT */}
                <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-between">
                   <div className="space-y-6 text-zinc-300 font-sans leading-relaxed text-sm md:text-base text-balance">
                      <p>
                        <strong className="text-white">Homebase</strong> is a community of based builders and creators who host workshops, residencies and events to support the Base Ecosystem.
                      </p>
                   </div>

                   <div className="mt-10 space-y-3">
                      <div className="h-px w-full bg-zinc-800 mb-6" />
                      
                      {/* Social Links */}
                      <div className="grid grid-cols-1 gap-3">
                          <a href="https://homebase.love/" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-blue-900/10 border border-blue-500/20 hover:bg-blue-900/20 hover:border-blue-500/50 transition-all group">
                              <div className="p-2 bg-blue-500/10 rounded-full text-blue-400 group-hover:text-blue-300">
                                <ExternalLink size={18} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">Visit Website</span>
                                <span className="text-[10px] text-zinc-500 font-mono">homebase.love</span>
                              </div>
                          </a>

                          <div className="flex gap-3">
                              <a href="https://x.com/homebasedotlove" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors">
                                 <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                                 </svg>
                                 <span className="text-xs font-bold uppercase">X</span>
                              </a>
                              <a href="https://farcaster.xyz/homebase" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors">
                                 <svg width="16" height="16" viewBox="0 0 1000 1000" fill="currentColor">
                                   <path d="M257 150C197.907 150 150 197.907 150 257V743C150 802.093 197.907 850 257 850H743C802.093 850 850 802.093 850 743V257C850 197.907 802.093 150 743 150H257ZM680 340V490H560V340H440V490H320V660H680V340Z"/>
                                 </svg>
                                 <span className="text-xs font-bold uppercase">Farcaster</span>
                              </a>
                          </div>
                      </div>
                   </div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LAYER 6: MEMORIES ARCHIVE MODAL (RANDOMIZED GALLERY) */}
      <AnimatePresence>
        {showMemories && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-start p-4 md:p-8"
            onClick={() => setShowMemories(false)}
          >
             {/* Header */}
             <div className="w-full max-w-6xl flex items-center justify-between mb-8 shrink-0">
                <div className="flex flex-col">
                    <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tighter">Memory Archive</h2>
                    <p className="text-green-500 font-mono text-xs uppercase tracking-widest">Residency Logs // Randomized</p>
                </div>
                <button 
                  onClick={() => setShowMemories(false)}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <CloseIcon size={24} />
                </button>
             </div>

             {/* Masonry Grid Scrollable Area */}
             <div className="w-full max-w-6xl h-full overflow-y-auto pr-2 pb-20 mask-gradient-b">
                 <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                     {shuffledMemories.map((url, idx) => (
                         <motion.div
                            key={`${idx}-${url}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05, duration: 0.5 }}
                            className="break-inside-avoid relative group cursor-zoom-in rounded-lg overflow-hidden bg-zinc-900 border border-white/5"
                            onClick={(e) => {
                                e.stopPropagation();
                                onImageClick && onImageClick(url);
                            }}
                         >
                            <img 
                                src={url} 
                                alt={`Memory ${idx}`} 
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-100 opacity-80"
                                loading="lazy"
                            />
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                <span className="text-[10px] text-green-400 font-mono uppercase tracking-widest">
                                    IMG_LOG_{Math.floor(Math.random() * 9999)}
                                </span>
                            </div>
                         </motion.div>
                     ))}
                 </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Simple CSS animation for floating background elements */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-20px) rotate(2deg); }
        }
        .mask-gradient-b {
           mask-image: linear-gradient(to bottom, black 90%, transparent 100%);
        }
      `}</style>
    </div>
  );
};