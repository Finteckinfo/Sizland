'use client'

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
}

interface ConfettiProps {
  isActive: boolean;
  onComplete?: () => void;
}

const colors = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Gold
];

export const Confetti: React.FC<ConfettiProps> = ({ isActive, onComplete }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (isActive) {
      console.log('🎊 [CONFETTI] Starting confetti animation...');
      console.log('   Generating 50 confetti pieces...');
      
      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -20,
        rotation: Math.random() * 360,
        scale: Math.random() * 0.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
      }));

      console.log('   Confetti pieces generated:', newPieces.length);
      setPieces(newPieces);

      // Clean up after animation
      console.log('   Setting cleanup timer for 3 seconds...');
      const timer = setTimeout(() => {
        console.log('🎊 [CONFETTI] Animation complete, cleaning up...');
        setPieces([]);
        console.log('   Calling onComplete callback...');
        onComplete?.();
      }, 3000);

      return () => {
        console.log('🎊 [CONFETTI] Component unmounting, clearing timer...');
        clearTimeout(timer);
      };
    } else {
      console.log('🎊 [CONFETTI] Confetti inactive, no animation');
    }
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${piece.x}%`,
                backgroundColor: piece.color,
              }}
              initial={{
                y: piece.y,
                x: piece.x,
                rotate: piece.rotation,
                scale: piece.scale,
                opacity: 1,
              }}
              animate={{
                y: '120vh',
                x: piece.x + (Math.random() - 0.5) * 20,
                rotate: piece.rotation + 360,
                scale: piece.scale * 0.8,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 3,
                delay: piece.delay,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};
