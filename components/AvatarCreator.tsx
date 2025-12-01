import React, { useState, useRef, useEffect, FC, ReactNode, MouseEvent } from 'react';

// FIX: Added a props interface for type safety.
interface DraggableFeatureProps {
  id: string;
  initialConfig: { x: number; y: number; width: number; height: number; };
  onUpdate: (id: string, config: { x: number; y: number; width: number; height: number; }) => void;
  parentRef: React.RefObject<HTMLElement | null>;
  children: ReactNode;
}

// A resizable and draggable component for facial features
const DraggableFeature: FC<DraggableFeatureProps> = ({ id, initialConfig, onUpdate, parentRef, children }) => {
  const [pos, setPos] = useState({ x: initialConfig.x, y: initialConfig.y });
  const [size, setSize] = useState({ w: initialConfig.width, h: initialConfig.height });
  const dragInfo = useRef({ isDragging: false, isResizing: false, startX: 0, startY: 0, startW: 0, startH: 0, startPosX: 0, startPosY: 0 });
  const featureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onUpdate(id, { x: pos.x, y: pos.y, width: size.w, height: size.h });
  }, [pos, size, id, onUpdate]);
  
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>, action: 'drag' | 'resize') => {
    e.preventDefault();
    e.stopPropagation();

    dragInfo.current = {
      ...dragInfo.current,
      startX: e.clientX,
      startY: e.clientY,
      startW: size.w,
      startH: size.h,
      startPosX: pos.x,
      startPosY: pos.y,
    };
    
    if (action === 'drag') {
        dragInfo.current.isDragging = true;
    } else if (action === 'resize') {
        dragInfo.current.isResizing = true;
    }
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: globalThis.MouseEvent) => {
    if (!parentRef.current) return;
    const parentRect = parentRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragInfo.current.startX) / parentRect.width) * 100;
    const dy = ((e.clientY - dragInfo.current.startY) / parentRect.height) * 100;
    
    if (dragInfo.current.isDragging) {
      setPos({
        x: Math.max(0, Math.min(100 - size.w, dragInfo.current.startPosX + dx)),
        y: Math.max(0, Math.min(100 - size.h, dragInfo.current.startPosY + dy)),
      });
    } else if (dragInfo.current.isResizing) {
      setSize({
          w: Math.max(5, Math.min(100 - pos.x, dragInfo.current.startW + dx)),
          h: Math.max(5, Math.min(100 - pos.y, dragInfo.current.startH + dy)),
      });
    }
  };

  const handleMouseUp = () => {
    dragInfo.current.isDragging = false;
    dragInfo.current.isResizing = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return React.createElement(
      "div",
      {
        ref: featureRef,
        onMouseDown: (e) => handleMouseDown(e, 'drag'),
        style: {
          position: 'absolute',
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          width: `${size.w}%`,
          height: `${size.h}%`,
          cursor: 'move',
          border: '2px dashed rgba(255, 255, 255, 0.7)',
          boxShadow: '0 0 10px rgba(0,0,0,0.5)'
        }
      },
      children,
       React.createElement(
        "div",
        {
          onMouseDown: (e) => handleMouseDown(e, 'resize'),
          style: {
            position: 'absolute',
            bottom: '0px',
            right: '0px',
            width: '15px',
            height: '15px',
            background: 'white',
            border: '2px solid black',
            cursor: 'nwse-resize'
          }
        }
      )
  );
};

// --- Image Compression Utility ---
const resizeAndCompressImage = (file, maxWidth, maxHeight, quality) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Failed to get canvas context'));
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};


