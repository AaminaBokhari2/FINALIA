import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
}

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const particles: Particle[] = [];
      const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 12000));
      
      for (let i = 0; i < particleCount; i++) {
        const maxLife = 300 + Math.random() * 200;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          size: Math.random() * 4 + 1,
          color: `hsl(${Math.random() * 60 + 200}, 70%, ${60 + Math.random() * 20}%)`,
          opacity: Math.random() * 0.6 + 0.2,
          life: Math.random() * maxLife,
          maxLife,
        });
      }
      
      particlesRef.current = particles;
    };

    const drawParticle = (particle: Particle) => {
      const lifeRatio = particle.life / particle.maxLife;
      const currentOpacity = particle.opacity * Math.sin(lifeRatio * Math.PI);
      
      ctx.save();
      ctx.globalAlpha = currentOpacity;
      
      // Create gradient for particle
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 2
      );
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Add inner glow
      ctx.globalAlpha = currentOpacity * 0.8;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    const drawConnections = () => {
      const particles = particlesRef.current;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            const opacity = (120 - distance) / 120 * 0.15;
            ctx.save();
            ctx.globalAlpha = opacity;
            
            const gradient = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
            gradient.addColorStop(0, particles[i].color);
            gradient.addColorStop(1, particles[j].color);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    };

    const updateParticles = () => {
      const particles = particlesRef.current;
      const mouse = mouseRef.current;
      
      particles.forEach((particle, index) => {
        // Update life
        particle.life += 1;
        if (particle.life > particle.maxLife) {
          particle.life = 0;
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
          particle.vx = (Math.random() - 0.5) * 0.8;
          particle.vy = (Math.random() - 0.5) * 0.8;
        }
        
        // Mouse interaction
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const force = (150 - distance) / 150;
          const angle = Math.atan2(dy, dx);
          particle.vx -= Math.cos(angle) * force * 0.02;
          particle.vy -= Math.sin(angle) * force * 0.02;
        }
        
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Boundary wrapping
        if (particle.x < -10) particle.x = canvas.width + 10;
        if (particle.x > canvas.width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = canvas.height + 10;
        if (particle.y > canvas.height + 10) particle.y = -10;
        
        // Add subtle drift
        particle.vx += (Math.random() - 0.5) * 0.005;
        particle.vy += (Math.random() - 0.5) * 0.005;
        
        // Limit velocity
        const maxVel = 1.5;
        particle.vx = Math.max(-maxVel, Math.min(maxVel, particle.vx));
        particle.vy = Math.max(-maxVel, Math.min(maxVel, particle.vy));
        
        // Apply friction
        particle.vx *= 0.999;
        particle.vy *= 0.999;
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      updateParticles();
      drawConnections();
      
      particlesRef.current.forEach(drawParticle);
      
      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleResize = () => {
      resizeCanvas();
      createParticles();
    };

    resizeCanvas();
    createParticles();
    animate();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
}

export function FloatingShapes() {
  const shapes = [
    { size: 80, color: 'from-blue-400/10 to-purple-400/10', delay: 0, duration: 25 },
    { size: 120, color: 'from-pink-400/10 to-red-400/10', delay: 3, duration: 30 },
    { size: 150, color: 'from-green-400/10 to-blue-400/10', delay: 6, duration: 35 },
    { size: 60, color: 'from-yellow-400/10 to-orange-400/10', delay: 2, duration: 20 },
    { size: 100, color: 'from-indigo-400/10 to-purple-400/10', delay: 4, duration: 28 },
    { size: 90, color: 'from-teal-400/10 to-cyan-400/10', delay: 1, duration: 22 },
    { size: 70, color: 'from-rose-400/10 to-pink-400/10', delay: 5, duration: 26 },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {shapes.map((shape, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full bg-gradient-to-br ${shape.color} blur-2xl`}
          style={{
            width: shape.size,
            height: shape.size,
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            x: [0, 150, -100, 50, 0],
            y: [0, -120, 80, -50, 0],
            scale: [1, 1.3, 0.7, 1.1, 1],
            rotate: [0, 120, 240, 360],
            opacity: [0.3, 0.6, 0.2, 0.5, 0.3],
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

export function ParticleField() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = React.useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    duration: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 2,
        color: `hsl(${200 + Math.random() * 60}, 70%, ${50 + Math.random() * 30}%)`,
        duration: 15 + Math.random() * 20,
        delay: Math.random() * 10,
      }));
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full opacity-40"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
          animate={{
            y: [0, -100, 50, -30, 0],
            x: [0, 30, -20, 40, 0],
            scale: [1, 1.5, 0.5, 1.2, 1],
            opacity: [0.2, 0.6, 0.1, 0.4, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}

export function MagicDust() {
  const dustParticles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    color: `hsl(${Math.random() * 60 + 200}, 80%, ${70 + Math.random() * 20}%)`,
    duration: 20 + Math.random() * 30,
    delay: Math.random() * 15,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {dustParticles.map((dust) => (
        <motion.div
          key={dust.id}
          className="absolute rounded-full"
          style={{
            left: `${dust.initialX}%`,
            top: `${dust.initialY}%`,
            width: dust.size,
            height: dust.size,
            backgroundColor: dust.color,
            filter: 'blur(0.5px)',
          }}
          animate={{
            x: [0, 200, -150, 100, 0],
            y: [0, -300, 200, -100, 0],
            opacity: [0, 0.8, 0.2, 0.6, 0],
            scale: [0, 1, 0.3, 0.8, 0],
          }}
          transition={{
            duration: dust.duration,
            repeat: Infinity,
            ease: "linear",
            delay: dust.delay,
          }}
        />
      ))}
    </div>
  );
}
