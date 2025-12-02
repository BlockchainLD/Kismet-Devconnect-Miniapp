import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, Variants } from 'framer-motion';
import { Artist, ThemeConfig } from '../types';
import { ArrowLeft, Instagram, ShoppingBag, Maximize2 } from 'lucide-react';
import { SwapButton } from './SwapButton';

interface ArtistViewProps {
  artist: Artist;
  theme: ThemeConfig;
  onBack: () => void;
  onImageClick?: (url: string) => void;
}

// --- INFINITE GENERATING TEXT COMPONENT ---
const InfiniteTitle = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState("");
  
  useEffect(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&*<>[]{}|/\\";
    let iteration = 0;
    
    // Initialize with random noise of same length to prevent layout shift
    setDisplayText(
        text.split("").map(() => chars[Math.floor(Math.random() * chars.length)]).join("")
    );

    const interval = setInterval(() => {
        setDisplayText(
            text
                .split("")
                .map((letter, index) => {
                    if (index < iteration) {
                        return text[index];
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join("")
        );

        if (iteration >= text.length) {
            clearInterval(interval);
        }

        iteration += 1 / 2; // Decode speed
    }, 40);
    
    return () => clearInterval(interval);
  }, [text]);

  return (
    <motion.div 
        className="font-mono text-xs md:text-sm tracking-[0.15em] opacity-70 mt-2 mb-8 flex items-center gap-3 select-none uppercase text-current max-w-full flex-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
    >   
        <span className="inline-block w-1.5 h-1.5 bg-current rounded-full animate-pulse shrink-0"/>
        <span className="break-words">ID: [{displayText}]</span>
    </motion.div>
  );
};

// --- OPTIMIZED IMAGE COMPONENT WITH THEMATIC LOADER ---
const OptimizedImage = ({ src, alt, className, style }: { src: string, alt: string, className?: string, style?: any }) => {
    const [loaded, setLoaded] = useState(false);

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <AnimatePresence>
                {!loaded && (
                    <motion.div 
                        className="absolute inset-0 flex items-center justify-center z-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Loader inherits text color from parent theme via border-current */}
                        <div className="relative">
                            <div className="w-10 h-10 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <motion.img 
                src={src}
                alt={alt}
                // Updated: use w-auto h-auto with max-width constraint to preserve aspect ratio and allow full height
                className={`block w-auto h-auto max-w-full object-contain transition-all duration-700 ease-out ${loaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-95'}`}
                loading="eager"
                decoding="async"
                onLoad={() => setLoaded(true)}
                style={style}
            />
        </div>
    );
};

// --- TRANSITION VARIANTS (SIMPLIFIED FOR PERFORMANCE) ---
const TRANSITION_VARIANTS: Record<string, Variants> = {
  pop: {
    initial: { x: '50%', opacity: 0, scale: 0.9 },
    animate: { x: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 250, damping: 20 } },
    exit: { x: '-20%', opacity: 0, transition: { duration: 0.3 } }
  },
  ethereal: {
    initial: { opacity: 0, scale: 1.02 },
    animate: { opacity: 1, scale: 1, transition: { duration: 1.5, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 1.5 } }
  },
  mechanic: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "circOut" } },
    exit: { opacity: 0, y: -30, transition: { duration: 0.4 } }
  },
  glitch: {
    initial: { opacity: 0, scale: 1.1 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, filter: "grayscale(100%)", transition: { duration: 0.2 } }
  },
  float: {
    initial: { y: '50%', opacity: 0 },
    animate: { y: '0%', opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } },
    exit: { y: '-50%', opacity: 0, transition: { duration: 0.5 } }
  },
  elastic: {
    initial: { scaleY: 0.8, opacity: 0 },
    animate: { scaleY: 1, opacity: 1, transition: { duration: 0.6, ease: "backOut" } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  },
  sketch: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.8 } },
    exit: { opacity: 0, transition: { duration: 0.4 } }
  },
  radial: {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 25 } },
    exit: { opacity: 0, scale: 1.5, transition: { duration: 0.4 } }
  },
  pixel: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3, steps: 4 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  }
};