const AvatarCreator = ({ onSave, onClose }) => {
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [features, setFeatures] = useState({
      eyes: { x: 25, y: 30, width: 50, height: 20 },
      mouth: { x: 35, y: 60, width: 30, height: 15 }
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        const compressedDataUrl = await resizeAndCompressImage(file, 512, 512, 0.8);
        setBgImage(compressedDataUrl as string);
      } catch (error) {
        console.error("Failed to process image:", error);
        alert("Could not process the selected image.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleFeatureUpdate = (id, newConfig) => {
      setFeatures(prev => ({ ...prev, [id]: newConfig }));
  };

  const handleSave = () => {
      try {
        if (!bgImage) return;
        const config = { mode: 'sketch', image: bgImage, features: features };
        onSave(config);
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          alert("Image is too large to save. Try a simpler image.");
        } else {
          console.error(e);
          alert("Error saving avatar.");
        }
      }
  };

  return React.createElement(
    "div",
    {
      style: { zIndex: 100 },
      className: "fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center p-4"
    },
    React.createElement(
        "div",
        { className: "bg-pastel-bg border-4 border-black rounded-lg shadow-lg p-6 w-full max-w-3xl text-center relative max-h-[90vh] overflow-y-auto" },
        
        /* Close button */
        React.createElement(
            "button",
            { onClick: onClose, className: "absolute top-2 right-2 p-2 rounded-full bg-white border-2 border-black hover:bg-pastel-pink transition-colors" },
            React.createElement("svg", { xmlns:"http://www.w3.org/2000/svg", className:"h-6 w-6", fill:"none", viewBox:"0 0 24 24", stroke:"currentColor", strokeWidth: 2 }, 
                React.createElement("path", { strokeLinecap:"round", strokeLinejoin:"round", d:"M6 18L18 6M6 6l12 12" })
            )
        ),

        React.createElement("h2", { className: "text-2xl font-bold mb-4" }, "Create Custom Avatar"),
        React.createElement("p", { className: "mb-6 text-gray-600" }, "Upload any image and place the eyes and mouth!"),

        React.createElement(
            "div",
            { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
            React.createElement(
                "div",
                { className: "flex flex-col items-center space-y-4 p-4 border-2 border-dashed border-sketch-black rounded-lg" },
                React.createElement("h3", { className: "font-bold" }, "1. Upload Sketch"),
                React.createElement("input", { type: "file", accept: "image/*", onChange: handleImageUpload, className: "text-sm", disabled: isProcessing }),
                React.createElement("p", { className: "text-xs text-gray-500" }, "Upload a drawing, an object, or a photo."),
                isProcessing && React.createElement("p", { className: "text-xs animate-pulse" }, "Processing...")
            ),
            React.createElement(
                "div",
                { ref: previewRef, className: "w-full aspect-square bg-gray-200 border-2 border-black rounded-lg relative overflow-hidden flex items-center justify-center" },
                bgImage 
                    ? React.createElement("img", { src: bgImage, className: "w-full h-full object-contain" }) 
                    : React.createElement("div", { className: "text-gray-500" }, "Preview Area"),
                bgImage && !isProcessing && React.createElement(
                    React.Fragment,
                    null,
                    React.createElement(DraggableFeature, { id: 'eyes', initialConfig: features.eyes, onUpdate: handleFeatureUpdate, parentRef: previewRef }, 
                        React.createElement("div", { className: "w-full h-full flex items-center justify-center text-white font-bold text-xs bg-black bg-opacity-50" }, "EYES")
                    ),
                    React.createElement(DraggableFeature, { id: 'mouth', initialConfig: features.mouth, onUpdate: handleFeatureUpdate, parentRef: previewRef },
                        React.createElement("div", { className: "w-full h-full flex items-center justify-center text-white font-bold text-xs bg-black bg-opacity-50" }, "MOUTH")
                    )
                )
            )
        ),

        /* Save Button */
        React.createElement(
            "button",
            { 
                onClick: handleSave, 
                disabled: isProcessing || !bgImage,
                className: "mt-6 px-6 py-3 bg-pastel-green border-2 border-black rounded-full shadow-[4px_4px_0px_black] font-bold text-lg hover:bg-green-400 transition-colors disabled:opacity-50 disabled:shadow-none" 
            }, "Save Avatar"
        )
    )
  );
};

export default AvatarCreator;