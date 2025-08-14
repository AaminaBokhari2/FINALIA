import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle, Brain, Search, Zap, Sparkles, BookOpen, Video, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { apiService } from '../services/api';
import { LoadingSpinner } from './LoadingSpinner';
import { InteractiveCard } from './InteractiveCard';
import { AnimatedIcon } from './AnimatedIcon';
import toast from 'react-hot-toast';

export function FileUpload() {
  const { dispatch } = useApp();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file only');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast.error('File size must be less than 50MB');
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload and process PDF
      setUploadStatus('processing');
      const result = await apiService.uploadPDF(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('success');

      // Update session
      const sessionInfo = await apiService.getSessionInfo();
      dispatch({ type: 'SET_SESSION', payload: sessionInfo });

      // Generate all study materials
      await generateAllMaterials();

      toast.success('Document processed successfully!');
      
    } catch (error: any) {
      setUploadStatus('error');
      const errorMessage = error.response?.data?.detail || error.message || 'Upload failed';
      toast.error(errorMessage);
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadProgress(0);
      }, 2000);
    }
  }, [dispatch]);

  const generateAllMaterials = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Generate summary
      const summaryResult = await apiService.generateSummary();
      dispatch({ type: 'SET_SUMMARY', payload: summaryResult.summary });

      // Generate flashcards
      const flashcardsResult = await apiService.generateFlashcards();
      dispatch({ type: 'SET_FLASHCARDS', payload: flashcardsResult.flashcards });

      // Generate quiz
      const quizResult = await apiService.generateQuiz();
      dispatch({ type: 'SET_QUIZ', payload: quizResult.quiz });

      // Discover research papers
      const researchResult = await apiService.discoverResearch();
      dispatch({ type: 'SET_RESEARCH_PAPERS', payload: researchResult.papers });

      // Discover YouTube videos
      const videosResult = await apiService.discoverVideos();
      dispatch({ type: 'SET_YOUTUBE_VIDEOS', payload: videosResult.videos });

      // Discover web resources
      const resourcesResult = await apiService.discoverResources();
      dispatch({ type: 'SET_WEB_RESOURCES', payload: resourcesResult.resources });

    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to generate materials';
      toast.error(errorMessage);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: isUploading
  });

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
      case 'processing':
        return <LoadingSpinner size="lg" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-16 h-16 text-red-500" />;
      default:
        return (
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Upload className="w-16 h-16 text-blue-500" />
          </motion.div>
        );
    }
  };

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Uploading your document...';
      case 'processing':
        return 'AI is analyzing your content...';
      case 'success':
        return 'Ready to learn! 🎉';
      case 'error':
        return 'Upload failed - please try again';
      default:
        return isDragActive ? 'Drop your PDF here! 📄' : 'Transform your PDF into a complete learning experience';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <motion.h1 
            className="text-7xl md:text-8xl font-black mb-8 relative"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
              AI Study
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
              Revolution
            </span>
            <motion.div
              className="absolute -top-4 -right-4 text-4xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✨
            </motion.div>
          </motion.h1>
          
          <motion.p 
            className="text-2xl text-gray-600 dark:text-gray-300 mb-6 max-w-4xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            Upload any PDF and watch as AI transforms it into 
            <span className="font-semibold text-blue-600 dark:text-blue-400"> interactive flashcards</span>,
            <span className="font-semibold text-purple-600 dark:text-purple-400"> adaptive quizzes</span>, and
            <span className="font-semibold text-pink-600 dark:text-pink-400"> comprehensive study materials</span>
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            {[
              { icon: Brain, text: "AI-Powered", color: "from-blue-500 to-cyan-500" },
              { icon: Zap, text: "Instant Results", color: "from-yellow-500 to-orange-500" },
              { icon: Sparkles, text: "Smart Learning", color: "from-purple-500 to-pink-500" }
            ].map((badge, index) => (
              <motion.div
                key={index}
                className={`inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r ${badge.color} text-white rounded-full shadow-lg`}
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <badge.icon className="w-5 h-5" />
                <span className="font-semibold">{badge.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-16"
      >
        <div
          {...getRootProps()}
          className={`
            relative border-3 border-dashed rounded-3xl p-20 text-center cursor-pointer transition-all duration-700 backdrop-blur-xl overflow-hidden group
            ${isDragActive 
              ? 'border-blue-500 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800/40 dark:to-purple-800/40 scale-105 shadow-2xl' 
              : 'border-blue-300 dark:border-blue-500 bg-gradient-to-br from-white/80 to-blue-50/80 dark:from-gray-800/80 dark:to-blue-900/30 hover:border-blue-500 hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/40 dark:hover:to-purple-900/40 hover:shadow-2xl hover:scale-102'
            }
            ${isUploading ? 'pointer-events-none' : ''}
          `}
        >
          {/* Animated background pattern */}
          <input {...getInputProps()} />
          
          <div className="space-y-8">
            <motion.div
              className="flex justify-center"
              animate={uploadStatus === 'processing' ? { 
                rotate: 360,
                scale: [1, 1.2, 1]
              } : isDragActive ? {
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              } : {}}
              transition={{ 
                rotate: { duration: 2, repeat: uploadStatus === 'processing' ? Infinity : 0, ease: "linear" },
                scale: { duration: 1, repeat: uploadStatus === 'processing' ? Infinity : 0 }
              }}
            >
              <div className="relative">
                {getStatusIcon()}
                {uploadStatus === 'idle' && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{
                      boxShadow: [
                        '0 0 0 0 rgba(59, 130, 246, 0.4)',
                        '0 0 0 30px rgba(59, 130, 246, 0)',
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                  />
                )}
              </div>
            </motion.div>
            
            <div>
              <motion.h3 
                className="text-4xl font-bold text-gray-800 dark:text-white mb-6"
                animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {getStatusText()}
              </motion.h3>
              
              {uploadStatus === 'idle' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-xl text-gray-700 dark:text-gray-200 leading-relaxed font-medium mb-4">
                    Drag and drop your PDF file here, or click to browse
                  </p>
                  <motion.p 
                    className="text-lg text-gray-600 dark:text-gray-300 font-semibold"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Maximum file size: 50MB • Supports all PDF formats
                  </motion.p>
                </motion.div>
              )}
            </div>

            {isUploading && (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden shadow-inner">
                  <motion.div 
                    className="h-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full relative overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.div>
                </div>
                <motion.p 
                  className="text-xl text-gray-800 dark:text-gray-200 font-bold"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {uploadProgress}% complete
                </motion.p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Feature Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <InteractiveCard
          title="Smart Summaries"
          description="AI extracts key concepts and creates comprehensive summaries with intelligent insights and structured content"
          icon={FileText}
          gradient="from-emerald-500 via-teal-500 to-cyan-500"
        />
        
        <InteractiveCard
          title="Interactive Learning"
          description="Dynamic flashcards, adaptive quizzes, and personalized Q&A sessions that adapt to your learning style"
          icon={Brain}
          gradient="from-purple-500 via-pink-500 to-rose-500"
        />
        
        <InteractiveCard
          title="Research Discovery"
          description="Automatically discover related research papers, educational videos, and curated learning resources"
          icon={Search}
          gradient="from-orange-500 via-red-500 to-pink-500"
        />
      </motion.div>


      {/* How it Works */}
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-12">
          How It Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              step: "1", 
              title: "Upload PDF", 
              description: "Simply drag and drop your PDF document",
              icon: Upload,
              color: "from-blue-500 to-cyan-500"
            },
            { 
              step: "2", 
              title: "AI Processing", 
              description: "Our AI analyzes and extracts key information",
              icon: Brain,
              color: "from-purple-500 to-pink-500"
            },
            { 
              step: "3", 
              title: "Study Materials", 
              description: "Get flashcards, quizzes, and comprehensive resources",
              icon: BookOpen,
              color: "from-green-500 to-emerald-500"
            }
          ].map((step, index) => (
            <motion.div
              key={index}
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.2 }}
            >
              <div className="flex flex-col items-center">
                <motion.div
                  className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center mb-6 relative`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <step.icon className="w-10 h-10 text-white" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-gray-900">
                    {step.step}
                  </div>
                </motion.div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {step.description}
                </p>
              </div>
              
              {index < 2 && (
                <motion.div
                  className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.5 + index * 0.2, duration: 0.8 }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        <motion.div 
          className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full border border-blue-200/30 dark:border-purple-300/30 backdrop-blur-sm"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <AnimatedIcon icon={Zap} animation="pulse" size={24} color="#3b82f6" />
          <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Powered by Advanced AI Technology
          </span>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⚡
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
