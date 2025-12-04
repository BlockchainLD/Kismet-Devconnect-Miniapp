import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Physics for the "following" element (the liquid tail)
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // Velocity for deformation
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const [rotate, setRotate] = useState(0);

  useEffect(() => {
    // Disable custom cursor on touch devices
    if (typeof window !== 'undefined' && window.matchMedia("(pointer: coarse)").matches) {
      setIsVisible(false);
      return;
    }

    let lastX = 0;
    let lastY = 0;
    let timeout: any;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      // Calculate velocity
      const deltaX = e.clientX - lastX;
      const deltaY = e.clientY - lastY;
      const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
      const maxDistance = 150; // Cap for deformation
      const scale = Math.min(distance / maxDistance, 0.5); // Max deformation factor

      // Angle of movement
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

      // Apply deformation: stretch in X direction of movement, squash in Y
      setScaleX(1 + scale);
      setScaleY(1 - scale * 0.5);
      setRotate(angle);

      lastX = e.clientX;
      lastY = e.clientY;

      // Reset to circle when stopped
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setScaleX(1);
        setScaleY(1);
      }, 100);

      // Check if hovering interactive elements
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('button') || 
        target.closest('a') ||
        target.classList.contains('cursor-interactive');
      
      setIsHovering(!!isInteractive);
    };

    // Listen on both window and document to ensure we catch all mouse movements
    window.addEventListener('mousemove', moveCursor, { passive: true });
    document.addEventListener('mousemove', moveCursor, { passive: true });
    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mousemove', moveCursor);
      clearTimeout(timeout);
    };
  }, [cursorX, cursorY]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden hidden md:block" style={{ isolation: 'isolate' }}>
      {/* Main Dot (Core) */}
      <motion.div
        className="absolute w-2 h-2 bg-white rounded-full mix-blend-difference will-change-transform"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />

      {/* Liquid Aura (Follower) */}
      <motion.div
        className="absolute w-12 h-12 border border-white/40 rounded-full mix-blend-difference will-change-transform"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
          scaleX: scaleX,
          scaleY: scaleY,
          rotate: rotate,
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          opacity: isHovering ? 0.8 : 0.3,
          backgroundColor: isHovering ? 'rgba(255,255,255,0.1)' : 'transparent'
        }}
        transition={{
            scale: { type: "spring", stiffness: 300, damping: 20 },
            opacity: { duration: 0.2 }
        }}
      />
    </div>
  );
};