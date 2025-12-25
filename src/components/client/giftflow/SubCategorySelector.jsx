"use client"
import { useState, useEffect, useCallback, useRef } from 'react';
import { getOccasionCategories } from '@/lib/action/occasionAction';
import {
  X, Upload, Download, Type, Image as ImageIcon, Layers,
  Trash2, Copy, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, Lock, Unlock,
  Minus, Plus, RotateCw, ZoomIn, ZoomOut, Palette
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { goBack, goNext, setLoading, setSelectedSubCategory, setSubCategories, setError } from '../../../redux/giftFlowSlice';
import { useSearchParams } from 'next/navigation';
import { saveCustomCard } from '../../../lib/action/customCardAction';

// Utility functions
const createLayer = (type, id, props = {}) => ({
  id: id || `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  type,
  x: 50,
  y: 50,
  rotation: 0,
  opacity: 100,
  scale: 1,
  isMoving: false,
  ...props
});

const emojis = ['🎉', '🎂', '🎁', '🎈', '💝', '🌟', '🎊', '🥳', '💐', '🌹', '❤️', '🎵', '⭐', '🔥', '✨'];
const bgColors = ['#FF6B35', '#FF8A5C', '#E55A2B', '#2D5A3D', '#3B6B4F', '#F5F3E7', '#FFFFFF', '#F8F9FA', '#4169E1', '#9370DB', '#FF69B4', '#32CD32'];
const textColors = ['#FFFFFF', '#000000', '#1F2937', '#374151', '#FF6B35', '#4169E1', '#32CD32', '#FF69B4', '#8B4513', '#2D5A3D'];

// Draggable Layer Component
const DraggableLayer = ({ layer, isSelected, onMouseDown }) => {
  return (
    <div
      className={`absolute ${layer.locked ? 'cursor-not-allowed' : 'cursor-move'} ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{
        left: `${layer.x}%`,
        top: `${layer.y}%`,
        transform: `translate(-50%, -50%) rotate(${layer.rotation || 0}deg)`,
        opacity: layer.opacity / 100,
        pointerEvents: layer.locked ? 'none' : 'auto',
        transformOrigin: 'center',
        zIndex: isSelected ? 10 : 1,
        // Fixed: For images, use a wrapper that doesn't shrink
        ...(layer.type === 'image' && {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '50px', // Minimum width for selection ring
          minHeight: '50px', // Minimum height for selection ring
        }),
      }}
      onMouseDown={(e) => onMouseDown(e, layer.id)}
    >
      {(() => {
        switch (layer.type) {
          case 'text':
            return (
              <div
                className="select-none whitespace-nowrap"
                style={{
                  fontSize: `${layer.fontSize}px`,
                  fontWeight: layer.fontWeight,
                  color: layer.color,
                  textAlign: layer.textAlign,
                  fontStyle: layer.fontStyle,
                  textDecoration: layer.textDecoration,
                  fontFamily: layer.fontFamily,
                  pointerEvents: 'none',
                }}
              >
                {layer.content}
              </div>
            );
          case 'emoji':
            return (
              <div
                className="select-none"
                style={{
                  fontSize: `${layer.scale * 60}px`,
                  lineHeight: 1,
                  pointerEvents: 'none',
}}
              >
                {layer.content}
</div>
            );
          case 'image':
            return (
              <img
                src={layer.src}
                alt="layer"
                className="select-none"
                style={{
                  width: `${layer.width}px`,
                  height: `${layer.height}px`,
                  objectFit: 'contain',
                  display: 'block',
                  pointerEvents: 'none',
                  flexShrink: 0, // Prevent image from shrinking
                }}
                draggable={false}
              />
            );
          default:
            return null;
        }
      })()}
    </div>
  );
};

