import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSSProperties } from 'react';

interface Position {
  left: number;
  top: number;
}

interface DraggableStrawProps {
  width: number;
  position: Position;
  heightOffset: number;
}

const DraggableStraw: React.FC<DraggableStrawProps> = ({ width, heightOffset, position }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'straw',
  });

  const strawTopOffset = 220;

  const refStyle: CSSProperties = {
    zIndex: 2,
    width,
    top: 0,
    bottom: heightOffset + strawTopOffset, // Set the height to full screen minus the offset
    position: 'absolute' as 'absolute',
    cursor: 'move',
    left: position.left,
    transition: 'bottom 1000ms ease-in',
    transform: transform ? `translate3d(${transform.x}px, 0, 0)` : 'none', // Only allow horizontal movement
  }

  const strawStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    top: strawTopOffset,
    backgroundColor: '#209ec7',
    position: 'relative' as 'relative',
    opacity: "25%",
    boxShadow: 'inset -3px 0 0 0 black, inset 3px 0 0 0 black', // Add black borders
  };

  const imageStyle: CSSProperties = {
    top: 0,
    height: 250,
    width: "auto",
    left: -80,
    position: 'absolute' as 'absolute',
  };



  return (
  <div ref={setNodeRef} style={refStyle} {...attributes} {...listeners}>
    <img style={imageStyle} src="/momo-cropped.png" />
    <div style={strawStyle}></div>
  </div>
  );
};

export default DraggableStraw;