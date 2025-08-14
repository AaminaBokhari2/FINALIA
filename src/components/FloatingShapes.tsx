import React from 'react';
import { motion } from 'framer-motion';

export function FloatingShapes() {
  const shapes = [
    { 
      size: 120, 
      color: 'from-blue-400/20 via-purple-400/15 to-pink-400/20', 
      delay: 0, 
      duration: 25,
      blur: 'blur-2xl'
    },
    { 
      size: 180, 
      color: 'from-pink-400/15 via-red-400/10 to-orange-400/15', 
      delay: 3, 
      duration: 30,
      blur: 'blur-3xl'
    },
    { 
      size: 200, 
      color: 'from-green-400/15 via-teal-400/10 to-blue-400/15', 
      delay: 6, 
      duration: 35,
      blur: 'blur-3xl'
    },
    { 
      size: 80, 
      color: 'from-yellow-400/20 via-orange-400/15 to-red-400/20', 
      delay: 2, 
      duration: 20,
      blur: 'blur-xl'
    },
    { 
      size: 140, 
      color: 'from-indigo-400/15 via-purple-400/10 to-pink-400/15', 
      delay: 4, 
      duration: 28,
      blur: 'blur-2xl'
    },
    { 
      size: 110, 
      color: 'from-teal-400/20 via-cyan-400/15 to-blue-400/20', 
      delay: 1, 
      duration: 22,
      blur: 'blur-2xl'
    },
    { 
      size: 90, 
      color: 'from-rose-400/20 via-pink-400/15 to-purple-400/20', 
      delay: 5, 
      duration: 26,
      blur: 'blur-xl'
    },
    { 
      size: 160, 
      color: 'from-violet-400/15 via-purple-400/10 to-indigo-400/15', 
      delay: 7, 
      duration: 32,
      blur: 'blur-3xl'
    },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {shapes.map((shape, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full bg-gradient-to-br ${shape.color} ${shape.blur}`}
          style={{
            width: shape.size,
            height: shape.size,
            left: `${5 + Math.random() * 90}%`,
            top: `${5 + Math.random() * 90}%`,
          }}
          animate={{
            x: [0, 200, -150, 100, 0],
            y: [0, -180, 120, -80, 0],
            scale: [1, 1.4, 0.6, 1.2, 1],
            rotate: [0, 180, 270, 360],
            opacity: [0.3, 0.8, 0.2, 0.6, 0.3],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: shape.delay,
          }}
        />
      ))}
    </div>
  );
}