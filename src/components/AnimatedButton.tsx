import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

export function AnimatedButton({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  disabled = false 
}: AnimatedButtonProps) {
  const baseClasses = "relative overflow-hidden font-bold py-4 px-8 rounded-2xl transition-all duration-500 transform";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-xl",
    secondary: "bg-gradient-to-r from-slate-600 to-gray-600 text-white shadow-lg",
    outline: "border-2 border-blue-500 text-blue-600 bg-white/60 backdrop-blur-sm"
  };

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { 
        scale: 1.05, 
        y: -2,
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)"
      }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
          ease: "easeInOut"
        }}
      />
      
      {/* Particle burst on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        whileHover={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 40% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)"
          ]
        }}
        transition={{ duration: 0.6, repeat: Infinity }}
      />
      
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}