import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export function AnimatedCard({ 
  children, 
  className = '', 
  delay = 0,
  hover = true 
}: AnimatedCardProps) {
  return (
    <motion.div
      className={`bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/60 transition-all duration-500 relative overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 100, 
        damping: 15,
        delay 
      }}
      whileHover={hover ? { 
        y: -10, 
        scale: 1.02,
        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)"
      } : {}}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Floating particles inside card */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
            style={{
              left: `${20 + i * 30}%`,
              top: `${20 + i * 20}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

export function MorphingCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 opacity-20"
        animate={{
          background: [
            "linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899)",
            "linear-gradient(45deg, #ec4899, #3b82f6, #8b5cf6)",
            "linear-gradient(45deg, #8b5cf6, #ec4899, #3b82f6)",
          ]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative z-10 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50">
        {children}
      </div>
    </motion.div>
  );
}