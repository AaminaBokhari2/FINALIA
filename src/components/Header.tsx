import React from 'react';
import { GraduationCap, Moon, Sun, FileText, Zap, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { apiService } from '../services/api';
import { AnimatedIcon, GlowingIcon } from './AnimatedIcon';
import toast from 'react-hot-toast';

export function Header() {
  const { state, dispatch } = useApp();

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  const handleNewSession = async () => {
    try {
      await apiService.clearSession();
      dispatch({ type: 'CLEAR_SESSION' });
      toast.success('Session cleared successfully');
    } catch (error) {
      toast.error('Failed to clear session');
    }
  };

  return (
    <motion.header 
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl shadow-2xl border-b border-gray-200/60 dark:border-gray-700/60 sticky top-0 z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 120 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo and Title */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div 
              className="w-14 h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl glow-effect"
              animate={{ 
                rotate: [0, 8, -8, 0],
                scale: [1, 1.08, 1]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <GraduationCap className="w-8 h-8 text-white drop-shadow-lg" />
            </motion.div>
            <div>
              <motion.h1 
                className="text-3xl font-black gradient-text"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                AI Study Assistant
              </motion.h1>
              <motion.p 
                className="text-sm text-blue-600 dark:text-blue-400 font-bold tracking-wide"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Professional Edition ✨
              </motion.p>
            </div>
          </motion.div>

          {/* Session Info */}
          {state.session.active && (
            <motion.div 
              className="hidden md:flex items-center space-x-8 text-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl border border-blue-200/50 dark:border-purple-700/50 backdrop-blur-sm"
                whileHover={{ scale: 1.08, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <AnimatedIcon icon={FileText} animation="float" size={18} />
                <span className="font-bold text-blue-700 dark:text-blue-300">{state.session.word_count?.toLocaleString()} words</span>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl border border-purple-200/50 dark:border-pink-700/50 backdrop-blur-sm"
                whileHover={{ scale: 1.08, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <AnimatedIcon icon={Zap} animation="pulse" size={18} />
                <span className="font-bold text-purple-700 dark:text-purple-300">{state.session.page_count} pages</span>
              </motion.div>
            </motion.div>
          )}

          {/* Controls */}
          <div className="flex items-center space-x-3">
            {state.session.active && (
              <motion.button
                onClick={handleNewSession}
                className="p-4 rounded-2xl bg-white/70 dark:bg-gray-700/70 backdrop-blur-md hover:bg-white/90 dark:hover:bg-gray-600/90 transition-all duration-500 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-110 border border-gray-200/60 dark:border-gray-600/60"
                title="New Session"
                whileHover={{ scale: 1.15, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <RotateCcw className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </motion.button>
            )}
            
            <motion.button
              onClick={toggleTheme}
              className="p-4 rounded-2xl bg-white/70 dark:bg-gray-700/70 backdrop-blur-md hover:bg-white/90 dark:hover:bg-gray-600/90 transition-all duration-500 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-110 border border-gray-200/60 dark:border-gray-600/60"
              title="Toggle Theme"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                animate={{ rotate: state.theme === 'light' ? 0 : 360 }}
                transition={{ duration: 0.8, type: "spring" }}
              >
                {state.theme === 'light' ? (
                  <GlowingIcon icon={Moon} size={24} glowColor="#6366f1" />
                ) : (
                  <GlowingIcon icon={Sun} size={24} glowColor="#f59e0b" />
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}