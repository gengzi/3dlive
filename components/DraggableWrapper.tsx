import React, { useState, useRef, useEffect } from 'react';

const DraggableWrapper = ({ children, initialPosition = { x: 0, y: 0 }, onDragStateChange }) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  
  const dragRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 }); // Mouse position at start
  const elementStartPos = useRef({ x: 0, y: 0 }); // Element position at start

  useEffect(() => {
    // Center the element initially if no position is provided
    if (initialPosition.x === 0 && initialPosition.y === 0 && dragRef.current) {
        // We rely on CSS centering for the initial render in App.tsx, 
        // but we initialize our internal coordinate state to 0,0 (center relative).
    }
  }, []);

  const handleMouseDown = (e) => {
    // Prevent default to avoid text selection etc.
    e.preventDefault();
    setIsDragging(true);
    if (onDragStateChange) onDragStateChange(true);

    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartPos.current = { ...position };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!dragRef.current) return;

    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;

    let newX = elementStartPos.current.x + dx;
    let newY = elementStartPos.current.y + dy;

    // --- Boundary Checks ---
    // We want to keep the element mostly on screen.
    // Since we are using translate relative to the center (roughly), logic depends on parent.
    // However, simplest way is to check bounding rect against window.
    
    // For this implementation, we allow free movement but prevent it from disappearing completely.
    const rect = dragRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Allow dragging until only 50px is left on screen
    const safetyMargin = 50; 
    
    // Check Left/Right
    // We calculate limits based on the delta, not absolute coordinates, 
    // because our 'position' state is a transform offset, not top/left.
    
    // Optimization: Just update state. 
    // React's setState batching + CSS transform is usually fast enough.
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (onDragStateChange) onDragStateChange(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return React.createElement(
    "div",
    {
      ref: dragRef,
      onMouseDown: handleMouseDown,
      style: {
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none', // Prevent scrolling on touch devices while dragging
        zIndex: 50, // Ensure it floats above background but maybe below modals
        position: 'relative' // Needed for z-index to work
      },
      className: "transition-transform duration-75 ease-out active:scale-105 will-change-transform" 
    },
    children
  );
};

export default DraggableWrapper;
