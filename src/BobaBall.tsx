import React from 'react';
import { CSSProperties } from 'react';

interface BobaBallProps {
  id: number;
  left: number;
  bottom: number;
  size: number;
  strawPositionLeft: number;
  startSuck: boolean;
}

const BobaBall: React.FC<BobaBallProps> = ({ id, left, bottom, size, startSuck, strawPositionLeft }) => {
  const style: CSSProperties = {
    zIndex: 2,
    transition: startSuck ? `bottom ${suckVelocity}ms ease-out` : undefined,
    width: size,
    height: size,
    backgroundColor: '#1b110e',
    borderRadius: '50%',
    position: 'absolute' as 'absolute',
    left: startSuck ? strawPositionLeft : left,
    bottom: startSuck ? `calc(100% - ${100}px)` : `${bottom}px`,
  };
  return <div style={style} id={`boba-${id}`}></div>;
};

export const suckVelocity = 1000;

export default BobaBall;
