import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Network, Plus, Trash2, Edit3, Save, X, ZoomIn, ZoomOut, RotateCcw, Download, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import type { ConceptMap, ConceptNode, ConceptConnection } from '../types';
import toast from 'react-hot-toast';

interface DragState {
  isDragging: boolean;
  draggedNode: string | null;
  offset: { x: number; y: number };
}

interface ViewState {
  zoom: number;
  pan: { x: number; y: number };
}

export function MindMapTab() {
  const { state, dispatch } = useApp();
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [newNodePosition, setNewNodePosition] = useState<{ x: number; y: number } | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedNode: null,
    offset: { x: 0, y: 0 }
  });
  const [viewState, setViewState] = useState<ViewState>({
    zoom: 1,
    pan: { x: 0, y: 0 }
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);

  // Initialize with sample mind map if none exists
  useEffect(() => {
    if (!state.conceptMap && state.session.active) {
      generateSampleMindMap();
    }
  }, [state.session.active]);

  const generateSampleMindMap = () => {
    const sampleMap: ConceptMap = {
      id: 'sample-map',
      title: 'Document Concepts',
      nodes: [
        { id: '1', label: 'Main Topic', x: 400, y: 200, color: '#3b82f6', size: 60 },
        { id: '2', label: 'Key Concept 1', x: 200, y: 100, color: '#10b981', size: 45 },
        { id: '3', label: 'Key Concept 2', x: 600, y: 100, color: '#f59e0b', size: 45 },
        { id: '4', label: 'Detail A', x: 100, y: 50, color: '#ef4444', size: 35 },
        { id: '5', label: 'Detail B', x: 300, y: 50, color: '#8b5cf6', size: 35 },
        { id: '6', label: 'Detail C', x: 500, y: 50, color: '#06b6d4', size: 35 },
        { id: '7', label: 'Detail D', x: 700, y: 50, color: '#f97316', size: 35 },
      ],
      connections: [
        { id: 'c1', source: '1', target: '2', label: 'relates to' },
        { id: 'c2', source: '1', target: '3', label: 'includes' },
        { id: 'c3', source: '2', target: '4', label: 'contains' },
        { id: 'c4', source: '2', target: '5', label: 'leads to' },
        { id: 'c5', source: '3', target: '6', label: 'involves' },
        { id: 'c6', source: '3', target: '7', label: 'results in' },
      ]
    };
    dispatch({ type: 'SET_CONCEPT_MAP', payload: sampleMap });
  };

  const getNodeById = (id: string): ConceptNode | undefined => {
    return state.conceptMap?.nodes.find(node => node.id === id);
  };

  const updateNode = (nodeId: string, updates: Partial<ConceptNode>) => {
    if (!state.conceptMap) return;
    
    const updatedNodes = state.conceptMap.nodes.map(node =>
      node.id === nodeId ? { ...node, ...updates } : node
    );
    
    dispatch({
      type: 'SET_CONCEPT_MAP',
      payload: { ...state.conceptMap, nodes: updatedNodes }
    });
  };

  const addNode = (x: number, y: number, label: string = 'New Node') => {
    if (!state.conceptMap) return;
    
    const newNode: ConceptNode = {
      id: Date.now().toString(),
      label,
      x,
      y,
      color: '#6366f1',
      size: 40
    };
    
    const updatedNodes = [...state.conceptMap.nodes, newNode];
    
    dispatch({
      type: 'SET_CONCEPT_MAP',
      payload: { ...state.conceptMap, nodes: updatedNodes }
    });
    
    return newNode.id;
  };

  const deleteNode = (nodeId: string) => {
    if (!state.conceptMap) return;
    
    const updatedNodes = state.conceptMap.nodes.filter(node => node.id !== nodeId);
    const updatedConnections = state.conceptMap.connections.filter(
      conn => conn.source !== nodeId && conn.target !== nodeId
    );
    
    dispatch({
      type: 'SET_CONCEPT_MAP',
      payload: {
        ...state.conceptMap,
        nodes: updatedNodes,
        connections: updatedConnections
      }
    });
    
    setSelectedNode(null);
    toast.success('Node deleted');
  };

  const addConnection = (sourceId: string, targetId: string, label: string = '') => {
    if (!state.conceptMap) return;
    
    // Check if connection already exists
    const exists = state.conceptMap.connections.some(
      conn => (conn.source === sourceId && conn.target === targetId) ||
               (conn.source === targetId && conn.target === sourceId)
    );
    
    if (exists) {
      toast.error('Connection already exists');
      return;
    }
    
    const newConnection: ConceptConnection = {
      id: Date.now().toString(),
      source: sourceId,
      target: targetId,
      label
    };
    
    const updatedConnections = [...state.conceptMap.connections, newConnection];
    
    dispatch({
      type: 'SET_CONCEPT_MAP',
      payload: { ...state.conceptMap, connections: updatedConnections }
    });
    
    toast.success('Connection added');
  };

  const deleteConnection = (connectionId: string) => {
    if (!state.conceptMap) return;
    
    const updatedConnections = state.conceptMap.connections.filter(
      conn => conn.id !== connectionId
    );
    
    dispatch({
      type: 'SET_CONCEPT_MAP',
      payload: { ...state.conceptMap, connections: updatedConnections }
    });
  };

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isConnecting) {
      if (!connectionStart) {
        setConnectionStart(nodeId);
        toast.info('Select target node to create connection');
      } else if (connectionStart !== nodeId) {
        addConnection(connectionStart, nodeId);
        setConnectionStart(null);
        setIsConnecting(false);
      }
      return;
    }
    
    const node = getNodeById(nodeId);
    if (!node) return;
    
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = (e.clientX - rect.left - viewState.pan.x) / viewState.zoom;
    const mouseY = (e.clientY - rect.top - viewState.pan.y) / viewState.zoom;
    
    setDragState({
      isDragging: true,
      draggedNode: nodeId,
      offset: {
        x: mouseX - node.x,
        y: mouseY - node.y
      }
    });
    
    setSelectedNode(nodeId);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.draggedNode) return;
    
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = (e.clientX - rect.left - viewState.pan.x) / viewState.zoom;
    const mouseY = (e.clientY - rect.top - viewState.pan.y) / viewState.zoom;
    
    const newX = mouseX - dragState.offset.x;
    const newY = mouseY - dragState.offset.y;
    
    updateNode(dragState.draggedNode, { x: newX, y: newY });
  }, [dragState, viewState]);

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedNode: null,
      offset: { x: 0, y: 0 }
    });
  }, []);

  const handleSvgClick = (e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
      if (isAddingNode) {
        const rect = svgRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - viewState.pan.x) / viewState.zoom;
        const y = (e.clientY - rect.top - viewState.pan.y) / viewState.zoom;
        
        setNewNodePosition({ x, y });
      } else {
        setSelectedNode(null);
        if (isConnecting) {
          setIsConnecting(false);
          setConnectionStart(null);
          toast.info('Connection cancelled');
        }
      }
    }
  };

  const startEdit = (nodeId: string) => {
    const node = getNodeById(nodeId);
    if (node) {
      setEditingNode(nodeId);
      setEditText(node.label);
    }
  };

  const saveEdit = () => {
    if (editingNode && editText.trim()) {
      updateNode(editingNode, { label: editText.trim() });
      setEditingNode(null);
      setEditText('');
      toast.success('Node updated');
    }
  };

  const cancelEdit = () => {
    setEditingNode(null);
    setEditText('');
  };

  const handleZoom = (delta: number) => {
    setViewState(prev => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(3, prev.zoom + delta))
    }));
  };

  const resetView = () => {
    setViewState({ zoom: 1, pan: { x: 0, y: 0 } });
  };

  const exportMindMap = () => {
    if (!state.conceptMap) return;
    
    const data = JSON.stringify(state.conceptMap, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.conceptMap.title.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Mind map exported');
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  if (!state.conceptMap) {
    return (
      <motion.div 
        className="text-center py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-20 h-20 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Network className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Mind Map Ready
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Upload a PDF document to generate an interactive mind map.
        </p>
        <motion.button
          onClick={generateSampleMindMap}
          className="btn-primary inline-flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
          <span>Create Sample Mind Map</span>
        </motion.button>
      </motion.div>
    );
  }

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Network className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Interactive Mind Map
          </h2>
        </div>

        {/* Toolbar */}
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={() => setIsAddingNode(!isAddingNode)}
            className={`p-2 rounded-lg transition-colors ${
              isAddingNode 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Add Node"
          >
            <Plus className="w-4 h-4" />
          </motion.button>

          <motion.button
            onClick={() => setIsConnecting(!isConnecting)}
            className={`p-2 rounded-lg transition-colors ${
              isConnecting 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Connect Nodes"
          >
            <Network className="w-4 h-4" />
          </motion.button>

          <motion.button
            onClick={() => handleZoom(0.1)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </motion.button>

          <motion.button
            onClick={() => handleZoom(-0.1)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </motion.button>

          <motion.button
            onClick={resetView}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>

          <motion.button
            onClick={exportMindMap}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Export"
          >
            <Download className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Instructions */}
      <AnimatePresence>
        {(isAddingNode || isConnecting) && (
          <motion.div 
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              {isAddingNode && 'Click anywhere on the canvas to add a new node.'}
              {isConnecting && 'Click on two nodes to create a connection between them.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mind Map Canvas */}
      <div className="card p-0 overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-[600px] cursor-grab active:cursor-grabbing"
          onClick={handleSvgClick}
          style={{ background: 'linear-gradient(45deg, #f8fafc 25%, transparent 25%), linear-gradient(-45deg, #f8fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8fafc 75%), linear-gradient(-45deg, transparent 75%, #f8fafc 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}
        >
          <g transform={`translate(${viewState.pan.x}, ${viewState.pan.y}) scale(${viewState.zoom})`}>
            {/* Connections */}
            {state.conceptMap.connections.map(connection => {
              const sourceNode = getNodeById(connection.source);
              const targetNode = getNodeById(connection.target);
              
              if (!sourceNode || !targetNode) return null;
              
              const midX = (sourceNode.x + targetNode.x) / 2;
              const midY = (sourceNode.y + targetNode.y) / 2;
              
              return (
                <g key={connection.id}>
                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke="#6b7280"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    className="hover:stroke-blue-500 cursor-pointer transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this connection?')) {
                        deleteConnection(connection.id);
                      }
                    }}
                  />
                  {connection.label && (
                    <text
                      x={midX}
                      y={midY}
                      textAnchor="middle"
                      className="fill-gray-600 text-xs font-medium pointer-events-none"
                      dy="-5"
                    >
                      {connection.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {state.conceptMap.nodes.map(node => (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size}
                  fill={node.color}
                  stroke={selectedNode === node.id ? '#1f2937' : 'white'}
                  strokeWidth={selectedNode === node.id ? 3 : 2}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                  style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  className="fill-white text-sm font-semibold pointer-events-none select-none"
                  dy="0.35em"
                >
                  {node.label.length > 12 ? `${node.label.substring(0, 12)}...` : node.label}
                </text>
              </g>
            ))}

            {/* Connection preview */}
            {isConnecting && connectionStart && (
              <circle
                cx={getNodeById(connectionStart)?.x}
                cy={getNodeById(connectionStart)?.y}
                r={(getNodeById(connectionStart)?.size || 40) + 5}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeDasharray="5,5"
                className="animate-pulse"
              />
            )}
          </g>
        </svg>
      </div>

      {/* Node Properties Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div 
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Node Properties
            </h3>
            
            {editingNode === selectedNode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Label
                  </label>
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    autoFocus
                  />
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    onClick={saveEdit}
                    className="btn-primary inline-flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </motion.button>
                  <motion.button
                    onClick={cancelEdit}
                    className="btn-outline inline-flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Label
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {getNodeById(selectedNode)?.label}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <div className="flex space-x-2">
                    {colors.map(color => (
                      <button
                        key={color}
                        onClick={() => updateNode(selectedNode, { color })}
                        className={`w-8 h-8 rounded-full border-2 ${
                          getNodeById(selectedNode)?.color === color 
                            ? 'border-gray-900 dark:border-white' 
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Size
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    value={getNodeById(selectedNode)?.size || 40}
                    onChange={(e) => updateNode(selectedNode, { size: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => startEdit(selectedNode)}
                    className="btn-outline inline-flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      if (window.confirm('Delete this node and all its connections?')) {
                        deleteNode(selectedNode);
                      }
                    }}
                    className="btn-outline text-red-600 border-red-600 hover:bg-red-600 hover:text-white inline-flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Node Modal */}
      <AnimatePresence>
        {newNodePosition && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Add New Node
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Label
                  </label>
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter node label..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && editText.trim()) {
                        const nodeId = addNode(newNodePosition.x, newNodePosition.y, editText.trim());
                        setNewNodePosition(null);
                        setEditText('');
                        setIsAddingNode(false);
                        if (nodeId) setSelectedNode(nodeId);
                        toast.success('Node added');
                      }
                      if (e.key === 'Escape') {
                        setNewNodePosition(null);
                        setEditText('');
                      }
                    }}
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setNewNodePosition(null);
                    setEditText('');
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={() => {
                    if (editText.trim()) {
                      const nodeId = addNode(newNodePosition.x, newNodePosition.y, editText.trim());
                      setNewNodePosition(null);
                      setEditText('');
                      setIsAddingNode(false);
                      if (nodeId) setSelectedNode(nodeId);
                      toast.success('Node added');
                    }
                  }}
                  className="btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Add Node
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help */}
      <motion.div 
        className="card p-6 bg-gray-50 dark:bg-gray-800/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          How to Use
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <p>• <strong>Drag nodes:</strong> Click and drag to move nodes around</p>
            <p>• <strong>Add nodes:</strong> Click the + button, then click on canvas</p>
            <p>• <strong>Connect nodes:</strong> Click connect button, then click two nodes</p>
          </div>
          <div>
            <p>• <strong>Edit nodes:</strong> Select a node and click Edit</p>
            <p>• <strong>Delete:</strong> Select node/connection and delete</p>
            <p>• <strong>Zoom:</strong> Use zoom controls to navigate</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}