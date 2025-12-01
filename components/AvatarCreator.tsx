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
// FIX: Typed the component with FC<DraggableFeatureProps> to correctly handle props and children.
const DraggableFeature: FC<DraggableFeatureProps> = ({ id, initialConfig, onUpdate, parentRef, children }) => {
  const [pos, setPos] = useState({ x: initialConfig.x, y: initialConfig.y });
  const [size, setSize] = useState({ w: initialConfig.width, h: initialConfig.height });
  // FIX: Added startPosX and startPosY to the dragInfo ref to store initial drag positions.
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
        // FIX: Use dragInfo.current.startPosX to calculate new position based on the initial position.
        x: Math.max(0, Math.min(100 - size.w, dragInfo.current.startPosX + dx)),
        // FIX: Use dragInfo.current.startPosY to calculate new position based on the initial position.
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

const AvatarCreator = ({ onSave, onClose }) => {
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [features, setFeatures] = useState({
      eyes: { x: 25, y: 30, width: 50, height: 20 },
      mouth: { x: 35, y: 60, width: 30, height: 15 }
  });
  const previewRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBgImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFeatureUpdate = (id, newConfig) => {
      setFeatures(prev => ({ ...prev, [id]: newConfig }));
  };

  const handleSave = () => {
      if(bgImage) {
          onSave({ image: bgImage, features: features });
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
        { className: "bg-pastel-bg border-4 border-black rounded-lg shadow-lg p-6 w-full max-w-2xl text-center relative" },
        /* Close button */
        React.createElement(
            "button",
            { onClick: onClose, className: "absolute top-2 right-2 p-2 rounded-full bg-white border-2 border-black hover:bg-pastel-pink transition-colors" },
            React.createElement("svg", { xmlns:"http://www.w3.org/2000/svg", className:"h-6 w-6", fill:"none", viewBox:"0 0 24 24", stroke:"currentColor", strokeWidth: 2 }, 
                React.createElement("path", { strokeLinecap:"round", strokeLinejoin:"round", d:"M6 18L18 6M6 6l12 12" })
            )
        ),

        React.createElement("h2", { className: "text-2xl font-bold mb-4" }, "Create Your Avatar"),
        React.createElement("p", { className: "mb-4 text-sm" }, "Upload a sketch image, then position and resize the features."),

        /* Main Content Area */
        React.createElement(
            "div",
            { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
            /* Controls */
            React.createElement(
                "div",
                { className: "flex flex-col items-center justify-center space-y-4 p-4 border-2 border-dashed border-sketch-black rounded-lg" },
                React.createElement("h3", { className: "font-bold" }, "1. Upload Image"),
                React.createElement("input", { type: "file", accept: "image/*", onChange: handleImageUpload, className: "text-sm" }),
                React.createElement("h3", { className: "font-bold mt-6" }, "2. Adjust Features"),
                React.createElement("p", { className: "text-xs text-gray-600" }, "Drag to move, use the white handle to resize.")
            ),

            /* Preview */
            React.createElement(
                "div",
                { ref: previewRef, className: "w-full aspect-square bg-gray-200 border-2 border-black rounded-lg relative overflow-hidden" },
                bgImage ? React.createElement("img", { src: bgImage, className: "w-full h-full object-contain" }) : React.createElement("div", { className: "flex items-center justify-center h-full text-gray-500" }, "Preview"),
                bgImage && React.createElement(
                    React.Fragment,
                    null,
                    // FIX: Explicitly passing children to a properly typed FC component resolves the error.
                    React.createElement(DraggableFeature, { id: 'eyes', initialConfig: features.eyes, onUpdate: handleFeatureUpdate, parentRef: previewRef }, 
                        React.createElement("div", { className: "w-full h-full flex items-center justify-center text-white font-bold text-xs bg-black bg-opacity-50" }, "EYES")
                    ),
                    // FIX: Explicitly passing children to a properly typed FC component resolves the error.
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
                disabled: !bgImage,
                className: "mt-6 px-6 py-3 bg-pastel-green border-2 border-black rounded-full shadow-[4px_4px_0px_black] font-bold text-lg hover:bg-green-400 transition-colors disabled:opacity-50 disabled:shadow-none" 
            }, "Save Avatar"
        )
    )
  );
};

export default AvatarCreator;