export const ArtistView: React.FC<ArtistViewProps> = ({ artist, theme, onBack, onImageClick }) => {
  const gallery = useMemo(() => artist.gallery && artist.gallery.length > 0 
    ? [artist.mainArtwork, ...artist.gallery] 
    : [artist.mainArtwork], [artist]);
  
  const hasMultipleWorks = gallery.length > 1;
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentWork = gallery[currentIndex];
  
  // Ref to track if user has manually interacted
  const hasInteractedRef = useRef(false);

  // Preload next image
  const nextIndex = (currentIndex + 1) % gallery.length;
  useEffect(() => {
    if (!hasMultipleWorks) return;
    const img = new Image();
    img.src = gallery[nextIndex].imageUrl;
  }, [currentIndex, hasMultipleWorks, gallery, nextIndex]);

  // Auto-cycle (pauses if user interacts manually, logic: if I click, I want to see THAT one)
  // To implement "pause on interaction", we can skip the interval callback if interactions happened recently
  // For simplicity: The interval continues, but interacting resets the cycle naturally because currentIndex changes
  useEffect(() => {
    if (!hasMultipleWorks) return;

    const intervalTime = theme.motionType === 'pop' ? 3000 
      : theme.motionType === 'ethereal' ? 6000 
      : 4500;

    const timer = setInterval(() => {
      // Only auto-advance if user hasn't clicked recently (optional UX, keeping it simple for now: always rotate)
      // If we wanted to pause on hover/interaction we would check hasInteractedRef
      if (!hasInteractedRef.current) {
          setCurrentIndex((prev) => (prev + 1) % gallery.length);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [hasMultipleWorks, gallery.length, theme.motionType]);

  const handleManualSelect = (index: number) => {
      setCurrentIndex(index);
      hasInteractedRef.current = true;
      // Reset interaction flag after 10 seconds to resume slideshow? 
      // Or just keep it static. Let's keep it static for better UX once clicked.
      // Actually, let's just let it auto-resume after a long delay, or stay static.
      // For this vibe, let's let it stay static so user can read about the specific piece.
  };


  const isMobile = typeof window !== 'undefined' && window.matchMedia("(pointer: coarse)").matches;
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 30, stiffness: 200, mass: 0.5 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile) return;
    if (!containerRef.current) return;
    const { width, height, left, top } = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - left) / width - 0.5);
    mouseY.set((e.clientY - top) / height - 0.5);
  };

  const moveBackX = useTransform(mouseXSpring, [-0.5, 0.5], [20, -20]);
  const moveBackY = useTransform(mouseYSpring, [-0.5, 0.5], [20, -20]);
  const moveFrontX = useTransform(mouseXSpring, [-0.5, 0.5], [-10, 10]);
  const moveFrontY = useTransform(mouseYSpring, [-0.5, 0.5], [-10, 10]);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`h-full w-full flex flex-col md:flex-row ${theme.textClass} ${theme.fontClass} relative overflow-y-auto md:overflow-hidden`}
    >
      {/* LAYER 0: Background Watermark */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.03] select-none overflow-hidden will-change-transform"
        style={{ x: isMobile ? 0 : moveBackX, y: isMobile ? 0 : moveBackY }}
      >
         <h1 className="text-[20vw] font-black leading-none whitespace-nowrap text-current">
            {artist.name}
         </h1>
      </motion.div>

      {/* LAYER 2: RIGHT PANEL - Living Gallery (Ordered First on Mobile for Visual Impact) */}
      <div className="relative w-full md:w-2/3 h-[45vh] md:h-full flex items-center justify-center z-10 overflow-hidden pointer-events-none shrink-0 order-1 md:order-2">
        <motion.div 
            // DYNAMIC PADDING: Add right padding if gallery exists to prevent overlap
            className={`relative w-full h-full flex items-center justify-center transition-all duration-300 ${hasMultipleWorks ? 'p-4 pr-16 md:p-12 md:pr-28' : 'p-4 md:p-12'}`}
            style={{ x: isMobile ? 0 : moveFrontX.get() * -0.5, y: isMobile ? 0 : moveFrontY.get() * -0.5 }}
        >
            <div 
                 className={`absolute inset-0 transition-opacity duration-1000 ease-in-out opacity-30 blur-3xl
                    ${theme.id === 'sulkian' ? 'bg-green-900' : 
                      theme.id === 'qab' ? 'bg-purple-600' : 
                      theme.id === 'alva' ? 'bg-yellow-900' :
                      theme.id === 'kathonejo' ? 'bg-purple-900' :
                      'bg-transparent'}`} 
            />

            <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                    key={currentWork.id}
                    variants={TRANSITION_VARIANTS[theme.motionType] || TRANSITION_VARIANTS['pop']}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="relative z-10 w-full h-full flex items-center justify-center will-change-transform"
                >
                    <div 
                      className="relative cursor-zoom-in group pointer-events-auto"
                      onClick={() => onImageClick && onImageClick(currentWork.imageUrl)}
                    >
                        <OptimizedImage 
                            src={currentWork.imageUrl} 
                            alt={currentWork.title} 
                            className={`
                                max-h-full max-w-full
                                ${theme.id === 'pinkyblue' ? 'image-pixelated' : ''}
                            `}
                        />
                        {/* Hover hint */}
                        <div className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                           <Maximize2 size={16} />
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* THUMBNAIL NAVIGATOR - RIGHT LATERAL VERTICAL */}
             {hasMultipleWorks && (
                <div className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50 pointer-events-auto py-3 px-2 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/5 shadow-xl">
                    {gallery.map((work, idx) => (
                        <button
                            key={work.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleManualSelect(idx);
                            }}
                            className={`
                                relative w-10 h-10 md:w-14 md:h-14 overflow-hidden rounded-lg border-2 transition-all duration-300 group shrink-0
                                ${currentIndex === idx 
                                    ? 'border-current scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)] opacity-100' 
                                    : 'border-transparent opacity-40 hover:opacity-100 hover:border-white/50 grayscale hover:grayscale-0'
                                }
                            `}
                        >
                            <img 
                                src={work.imageUrl} 
                                alt={work.title} 
                                className="w-full h-full object-cover" 
                            />
                        </button>
                    ))}
                </div>
             )}

        </motion.div>
      </div>

      {/* LAYER 1: LEFT PANEL - Info (Ordered Second on Mobile) */}
      <motion.div 
        className="relative z-[60] p-6 md:p-12 flex flex-col justify-start md:justify-between w-full md:w-1/3 h-auto md:h-full shrink-0 pointer-events-none will-change-transform order-2 md:order-1"
        style={{ x: isMobile ? 0 : moveFrontX, y: isMobile ? 0 : moveFrontY }}
      >
        <div className="pointer-events-auto pb-12 md:pb-0">
             <button 
                onClick={onBack}
                className="flex items-center gap-2 group cursor-pointer mb-4 md:mb-8 px-3 py-1.5 -ml-3 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
             >
                <ArrowLeft size={24} className="text-current" />
                <span className="text-sm font-bold uppercase tracking-widest text-current">Return</span>
             </button>
             
             <motion.h1 
                className="text-4xl md:text-6xl font-bold uppercase tracking-tighter leading-[0.9] text-current"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
             >
                {artist.name}
             </motion.h1>

               {/* Infinite Generating Title - NOW WITH ARTWORK TITLE */}
               <InfiniteTitle text={currentWork.title} />
               
               <div className="flex gap-4 mt-2 mb-8">
                 {artist.socials?.instagram && (
                   <a href={artist.socials.instagram} target="_blank" rel="noreferrer" className={`p-2 rounded-full border border-current transition-opacity opacity-70 hover:opacity-100 ${theme.buttonClass}`}>
                     <Instagram size={18} className="text-current" />
                   </a>
                 )}
                 {artist.socials?.twitter && (
                   <a href={artist.socials.twitter} target="_blank" rel="noreferrer" className={`p-2 rounded-full border border-current transition-opacity opacity-70 hover:opacity-100 ${theme.buttonClass}`}>
                     <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                       <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                     </svg>
                   </a>
                 )}
                 {artist.socials?.farcaster && (
                   <a href={artist.socials.farcaster} target="_blank" rel="noreferrer" className={`p-2 rounded-full border border-current transition-opacity opacity-70 hover:opacity-100 ${theme.buttonClass}`}>
                      <svg 
                        width="18" 
                        height="18" 
                        viewBox="0 0 1000 1000" 
                        fill="currentColor" 
                        className="text-current"
                      >
                        <path d="M257 150C197.907 150 150 197.907 150 257V743C150 802.093 197.907 850 257 850H743C802.093 850 850 802.093 850 743V257C850 197.907 802.093 150 743 150H257ZM680 340V490H560V340H440V490H320V660H680V340Z"/>
                      </svg>
                   </a>
                 )}
               </div>

               {/* Action Buttons Container */}
               <div className="flex flex-col gap-3 items-start mt-4">
                 {/* Buy Creator Coin Button - Uses SwapButton for miniapp, link for web */}
                 {artist.creatorCoinLink && (
                    <SwapButton artist={artist} theme={theme} />
                 )}

                 {/* Buy Zora NFT Button (Dynamic based on current artwork) */}
                 <a 
                   href={currentWork.zoraLink || "https://zora.co"}
                   target="_blank"
                   rel="noreferrer"
                   className={`px-6 py-3 rounded-full flex items-center gap-3 font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 border border-current/50 bg-black/5 hover:bg-black/10 ${theme.id === 'sato' ? 'border-b-2 border-transparent hover:border-stone-400 rounded-none px-0 hover:bg-transparent' : ''}`}
                 >
                    <ShoppingBag size={18} />
                    <span>Collect on Zora</span>
                 </a>
             </div>
        </div>
      </motion.div>

    </div>
  );
};