import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableProps {
    children: React.ReactNode
}


const Droppable: React.FC<DroppableProps> = ({ children }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: 'droppable',
    });

    return (
        <div ref={setNodeRef}>
            {children}
        </div>
    );
}

export default Droppable