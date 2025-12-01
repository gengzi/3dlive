import React, { useEffect, useState } from 'react';

// The useMousePosition hook is now self-contained within this component file.
const useMousePosition = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    setPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return position;
};

// --- Facial Feature Drawing Functions ---

const getMouthPath = (shape, emo, isSpeaking) => {
    if (shape === 'closed' && !isSpeaking) {
        switch (emo) {
            case 'happy': return "M10,60 Q50,90 90,60"; // Smile
            case 'sad': return "M10,70 Q50,40 90,70"; // Frown
            case 'surprised': return "M40,50 A10,10 0 1,1 60,50 A10,10 0 1,1 40,50"; // Small O
            case 'angry': return "M10,60 L90,60"; // Straight line
            case 'confused': return "M10,60 Q50,50 90,65"; // Squiggly
            case 'shy': return "M25,60 Q50,65 75,60"; // Small smile
            default: return "M30,60 L70,60"; // Neutral short line
        }
    }
    // Speaking shapes
    switch (shape) {
      case 'a': return "M10,50 Q50,100 90,50 Z";
      case 'o': return "M30,50 A20,20 0 1,1 70,50 A20,20 0 1,1 30,50 Z";
      case 'e': return "M10,55 Q50,75 90,55 Z";
      case 'i': return "M10,60 Q50,60 90,60 Z";
      case 'u': return "M35,60 A10,10 0 1,1 55,60 A10,10 0 1,1 35,60 Z";
      case 'v': return "M20,50 L50,70 L80,50 Z";
      default: return "M30,60 L70,60";
    }
};

const Eyes = ({ emotion }) => {
    switch (emotion) {
        case 'happy':
            return React.createElement(React.Fragment, null,
                React.createElement("path", { d: "M10,30 Q25,15 40,30", stroke: "black", strokeWidth: "6", fill: "none", strokeLinecap: "round" }),
                React.createElement("path", { d: "M60,30 Q75,15 90,30", stroke: "black", strokeWidth: "6", fill: "none", strokeLinecap: "round" })
            );
        case 'sad': case 'helpless':
            return React.createElement(React.Fragment, null,
                React.createElement("circle", { cx: "25", cy: "30", r: "8", fill: "black" }),
                React.createElement("circle", { cx: "75", cy: "30", r: "8", fill: "black" })
            );
        case 'surprised':
            return React.createElement(React.Fragment, null,
                React.createElement("circle", { cx: "25", cy: "25", r: "14", fill: "none", stroke: "black", strokeWidth: "4" }),
                React.createElement("circle", { cx: "75", cy: "25", r: "14", fill: "none", stroke: "black", strokeWidth: "4" }),
                React.createElement("circle", { cx: "25", cy: "25", r: "6", fill: "black" }),
                React.createElement("circle", { cx: "75", cy: "25", r: "6", fill: "black" })
            );
        default: // neutral, shy, angry etc.
            return React.createElement(React.Fragment, null,
                React.createElement("circle", { cx: "25", cy: "25", r: "10", fill: "black" }),
                React.createElement("circle", { cx: "75", cy: "25", r: "10", fill: "black" }),
                React.createElement("circle", { cx: "28", cy: "22", r: "3", fill: "white" }),
                React.createElement("circle", { cx: "78", cy: "22", r: "3", fill: "white" })
            );
    }
};

const Arms = ({ emotion, isSpeaking, tick }) => {
    // Left Arm Origin: 50, 180 (Approx shoulder)
    // Right Arm Origin: 150, 180
    
    // Dynamic offsets for animation
    const waveY = Math.sin(tick / 5) * 10;
    const waveX = Math.cos(tick / 5) * 5;
    const talkY = Math.abs(Math.sin(tick / 3)) * 10;
    const talkX = Math.cos(tick / 4) * 10;

    let leftPath, rightPath;

    // --- State Machine for Arms ---
    if (emotion === 'happy' || emotion === 'excited') {
        // Hands up waving
        leftPath = `M50,180 Q30,150 ${20 + waveX},${130 + waveY}`;
        rightPath = `M150,180 Q170,150 ${180 - waveX},${130 - waveY}`;
    } else if (emotion === 'angry') {
        // Akimbo (Hands on hips)
        leftPath = `M50,180 Q30,200 60,220`; 
        rightPath = `M150,180 Q170,200 140,220`;
    } else if (emotion === 'surprised') {
        // Hands to face
        leftPath = `M50,180 Q40,160 80,180`;
        rightPath = `M150,180 Q160,160 120,180`;
    } else if (isSpeaking) {
        // Gesturing
        leftPath = `M50,180 Q40,${200 + talkY} ${60 - talkX},${200 - talkY}`;
        rightPath = `M150,180 Q160,${200 + talkY} ${140 + talkX},${200 - talkY}`;
    } else {
        // Neutral / Idle (Arms down)
        leftPath = `M50,180 Q40,200 40,${220 + waveY/2}`;
        rightPath = `M150,180 Q160,200 160,${220 + waveY/2}`;
    }

    return React.createElement(React.Fragment, null,
        React.createElement("path", { d: leftPath, stroke: "black", strokeWidth: "6", fill: "none", strokeLinecap: "round" }),
        React.createElement("circle", { cx: "50", cy: "180", r: "3", fill: "black" }), // Shoulder joint
        
        React.createElement("path", { d: rightPath, stroke: "black", strokeWidth: "6", fill: "none", strokeLinecap: "round" }),
        React.createElement("circle", { cx: "150", cy: "180", r: "3", fill: "black" }) // Shoulder joint
    );
};