// Fixed: Advanced Card Creator with proper dragging
const AdvancedCardCreator = ({ onSave, onCancel }) => {
  const [layers, setLayers] = useState([
    createLayer('background', 'bg', {
      bgColor: '#FFFFFF',
      bgImage: null,
      locked: true,
      name: 'Background'
    }),
    createLayer('emoji', 'emoji', {
      content: '🎉',
      name: 'Emoji',
      fontSize: 60,
      x: 50,
      y: 30,
    }),
    createLayer('text', 'title', {
      content: 'Happy Birthday!',
      fontSize: 36,
      fontWeight: 'bold',
      color: '#1F2937',
      textAlign: 'center',
      fontStyle: 'normal',
      textDecoration: 'none',
      fontFamily: 'Inter, sans-serif',
      name: 'Title',
      x: 50,
      y: 50,
    }),
    createLayer('text', 'description', {
      content: 'Wishing you all the best on your special day.',
      fontSize: 18,
      fontWeight: 'normal',
      color: '#4B5563',
      textAlign: 'center',
      fontStyle: 'normal',
      textDecoration: 'none',
      name: 'Description',
      x: 50,
      y: 70,
    })
  ]);

  const [selectedLayer, setSelectedLayer] = useState('title');
  const [isDragging, setIsDragging] = useState(false);
  const [cornerRadius, setCornerRadius] = useState(16);
  const [canvasSize] = useState({ width: 400, height: 500 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Drag tracking with original size preservation
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    startLayerX: 0,
    startLayerY: 0,
    layerId: null,
    originalWidth: 0,
    originalHeight: 0
  });

  const cardRef = useRef(null);
  const imageInputRef = useRef(null);
  const bgImageInputRef = useRef(null);

  const selectedLayerData = layers.find(l => l.id === selectedLayer);
  const bgLayer = layers.find(l => l.id === 'bg');

  // Fixed: Layer management with size preservation
  const updateLayer = useCallback((id, updates) => {
    setLayers(prev => prev.map(l => {
      if (l.id === id) {
        // For images, ensure width/height are preserved if not explicitly changed
        if (l.type === 'image') {
          return {
            ...l,
            ...updates,
            width: 'width' in updates ? updates.width : l.width,
            height: 'height' in updates ? updates.height : l.height
          };
        }
        return { ...l, ...updates };
      }
      return l;
    }));
  }, []);

  const addLayer = useCallback((type, props = {}) => {
    const newLayer = createLayer(type, null, {
      name: type.charAt(0).toUpperCase() + type.slice(1),
      ...props
    });
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayer(newLayer.id);
  }, []);

  const deleteLayer = useCallback((id) => {
    if (id === 'bg') return;
    setLayers(prev => prev.filter(l => l.id !== id));
    if (selectedLayer === id) setSelectedLayer('bg');
  }, [selectedLayer]);

  const duplicateLayer = useCallback((id) => {
    const layer = layers.find(l => l.id === id);
    if (!layer || id === 'bg') return;
    const newLayer = {
      ...layer,
      id: `${layer.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: layer.x + 10,
      y: layer.y + 10,
      name: `${layer.name} Copy`
    };
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayer(newLayer.id);
  }, [layers]);

  const toggleLock = useCallback((id) => {
    updateLayer(id, { locked: !layers.find(l => l.id === id)?.locked });
  }, [layers, updateLayer]);

  // Fixed: Drag handler that only changes position
  const handleMouseDown = useCallback((e, layerId) => {
    e.preventDefault();
    e.stopPropagation();

    const layer = layers.find(l => l.id === layerId);
    if (!layer || layer.locked || layerId === 'bg') return;

    setSelectedLayer(layerId);

    // Store initial state
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startLayerX: layer.x,
      startLayerY: layer.y,
      layerId,
      // Store original dimensions to prevent any size changes
originalWidth: layer.width || 0,
      originalHeight: layer.height || 0
    };

    setIsDragging(true);
  }, [layers]);

  // Fixed: Mouse move - only updates position, preserves size
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !dragRef.current.layerId) return;

    const rect = cardRef.current.getBoundingClientRect();
    const { startX, startY, startLayerX, startLayerY } = dragRef.current;

    // Calculate movement in pixels
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // Convert to percentage of canvas
    const deltaXPercent = (deltaX / rect.width) * 100;
    const deltaYPercent = (deltaY / rect.height) * 100;

    // Calculate new position
    const newX = startLayerX + deltaXPercent;
    const newY = startLayerY + deltaYPercent;

    // Clamp to canvas (0-100%)
    const clampedX = Math.max(0, Math.min(100, newX));
    const clampedY = Math.max(0, Math.min(100, newY));

    // Update ONLY position
    updateLayer(dragRef.current.layerId, {
      x: clampedX,
      y: clampedY
    });
  }, [isDragging, updateLayer]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragRef.current = {
      startX: 0,
      startY: 0,
      startLayerX: 0,
      startLayerY: 0,
      layerId: null,
      originalWidth: 0,
      originalHeight: 0
    };
  }, []);

  // Image handling
  const handleImageUpload = useCallback((e, forBackground = false) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new window.Image();
      img.src = reader.result;
      img.onload = () => {
        if (forBackground) {
          updateLayer('bg', { bgImage: reader.result, bgColor: null });
        } else {
          const maxWidth = canvasSize.width * 0.5;
          const maxHeight = canvasSize.height * 0.5;
          const aspectRatio = img.width / img.height;

          let width = Math.min(maxWidth, img.width);
          let height = width / aspectRatio;

          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }

          addLayer('image', {
            src: reader.result,
            width,
            height,
            originalWidth: img.width,
            originalHeight: img.height,
            aspectRatio,
            name: 'Image',
            x: 50,
            y: 50
          });
        }
      };
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [addLayer, updateLayer, canvasSize]);

  // Fixed: Image resize handler - only changes size
  const handleImageResize = useCallback((newWidth, newHeight) => {
    if (!selectedLayerData || selectedLayerData.type !== 'image') return;

    updateLayer(selectedLayer, {
      width: Math.max(20, Math.min(400, newWidth)),
      height: Math.max(20, Math.min(400, newHeight))
    });
  }, [selectedLayerData, selectedLayer, updateLayer]);

  // Export
  const exportCard = useCallback(async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
  
    try {
        const canvas = document.createElement('canvas');
        const scale = 2;
        canvas.width = canvasSize.width * scale;
        canvas.height = canvasSize.height * scale;
        const ctx = canvas.getContext('2d');
    
        const bgLayer = layers.find(l => l.id === 'bg');
        if (bgLayer.bgImage) {
            const img = new window.Image();
            await new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
                img.src = bgLayer.bgImage;
            });
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = bgLayer.bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    
        for (const layer of layers.slice(1)) {
            ctx.save();
            ctx.globalAlpha = layer.opacity / 100;
    
            const x = (layer.x / 100) * canvas.width;
            const y = (layer.y / 100) * canvas.height;
            const rotation = layer.rotation || 0;
    
            ctx.translate(x, y);
            ctx.rotate(rotation * Math.PI / 180);
    
            if (layer.type === 'text') {
                const fontStyle = layer.fontStyle === 'italic' ? 'italic ' : '';
                const fontWeight = layer.fontWeight || 'normal';
                ctx.font = `${fontStyle}${fontWeight} ${layer.fontSize * scale}px ${layer.fontFamily}`;
                ctx.fillStyle = layer.color;
                ctx.textAlign = layer.textAlign;
                ctx.textBaseline = 'middle';
                ctx.fillText(layer.content, 0, 0);
            } else if (layer.type === 'emoji') {
                ctx.font = `${layer.scale * 60 * scale}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(layer.content, 0, 0);
            } else if (layer.type === 'image') {
                const img = new window.Image();
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve;
                    img.src = layer.src;
                });
                const width = layer.width * scale;
                const height = layer.height * scale;
                ctx.drawImage(img, -width / 2, -height / 2, width, height);
            }
    
            ctx.restore();
        }
  
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        if (!blob) {
            throw new Error("Canvas blob is empty");
        }

        const blobToBase64 = (blob) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = (error) => reject(error);
            });
        };

        const base64data = await blobToBase64(blob);

        const response = await fetch('/api/save-card', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: base64data }),
        });
      
        if (response.ok) {
            const result = await response.json();
            alert(`Card saved successfully at ${result.path}`);
        } else {
            const errorData = await response.json().catch(() => ({ error: 'Failed to save card' }));
            throw new Error(errorData.details || errorData.error || 'Failed to save card');
        }
    } catch (error) {
        console.error('Export failed:', error);
        alert(`Failed to save card. Please try again. Error: ${error.message}`);
    } finally {
        setIsGenerating(false);
    }
  }, [layers, canvasSize]);

  const handleSave = useCallback(async () => {
    const bgLayer = layers.find(l => l.id === 'bg');
    const titleLayer = layers.find(l => l.id === 'title');
    const descLayer = layers.find(l => l.id === 'description');
    const emojiLayer = layers.find(l => l.id === 'emoji');

    const drawCanvas = async () => {
      const canvas = document.createElement('canvas');
      const scale = 2;
      canvas.width = canvasSize.width * scale;
      canvas.height = canvasSize.height * scale;
      const ctx = canvas.getContext('2d');

      // Draw background
      if (bgLayer.bgImage) {
        const img = new window.Image();
        await new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve; // so it doesn't hang
          img.src = bgLayer.bgImage;
        });
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = bgLayer.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw other layers
      for (const layer of layers.slice(1)) {
        ctx.save();
        ctx.globalAlpha = layer.opacity / 100;

        const x = (layer.x / 100) * canvas.width;
        const y = (layer.y / 100) * canvas.height;
        const rotation = layer.rotation || 0;

        ctx.translate(x, y);
        ctx.rotate(rotation * Math.PI / 180);

        if (layer.type === 'text') {
          const fontStyle = layer.fontStyle === 'italic' ? 'italic ' : '';
          const fontWeight = layer.fontWeight || 'normal';
          ctx.font = `${fontStyle}${fontWeight} ${layer.fontSize * scale}px ${layer.fontFamily}`;
          ctx.fillStyle = layer.color;
          ctx.textAlign = layer.textAlign;
          ctx.textBaseline = 'middle';
          ctx.fillText(layer.content, 0, 0);
        } else if (layer.type === 'emoji') {
          ctx.font = `${layer.scale * 60 * scale}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(layer.content, 0, 0);
        } else if (layer.type === 'image') {
          const img = new window.Image();
          await new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
            img.src = layer.src;
          });
          const width = layer.width * scale;
          const height = layer.height * scale;
          ctx.drawImage(img, -width / 2, -height / 2, width, height);
        }

        ctx.restore();
      }

      return canvas;
    };

    try {
      const canvas = await drawCanvas();
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      
      if (!blob) {
        throw new Error("Canvas blob is empty");
      }

      const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            resolve(reader.result);
          };
          reader.onerror = (error) => reject(error);
        });
      };
      
        
      const base64data = await blobToBase64(blob);

      const response = await fetch('/api/save-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file: base64data }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save card image.' }));
        throw new Error(errorData.details || errorData.error || 'Failed to save card image.');
      }

      const data = await response.json();
      const imagePath = data.path;
      

      const result = await saveCustomCard({
        name: titleLayer?.content || 'Custom Card',
        description: descLayer?.content || '',
        emoji: emojiLayer?.content || '🎉',
        image: imagePath,
        category: "CUSTOM",
      });

      console.log("Custom card created successfully:", result);
      if (!result.success) {
        throw new Error(result.message);
      }

      onSave(result.data);

    } catch (error) {
      console.error("Failed to save custom card:", error);
      alert(`Sorry, there was an error saving your custom card: ${error.message}`);
    }
  }, [layers, cornerRadius, onSave, canvasSize]);

  // Event listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-black">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Custom Card Creator</h2>
            <p className="text-sm text-gray-500 mt-1">Design your perfect card</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportCard}
              disabled={isGenerating}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Export
                </>
              )}
            </button>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Tools */}
          <div className="w-16 bg-gray-50 border-r border-gray-100 flex flex-col py-4 gap-2">
            <button
              onClick={() => addLayer('text', { content: 'New Text', textAlign: 'center' })}
              className="tool-btn"
              title="Add Text"
            >
              <Type size={18} />
            </button>
            <button
              onClick={() => imageInputRef.current?.click()}
              className="tool-btn"
              title="Add Image"
            >
              <ImageIcon size={18} />
              <input ref={imageInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, false)} />
            </button>
            <button
              onClick={() => addLayer('emoji', { content: '🎉' })}
              className="tool-btn"
              title="Add Emoji"
            >
              <span className="text-lg">😊</span>
            </button>
            <div className="h-px bg-gray-200 my-2" />
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-2">Zoom</div>
              <div className="flex flex-col items-center gap-1">
                <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="tool-btn-sm">
                  <ZoomIn size={14} />
                </button>
                <div className="text-xs font-medium text-gray-700">{Math.round(zoom * 100)}%</div>
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="tool-btn-sm">
                  <ZoomOut size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto">
            <div className="relative" style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s' }}>
              <div
                ref={cardRef}
                className="shadow-lg border border-gray-200"
                style={{
                  width: `${canvasSize.width}px`,
                  height: `${canvasSize.height}px`,
                  borderRadius: `${cornerRadius}px`,
                  // FIXED: Proper background handling
                  ...(bgLayer?.bgImage 
                    ? { 
                        backgroundImage: `url(${bgLayer.bgImage})`,
                        backgroundColor: 'transparent' 
                      }
                    : { 
                        backgroundColor: bgLayer?.bgColor || '#FFFFFF',
                        backgroundImage: 'none'
                      }),
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  cursor: isDragging ? 'grabbing' : 'default',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {layers.slice(1).map(layer => (
                  <DraggableLayer
                    key={layer.id}
                    layer={layer}
                    isSelected={selectedLayer === layer.id}
                    onMouseDown={handleMouseDown}
                  />
                ))}
              </div>
            </div>
            
            {/* Background status indicator */}
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <div 
                className="w-4 h-4 rounded border border-gray-300"
                style={{ 
                  backgroundColor: bgLayer?.bgImage ? 'transparent' : bgLayer?.bgColor,
                  backgroundImage: bgLayer?.bgImage ? `url(${bgLayer.bgImage})` : 'none',
                  backgroundSize: 'cover'
                }}
              />
              <span>
                Background: {bgLayer?.bgImage ? 'Image' : `Color (${bgLayer?.bgColor || '#FFFFFF'})`}
              </span>
            </div>
          </div>

          {/* Right Properties Panel */}
          <div className="w-80 border-l border-gray-100 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Layers Panel */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Layers size={16} />
                    <h3 className="text-sm font-semibold">Layers</h3>
                  </div>
                  <span className="text-xs text-gray-500">{layers.length} items</span>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {[...layers].reverse().map(layer => (
                    <div
                      key={layer.id}
                      onClick={() => !layer.locked && setSelectedLayer(layer.id)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${selectedLayer === layer.id ? 'bg-blue-50 border border-blue-100' : 'bg-white hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleLock(layer.id); }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                        </button>
                        <span className="text-sm truncate">{layer.name}</span>
                      </div>
                      <div className="flex gap-1">
                        {layer.id !== 'bg' && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); duplicateLayer(layer.id); }} className="p-1 hover:bg-gray-200 rounded">
                              <Copy size={12} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }} className="p-1 hover:bg-red-100 text-red-600 rounded">
                              <Trash2 size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Layer Properties */}
              {selectedLayerData && (
                <div className="space-y-4">
                  {/* Background - FIXED */}
                  {selectedLayerData.type === 'background' && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold mb-3">Background</h3>
                      <div className="grid grid-cols-6 gap-2 mb-3">
                        {bgColors.map(color => (
                          <button
                            key={color}
                            onClick={() => {
                              // Clear any existing background image
                              if (bgImageInputRef.current) bgImageInputRef.current.value = '';
                              // Update with new color
                              updateLayer('bg', { 
                                bgColor: color, 
                                bgImage: null 
                              });
                            }}
                            className={`w-7 h-7 rounded transition-transform hover:scale-110 ${
                              selectedLayerData.bgColor === color && !selectedLayerData.bgImage 
                                ? 'ring-3 ring-blue-500 ring-offset-2' 
                                : 'ring-1 ring-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => bgImageInputRef.current?.click()}
                        className="w-full py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                      >
                        {selectedLayerData.bgImage ? 'Change Background Image' : 'Upload Background Image'}
                      </button>
                      {selectedLayerData.bgImage && (
                        <button
                          onClick={() => {
                            updateLayer('bg', { 
                              bgImage: null, 
                              bgColor: '#FFFFFF' 
                            });
                          }}
                          className="w-full mt-2 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors"
                        >
                          Remove Image (Use Color)
                        </button>
                      )}
                      <input 
                        ref={bgImageInputRef} 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(e, true)} 
                      />
                    </div>
                  )}

                  {/* Text */}
                  {selectedLayerData.type === 'text' && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <h3 className="text-sm font-semibold">Text</h3>
                      <textarea
                        value={selectedLayerData.content}
                        onChange={(e) => updateLayer(selectedLayer, { content: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        rows={2}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => updateLayer(selectedLayer, { fontWeight: selectedLayerData.fontWeight === 'bold' ? 'normal' : 'bold' })}
                          className={`py-2 rounded ${selectedLayerData.fontWeight === 'bold' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        >
                          <Bold size={14} className="mx-auto" />
                        </button>
                        <button
                          onClick={() => updateLayer(selectedLayer, { fontStyle: selectedLayerData.fontStyle === 'italic' ? 'normal' : 'italic' })}
                          className={`py-2 rounded ${selectedLayerData.fontStyle === 'italic' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        >
                          <Italic size={14} className="mx-auto" />
                        </button>
                        <button
                          onClick={() => updateLayer(selectedLayer, { textDecoration: selectedLayerData.textDecoration === 'underline' ? 'none' : 'underline' })}
                          className={`py-2 rounded ${selectedLayerData.textDecoration === 'underline' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        >
                          <Underline size={14} className="mx-auto" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {['left', 'center', 'right'].map(align => (
                          <button
                            key={align}
                            onClick={() => updateLayer(selectedLayer, { textAlign: align })}
                            className={`py-2 rounded ${selectedLayerData.textAlign === align ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                          >
                            {align === 'left' && <AlignLeft size={14} className="mx-auto" />}
                            {align === 'center' && <AlignCenter size={14} className="mx-auto" />}
                            {align === 'right' && <AlignRight size={14} className="mx-auto" />}
                          </button>
                        ))}
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Font Size: {selectedLayerData.fontSize}px</label>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateLayer(selectedLayer, { fontSize: Math.max(8, selectedLayerData.fontSize - 2) })} className="p-1 bg-gray-200 rounded">
                            <Minus size={12} />
                          </button>
                          <input
                            type="range"
                            min="8"
                            max="72"
                            value={selectedLayerData.fontSize}
                            onChange={(e) => updateLayer(selectedLayer, { fontSize: Number(e.target.value) })}
                            className="flex-1"
                          />
                          <button onClick={() => updateLayer(selectedLayer, { fontSize: Math.min(72, selectedLayerData.fontSize + 2) })} className="p-1 bg-gray-200 rounded">
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {textColors.map(color => (
                          <button
                            key={color}
                            onClick={() => updateLayer(selectedLayer, { color })}
                            className={`w-6 h-6 rounded ${selectedLayerData.color === color ? 'ring-2 ring-blue-500' : ''}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Image */}
                  {selectedLayerData.type === 'image' && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold mb-3">Image Controls</h3>
                      
                      <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Position:</span>
                            <div className="font-medium">X: {Math.round(selectedLayerData.x)}%</div>
                          </div>
                          <div>
                            <span className="text-gray-500">&nbsp;</span>
                            <div className="font-medium">Y: {Math.round(selectedLayerData.y)}%</div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Drag the image in canvas to change position
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-medium">Width: {Math.round(selectedLayerData.width)}px</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleImageResize(selectedLayerData.width - 10, selectedLayerData.height)}
                              className="p-1.5 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                              disabled={selectedLayerData.width <= 20}
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              type="range"
                              min="20"
                              max="400"
                              value={selectedLayerData.width}
                              onChange={(e) => handleImageResize(Number(e.target.value), selectedLayerData.height)}
                              className="flex-1"
                            />
                            <button
                              onClick={() => handleImageResize(selectedLayerData.width + 10, selectedLayerData.height)}
                              className="p-1.5 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                              disabled={selectedLayerData.width >= 400}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-medium">Height: {Math.round(selectedLayerData.height)}px</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleImageResize(selectedLayerData.width, selectedLayerData.height - 10)}
                              className="p-1.5 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                              disabled={selectedLayerData.height <= 20}
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              type="range"
                              min="20"
                              max="400"
                              value={selectedLayerData.height}
                              onChange={(e) => handleImageResize(selectedLayerData.width, Number(e.target.value))}
                              className="flex-1"
                            />
                            <button
                              onClick={() => handleImageResize(selectedLayerData.width, selectedLayerData.height + 10)}
                              className="p-1.5 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                              disabled={selectedLayerData.height >= 400}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Emoji */}
                  {selectedLayerData.type === 'emoji' && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold mb-3">Emoji</h3>
                      <div className="grid grid-cols-5 gap-2 mb-3">
                        {emojis.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => updateLayer(selectedLayer, { content: emoji })}
                            className="text-xl hover:bg-gray-200 rounded p-1"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Scale: {selectedLayerData.scale.toFixed(1)}x</label>
                        <input
                          type="range"
                          min="0.5"
                          max="3"
                          step="0.1"
                          value={selectedLayerData.scale}
                          onChange={(e) => updateLayer(selectedLayer, { scale: Number(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Common Settings */}
                  {selectedLayerData.type !== 'background' && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold mb-3">Settings</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Rotation: {selectedLayerData.rotation || 0}°</label>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={selectedLayerData.rotation || 0}
                            onChange={(e) => updateLayer(selectedLayer, { rotation: Number(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Opacity: {selectedLayerData.opacity}%</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={selectedLayerData.opacity}
                            onChange={(e) => updateLayer(selectedLayer, { opacity: Number(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Canvas Settings */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold mb-3">Canvas</h3>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Corner Radius: {cornerRadius}px</label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={cornerRadius}
                        onChange={(e) => setCornerRadius(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSave}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700"
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .tool-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: #4B5563;
          background: white;
          border: 1px solid #E5E7EB;
          margin: 0 auto;
          cursor: pointer;
        }
        .tool-btn:hover {
          background: #F3F4F6;
          border-color: #D1D5DB;
        }
        .tool-btn-sm {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          color: #4B5563;
          background: white;
          border: 1px solid #E5E7EB;
          cursor: pointer;
        }
        .tool-btn-sm:hover {
          background: #F3F4F6;
        }
        input[type="range"] {
          -webkit-appearance: none;
          height: 4px;
          background: #D1D5DB;
          border-radius: 2px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: #3B82F6;
          border-radius: 50%;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

// Main Component
export default function SubCategorySelector() {
  const dispatch = useDispatch();
  const { selectedOccasion, subCategories, loading, error, subCategoriesPagination, currentSubCategoryPage, selectedSubCategory } = useSelector((state) => state.giftFlowReducer);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedOccasionName, setSelectedOccationName] = useState('');
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const isBulkMode = mode === 'bulk';

  const fetchSubCategories = useCallback(async (page) => {
    if (!selectedOccasion) return;
    try {
      dispatch(setLoading(true));
      const response = await getOccasionCategories({ occasionId: selectedOccasion, limit: 8, page });

      if (response.success) {
        dispatch(setSubCategories({
          data: response.data,
          page: page,
          pagination: response.meta.pagination
        }));
        setSelectedOccationName(response.meta.occasion.name);
      } else {
        dispatch(setError(response.message || "Failed to fetch sub-categories."));
      }
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, selectedOccasion]);

  useEffect(() => {
    if (selectedOccasion) fetchSubCategories(1);
  }, [selectedOccasion, fetchSubCategories]);

  const handleSubCategorySelect = useCallback((subCategory) => {
    dispatch(setSelectedSubCategory(subCategory));
    dispatch(goNext());
  }, [dispatch]);

  const handleCustomCardSave = useCallback((customCardData) => {
    dispatch(setSelectedSubCategory(customCardData));
    setIsCustomizing(false);
    dispatch(goNext());
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    if (subCategoriesPagination?.hasNextPage) {
      fetchSubCategories(currentSubCategoryPage + 1);
    }
  }, [subCategoriesPagination, currentSubCategoryPage, fetchSubCategories]);

  if (loading && currentSubCategoryPage === 1) {
    return (
      <div className="min-h-screen py-30 flex items-center justify-center bg-[#FBF9F4]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-dashed rounded-full animate-spin border-pink-500 mx-auto"></div>
          <h2 className="text-xl font-medium text-gray-900 mt-4">Loading Designs...</h2>
          <p className="text-gray-600 text-sm">Getting things ready for you!</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-30 flex items-center justify-center bg-[#FBF9F4]">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-red-600">Oops! Something went wrong.</h2>
          <p className="text-gray-600 mt-2 text-sm">{error}</p>
          <button onClick={() => fetchSubCategories(1)} className="mt-4 bg-gradient-to-r from-pink-500 to-orange-400 text-white px-6 py-2.5 rounded-lg font-medium transition-colors text-sm hover:from-pink-600 hover:to-orange-500">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF] py-30">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back Button */}
        <div className="p-0.5 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 inline-block mb-8">
          <button onClick={() => dispatch(goBack())} className="flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-rose-50 transition-all duration-200 shadow-sm hover:shadow-md">
            <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.75 2.80128C-0.25 3.37863 -0.25 4.822 0.75 5.39935L5.25 7.99743C6.25 8.57478 7.5 7.85309 7.5 6.69839V1.50224C7.5 0.347537 6.25 -0.374151 5.25 0.2032L0.75 2.80128Z" fill="url(#paint0_linear_584_1923)"></path>
              <defs><linearGradient id="paint0_linear_584_1923" x1="7.5" y1="3.01721" x2="-9.17006" y2="13.1895" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ED457D"></stop><stop offset="1" stopColor="#FA8F42"></stop>
              </linearGradient></defs>
            </svg>
            <span className="text-base font-semibold text-gray-800">Previous</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          {isBulkMode && (
            <div className="w-full flex items-center justify-center mb-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#FA8F42] to-[#ED457D]"></div>
              <div className="rounded-full p-px bg-gradient-to-r from-[#ED457D] to-[#FA8F42] mx-4">
                <div className="px-4 py-1.5 bg-white rounded-full">
                  <span className="text-gray-700 font-semibold text-sm whitespace-nowrap">Bulk Gifting</span>
                </div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#ED457D] to-[#FA8F42]"></div>
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Pick a {selectedOccasionName} Design They'll Love
          </h1>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            Select from our curated collection of beautiful, emotionally engaging {selectedOccasionName} cards
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Custom Card Option */}
          <div onClick={() => setIsCustomizing(true)} className="group cursor-pointer">
            <div className="h-full rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl bg-gradient-to-b from-[#FFF5F5] to-white p-2 border-2 border-dashed border-[#FFB4B4] hover:border-pink-400">
              <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
                <div className="w-14 h-14 rounded-2xl border-2 border-[#FF69B4] flex items-center justify-center mb-6 bg-white group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-[#FF69B4]" strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-base text-gray-900 mb-3 text-center">Upload your Own Design</h3>
                <p className="text-gray-600 text-sm text-center mb-6">Use your own design or photo</p>
                <div className="w-full border-t border-gray-200 mb-6"></div>
                <p className="text-gray-900 text-sm font-semibold text-center mb-1">JPG or PNG</p>
                <p className="text-gray-500 text-xs text-center">Max 5MB Vertical layout preferred</p>
              </div>
            </div>
          </div>

          {/* Category Cards */}
          {subCategories.map((subCategory, index) => (
            <div key={`${subCategory.id}-${index}`} onClick={() => handleSubCategorySelect(subCategory)} className="group cursor-pointer">
              <div className={`h-full bg-white rounded-2xl p-2 overflow-hidden transition-all duration-300 hover:shadow-xl border ${selectedSubCategory?.id === subCategory.id ? 'border-2 border-blue-500' : 'border-gray-200 hover:border-pink-200'}`}>
                <div className="w-full h-64 overflow-hidden rounded-2xl bg-gray-100">
                  {subCategory.image ? (
                    <img src={subCategory.image} alt={subCategory.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center">
                      <span className="text-6xl opacity-80">{subCategory.emoji || '🎁'}</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{subCategory.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">{subCategory.description}</p>
                  <button className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold text-sm rounded-full transition-all duration-200 hover:shadow-lg hover:from-pink-600 hover:to-orange-500 flex items-center justify-center gap-2">
                    Choose this Design
                    <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z" fill="white" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        {!loading && subCategoriesPagination?.hasNextPage && (
          <div className="text-center">
            <button onClick={handleLoadMore} className="bg-white text-gray-700 px-8 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 hover:border-pink-300 transition-all duration-200 text-sm">
              Show More Categories
            </button>
          </div>
        )}
        {loading && currentSubCategoryPage > 1 && (
          <div className="text-center">
            <div className="inline-flex items-center text-gray-600">
              <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-pink-500 mr-2"></div>
              <span className="text-sm">Loading more...</span>
            </div>
          </div>
        )}
      </div>

      {isCustomizing && <AdvancedCardCreator onSave={handleCustomCardSave} onCancel={() => setIsCustomizing(false)} />}
    </div>
  );
}