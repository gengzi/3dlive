import React, { useEffect, useState } from 'react';
import { Emotion, MouthShape } from '../types';
import { useMousePosition } from '../hooks/useMousePosition';

interface AvatarProps {
  emotion: Emotion;
  isSpeaking: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ emotion, isSpeaking }) => {
  const [mouthShape, setMouthShape] = useState<MouthShape>('closed');
  const { x, y } = useMousePosition();
  const [offsets, setOffsets] = useState({ x: 0, y: 0 });

  // Parallax effect for head turning
  useEffect(() => {
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;
    
    // Max pixels the features can move
    const maxOffset = 8;
    
    // Calculate displacement based on mouse position relative to the center of the screen
    const offsetX = Math.max(-maxOffset, Math.min(maxOffset, (x - screenCenterX) / 60));
    const offsetY = Math.max(-maxOffset, Math.min(maxOffset, (y - screenCenterY) / 60));
    
    // Move features in the opposite direction of the mouse for a natural "looking" effect
    setOffsets({ x: -offsetX, y: -offsetY });

  }, [x, y]);

  // Lip sync simulation effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isSpeaking) {
      // While speaking, cycle randomly through vowel shapes to simulate talking
      interval = setInterval(() => {
        const shapes: MouthShape[] = ['a', 'o', 'e', 'i', 'u', 'v', 'closed'];
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        setMouthShape(randomShape);
      }, 120); // 120ms update rate roughly matches syllable speed
    } else {
      setMouthShape('closed');
    }

    return () => clearInterval(interval);
  }, [isSpeaking]);

  // -- SVG Path Generators based on State --

  // 1. Mouth Paths
  const getMouthPath = (shape: MouthShape, emo: Emotion) => {
    // If neutral/silent, shape depends on emotion
    if (shape === 'closed' && !isSpeaking) {
        switch (emo) {
            case 'happy': return "M85,130 Q100,145 115,130"; // Smile
            case 'sad': return "M85,140 Q100,125 115,140"; // Frown
            case 'surprised': return "M95,130 A5,5 0 1,1 105,130 A5,5 0 1,1 95,130"; // Small O
            case 'angry': return "M85,135 L115,135"; // Straight line
            case 'confused': return "M85,135 Q100,130 115,138"; // Squiggly
            case 'shy': return "M90,135 Q100,138 110,135"; // Small smile
            default: return "M90,135 L110,135"; // Neutral short line
        }
    }

    // Speaking shapes (overrides emotion static mouth)
    switch (shape) {
      case 'a': return "M85,130 Q100,155 115,130 Z"; // Big open
      case 'o': return "M90,130 A10,10 0 1,1 110,130 A10,10 0 1,1 90,130 Z"; // Round
      case 'e': return "M85,132 Q100,142 115,132 Z"; // Wide flat
      case 'i': return "M85,135 Q100,135 115,135 Z"; // Very narrow
      case 'u': return "M95,135 A5,5 0 1,1 105,135 A5,5 0 1,1 95,135 Z"; // Small round
      case 'v': return "M90,130 L100,140 L110,130 Z"; // Triangle-ish
      default: return "M90,135 L110,135"; // Closed
    }
  };

  // 2. Eye Paths (Left and Right)
  const getEyes = (emo: Emotion) => {
    // Base positions: Left(70, 90), Right(130, 90)
    switch (emo) {
        case 'happy': // Arcs ^^
            return (
                <>
                    <path d="M60,95 Q70,85 80,95" stroke="black" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <path d="M120,95 Q130,85 140,95" stroke="black" strokeWidth="3" fill="none" strokeLinecap="round" />
                </>
            );
        case 'sad': // Arcs down
        case 'helpless':
            return (
                <>
                     <circle cx="70" cy="95" r="4" fill="black" />
                     <circle cx="130" cy="95" r="4" fill="black" />
                </>
            );
        case 'surprised': // Wide circles with gleam
            return (
                <>
                    <circle cx="70" cy="90" r="8" fill="none" stroke="black" strokeWidth="2" />
                    <circle cx="130" cy="90" r="8" fill="none" stroke="black" strokeWidth="2" />
                    <circle cx="70" cy="90" r="3" fill="black" />
                    <circle cx="130" cy="90" r="3" fill="black" />
                    <circle cx="72" cy="88" r="1.5" fill="white" />
                    <circle cx="132" cy="88" r="1.5" fill="white" />
                </>
            );
        case 'angry': // eyes slightly squinted
            return (
                <>
                    <path d="M60,90 L80,90" stroke="black" strokeWidth="3" fill="none" />
                    <path d="M120,90 L140,90" stroke="black" strokeWidth="3" fill="none" />
                </>
            );
        case 'shy': 
        case 'neutral':
        default: // Default eyes with gleam
            return (
                <>
                    <circle cx="70" cy="90" r="6" fill="black" />
                    <circle cx="130" cy="90" r="6" fill="black" />
                    <circle cx="72" cy="88" r="1.5" fill="white" />
                    <circle cx="132" cy="88" r="1.5" fill="white" />
                </>
            );
    }
  };

  // 3. Eyebrow Paths
  const getEyebrows = (emo: Emotion) => {
      switch(emo) {
          case 'angry': 
            return (
                <>
                    <path d="M55,75 L85,85" stroke="black" strokeWidth="3" strokeLinecap="round" />
                    <path d="M145,75 L115,85" stroke="black" strokeWidth="3" strokeLinecap="round" />
                </>
            );
          case 'sad':
          case 'helpless':
            return (
                <>
                    <path d="M55,80 L85,75" stroke="black" strokeWidth="3" strokeLinecap="round" />
                    <path d="M145,80 L115,75" stroke="black" strokeWidth="3" strokeLinecap="round" />
                </>
            );
          case 'surprised':
             return (
                <>
                    <path d="M60,70 Q70,60 80,70" stroke="black" strokeWidth="3" strokeLinecap="round" />
                    <path d="M120,70 Q130,60 140,70" stroke="black" strokeWidth="3" strokeLinecap="round" />
                </>
            );
          case 'confused':
             return (
                <>
                    <path d="M60,75 L80,75" stroke="black" strokeWidth="3" strokeLinecap="round" />
                    <path d="M120,70 Q130,60 140,70" stroke="black" strokeWidth="3" strokeLinecap="round" />
                </>
            );
          default: // Neutral/Happy slightly arched
             return (
                <>
                    <path d="M60,75 Q70,72 80,75" stroke="black" strokeWidth="3" strokeLinecap="round" />
                    <path d="M120,75 Q130,72 140,75" stroke="black" strokeWidth="3" strokeLinecap="round" />
                </>
            );
      }
  }

  // 4. Blush (for Shy/Happy)
  const getBlush = (emo: Emotion) => {
      if (emo === 'shy' || emo === 'happy' || emo === 'excited') {
          return (
              <>
                <ellipse cx="55" cy="110" rx="10" ry="5" fill="#FFB7B2" opacity="0.6" />
                <ellipse cx="145" cy="110" rx="10" ry="5" fill="#FFB7B2" opacity="0.6" />
              </>
          )
      }
      return null;
  }
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg 
        viewBox="0 0 200 240" 
        className="w-full h-full max-h-[500px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Aura */}
        <circle cx="100" cy="100" r="90" fill="#FDFD96" opacity="0.3" />

        {/* Body - T-shirt shape with breathing animation */}
        <g className="animate-breathe">
            <path 
                d="M70,175 C 60,185 50,210 70,240 L 130,240 C 150,210 140,185 130,175 Z" 
                fill="#A7C7E7" 
                stroke="black" 
                strokeWidth="4" 
                strokeLinejoin="round"
            />
            {/* Collar */}
            <path d="M90,180 Q100,187 110,180" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"/>
        </g>
        
        {/* Shadow under head for depth */}
        <ellipse cx="100" cy="180" rx="45" ry="10" fill="#2d2d2d" opacity="0.1" />
        
        {/* Head */}
        <circle 
            cx="100" 
            cy="100" 
            r="80" 
            fill="white" 
            stroke="black" 
            strokeWidth="4" 
        />
          
        {/* Parallax Group: Contains all facial features */}
        <g transform={`translate(${offsets.x}, ${offsets.y})`}>
          {/* Facial features */}
          {getEyebrows(emotion)}
          {getEyes(emotion)}
          {getBlush(emotion)}

          {/* Mouth */}
          <path 
              d={getMouthPath(mouthShape, emotion)} 
              fill={mouthShape === 'closed' ? 'none' : '#FFB7B2'} 
              stroke="black" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
          />
        </g>
        
      </svg>
    </div>
  );
};

export default Avatar;