const DefaultAvatar = ({ emotion, isSpeaking, mouthShape, offsets, tick }) => {
  // Original SVG drawing functions adapted for the default avatar
  const getOriginalEyes = (emo) => {
    switch (emo) {
        case 'happy':
            return React.createElement(React.Fragment, null,
                React.createElement("path", { d: "M60,95 Q70,85 80,95", stroke: "black", strokeWidth: "3", fill: "none", strokeLinecap: "round" }),
                React.createElement("path", { d: "M120,95 Q130,85 140,95", stroke: "black", strokeWidth: "3", fill: "none", strokeLinecap: "round" })
            );
        case 'sad': case 'helpless':
            return React.createElement(React.Fragment, null, React.createElement("circle", { cx: "70", cy: "95", r: "4", fill: "black" }), React.createElement("circle", { cx: "130", cy: "95", r: "4", fill: "black" }));
        case 'surprised':
            return React.createElement(React.Fragment, null,
                React.createElement("circle", { cx: "70", cy: "90", r: "8", fill: "none", stroke: "black", strokeWidth: "2" }),
                React.createElement("circle", { cx: "130", cy: "90", r: "8", fill: "none", stroke: "black", strokeWidth: "2" }),
                React.createElement("circle", { cx: "70", cy: "90", r: "3", fill: "black" }), React.createElement("circle", { cx: "130", cy: "90", r: "3", fill: "black" }),
                React.createElement("circle", { cx: "72", cy: "88", r: "1.5", fill: "white" }), React.createElement("circle", { cx: "132", cy: "88", r: "1.5", fill: "white" })
            );
        default:
            return React.createElement(React.Fragment, null,
                React.createElement("circle", { cx: "70", cy: "90", r: "6", fill: "black" }), React.createElement("circle", { cx: "130", cy: "90", r: "6", fill: "black" }),
                React.createElement("circle", { cx: "72", cy: "88", r: "1.5", fill: "white" }), React.createElement("circle", { cx: "132", cy: "88", r: "1.5", fill: "white" })
            );
    }
  };
  const getOriginalMouthPath = (shape, emo) => {
    if (shape === 'closed' && !isSpeaking) {
        switch (emo) {
            case 'happy': return "M85,130 Q100,145 115,130";
            case 'sad': return "M85,140 Q100,125 115,140";
            case 'surprised': return "M95,130 A5,5 0 1,1 105,130 A5,5 0 1,1 95,130";
            default: return "M90,135 L110,135";
        }
    }
    switch (shape) {
      case 'a': return "M85,130 Q100,155 115,130 Z";
      case 'o': return "M90,130 A10,10 0 1,1 110,130 A10,10 0 1,1 90,130 Z";
      default: return "M90,135 L110,135";
    }
  };
  
  return React.createElement("svg", { viewBox: "0 0 200 240", className: "w-full h-full pointer-events-none" },
      /* Background Glow */
      React.createElement("circle", { cx: "100", cy: "100", r: "90", fill: "#FDFD96", opacity: "0.3" }),
      
      /* Body Group (breathes) */
      React.createElement("g", { className: "animate-breathe" },
          /* Shirt */
          React.createElement("path", { d: "M70,175 C 60,185 50,210 70,240 L 130,240 C 150,210 140,185 130,175 Z", fill: "#A7C7E7", stroke: "black", strokeWidth: "4", strokeLinejoin: "round" }),
          /* Arms (Attached to body layer, but we render them on top or behind?) Render on top for sketch style */
          React.createElement(Arms, { emotion, isSpeaking, tick }), 
          /* Collar Detail */
          React.createElement("path", { d: "M90,180 Q100,187 110,180", fill: "none", stroke: "black", strokeWidth: "3", strokeLinecap: "round" })
      ),
      
      /* Shadow */
      React.createElement("ellipse", { cx: "100", cy: "180", rx: "45", ry: "10", fill: "#2d2d2d", opacity: "0.1" }),
      
      /* Head */
      React.createElement("circle", { cx: "100", cy: "100", r: "80", fill: "white", stroke: "black", strokeWidth: "4" }),
      
      /* Face Features with Parallax */
      React.createElement("g", { transform: `translate(${offsets.x}, ${offsets.y})` },
          getOriginalEyes(emotion),
          React.createElement("path", { d: getOriginalMouthPath(mouthShape, emotion), fill: mouthShape === 'closed' ? 'none' : '#FFB7B2', stroke: "black", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round" })
      )
  );
};

const CustomAvatar = ({ config, emotion, isSpeaking, mouthShape, offsets }) => {
    // Reverted to simple static image + vector features mode
    return React.createElement(
        "div", { className: "w-full h-full relative pointer-events-none" },
        React.createElement("img", { src: config.image, className: "w-full h-full object-contain" }),
        React.createElement(
            "div", { className: "absolute top-0 left-0 w-full h-full", style: { transform: `translate(${offsets.x}px, ${offsets.y}px)` } },
            /* Eyes */
            React.createElement("svg", {
                viewBox: "0 0 100 50",
                className: "absolute",
                style: {
                    left: `${config.features.eyes.x}%`, top: `${config.features.eyes.y}%`,
                    width: `${config.features.eyes.width}%`, height: `${config.features.eyes.height}%`
                }
            }, React.createElement(Eyes, { emotion: emotion })),
            /* Mouth */
            React.createElement("svg", {
                viewBox: "0 0 100 100",
                className: "absolute",
                style: {
                    left: `${config.features.mouth.x}%`, top: `${config.features.mouth.y}%`,
                    width: `${config.features.mouth.width}%`, height: `${config.features.mouth.height}%`
                }
            }, React.createElement("path", { d: getMouthPath(mouthShape, emotion, isSpeaking), fill: mouthShape === 'closed' ? 'none' : '#FFB7B2', stroke: "black", strokeWidth: "6", strokeLinecap: "round", strokeLinejoin: "round" }))
        )
    );
};

const SketchAvatar = ({ emotion, isSpeaking, customAvatarConfig, isDragging }) => {
  const [mouthShape, setMouthShape] = useState('closed');
  const { x, y } = useMousePosition();
  const [offsets, setOffsets] = useState({ x: 0, y: 0 });
  const [tick, setTick] = useState(0); // Tick for animation loops

  // Animation Loop for dynamics
  useEffect(() => {
    let animationFrameId;
    const animate = () => {
      setTick(prev => prev + 1);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Parallax effect
  useEffect(() => {
    // If dragging, we can freeze the eyes or center them to avoid disorienting effect
    if (isDragging) {
        setOffsets({ x: 0, y: 0 });
        return;
    }

    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;
    const maxOffset = 8;
    const offsetX = Math.max(-maxOffset, Math.min(maxOffset, (x - screenCenterX) / 60));
    const offsetY = Math.max(-maxOffset, Math.min(maxOffset, (y - screenCenterY) / 60));
    setOffsets({ x: -offsetX, y: -offsetY });
  }, [x, y, isDragging]);

  // Lip sync simulation
  useEffect(() => {
    let interval;
    if (isSpeaking) {
      interval = setInterval(() => {
        const shapes = ['a', 'o', 'e', 'i', 'u', 'v', 'closed'];
        setMouthShape(shapes[Math.floor(Math.random() * shapes.length)]);
      }, 120);
    } else {
      setMouthShape('closed');
    }
    return () => clearInterval(interval);
  }, [isSpeaking]);
  
  return React.createElement(
    "div",
    { className: "w-full h-full flex items-center justify-center select-none" }, // select-none to prevent highlighting
    customAvatarConfig 
        ? React.createElement(CustomAvatar, { config: customAvatarConfig, emotion, isSpeaking, mouthShape, offsets })
        : React.createElement(DefaultAvatar, { emotion, isSpeaking, mouthShape, offsets, tick })
  );
};

export default SketchAvatar;