import React, { useState } from 'react';
import { Presentation, Play, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { LoadingSpinner } from './LoadingSpinner';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

interface PresentationSlide {
  title: string;
  content: string[];
}

interface PresentationData {
  title: string;
  slides: PresentationSlide[];
  total_slides: number;
  theme: string;
}

interface PresentationRequest {
  session_id: string;
  topic?: string;
  max_slides: number;
}

interface PresentationResponse {
  status: string;
  message: string;
  presentation_url?: string;
  slides: PresentationSlide[];
  slide_count: number;
  api_used: boolean;
  fallback_used: boolean;
  title?: string;
}

export function PresentationTab() {
  const { state } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [presentationUrl, setPresentationUrl] = useState<string | null>(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    slideCount: 8
  });

  const generatePresentation = async () => {
    if (!state.session.active) {
      toast.error('Please upload a PDF document first');
      return;
    }

    setIsGenerating(true);
    try {
      const requestData: PresentationRequest = {
        session_id: 'default',
        topic: formData.topic.trim() || undefined,
        max_slides: formData.slideCount,
      };

      const response = await fetch('/api/generate-presentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data: PresentationResponse = await response.json();

      if (data.status === 'success') {
        setPresentation({
          title: data.title || 'Generated Presentation',
          slides: data.slides || [],
          total_slides: data.slide_count || 0,
          theme: 'professional'
        });
        setPresentationUrl(data.presentation_url || null);
        setFallbackUsed(data.fallback_used || false);
        setCurrentSlide(0);
        
        if (data.fallback_used) {
          toast.success('Presentation created in basic mode (AI quota exceeded)', {
            duration: 6000,
          });
        } else {
          toast.success('Presentation generated successfully!');
        }
      } else {
        toast.error(data.message || 'Failed to generate presentation');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to generate presentation';
      toast.error(errorMessage);
      console.error('Presentation generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportPresentation = () => {
    if (!presentation) return;

    const content = `# ${presentation.title}\n\n${presentation.slides.map((slide, index) => 
      `## Slide ${index + 1}: ${slide.title}\n\n${slide.content.map(item => `• ${item}`).join('\n')}\n\n---\n\n`
    ).join('')}`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${presentation.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Presentation exported as Markdown!');
  };

  if (!state.session.active) {
    return (
      <motion.div 
        className="text-center py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Presentation className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Presentation Maker Ready
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Upload a PDF document to create AI-powered presentations.
        </p>
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>PDF upload required to generate presentations</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Presentation className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Presentation Maker
          </h2>
        </div>
      </div>

      {/* Fallback Mode Warning */}
      <AnimatePresence>
        {fallbackUsed && presentation && (
          <motion.div 
            className="card p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Basic Mode Active</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  AI quota exceeded. Presentation generated using basic templates.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!presentation ? (
        /* Generation Form */
        <motion.div 
          className="card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Create Presentation from Your PDF
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Title (Optional)
              </label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Leave blank to auto-generate title from PDF content..."
                disabled={isGenerating}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                If left empty, the title will be generated from your PDF content
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Number of Slides: {formData.slideCount}
              </label>
              <input
                type="range"
                min="3"
                max="15"
                value={formData.slideCount}
                onChange={(e) => setFormData({ ...formData, slideCount: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                disabled={isGenerating}
              />
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span>3 slides</span>
                <span>15 slides</span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Ready to Generate
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Using content from: <strong>{state.session.file_info}</strong>
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {state.session.word_count?.toLocaleString()} words • {state.session.page_count} pages
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <motion.button
                onClick={generatePresentation}
                disabled={isGenerating}
                className="btn-primary inline-flex items-center space-x-3 px-8 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!isGenerating ? { scale: 1.05 } : {}}
                whileTap={!isGenerating ? { scale: 0.95 } : {}}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating Slides...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Generate Presentation</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Presentation Display */
        <div className="space-y-8">
          {/* Presentation Header */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {presentation.title}
                </h3>
                <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
                  <span>{presentation.total_slides} slides</span>
                  <span>Theme: {presentation.theme}</span>
                  {fallbackUsed && (
                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-full text-xs">
                      Basic Mode
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {presentationUrl && (
                  <motion.a
                    href={presentationUrl}
                    download
                    className="btn-primary inline-flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PPTX</span>
                  </motion.a>
                )}
                
                <motion.button
                  onClick={exportPresentation}
                  className="btn-outline inline-flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="w-4 h-4" />
                  <span>Export MD</span>
                </motion.button>
                
                <motion.button
                  onClick={() => {
                    setPresentation(null);
                    setPresentationUrl(null);
                    setFallbackUsed(false);
                  }}
                  className="btn-outline"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  New Presentation
                </motion.button>
              </div>
            </div>
          </div>

          {/* Slide Thumbnails */}
          <div className="card p-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Slide Overview</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {presentation.slides.map((slide, index) => (
                <motion.div
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    currentSlide === index 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Slide {index + 1}
                  </div>
                  <h5 className="font-medium text-sm text-gray-900 dark:text-white truncate mb-2">
                    {slide.title}
                  </h5>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3">
                    {slide.content.slice(0, 2).join(' ')}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Current Slide Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              className="card p-12 min-h-[500px]"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center space-y-8">
                <motion.h2 
                  className="text-4xl font-bold text-gray-900 dark:text-white mb-8"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {presentation.slides[currentSlide]?.title}
                </motion.h2>
                
                <motion.div 
                  className="space-y-6 text-left max-w-4xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {presentation.slides[currentSlide]?.content.map((item, index) => (
                    <motion.div
                      key={index}
                      className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary-500 rounded-full mt-3 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slide Navigation */}
          <div className="flex justify-center">
            <div className="flex items-center space-x-4 bg-gray-100 dark:bg-gray-700 rounded-2xl p-2">
              <button
                onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                disabled={currentSlide === 0}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 bg-white dark:bg-gray-600 rounded-xl text-sm font-medium text-gray-900 dark:text-white">
                {currentSlide + 1} / {presentation.slides.length}
              </span>
              
              <button
                onClick={() => setCurrentSlide(Math.min(presentation.slides.length - 1, currentSlide + 1))}
                disabled={currentSlide === presentation.slides.length - 1}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
