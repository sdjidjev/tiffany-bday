import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DndContext, DragOverlay, useDroppable } from '@dnd-kit/core';
import BobaBall, { suckVelocity } from './BobaBall';
import DraggableStraw from './DraggableStraw';
import { CSSProperties } from 'react';
import Droppable from './Droppable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

interface Position {
  top: number;
  left: number;
}

interface BobaPosition {
  left: number;
  bottom: number;
}

interface BobaBallState {
  id: number;
  ballIndexWithinRow: number;
  ballRow: number;
  startSuck: boolean,
  isSucked: boolean;
  position: BobaPosition;
}

const numberOfBalls = 30;
const numberOfRows = 5;
const numberOfBallsPerRow = numberOfBalls / numberOfRows;

const App: React.FC = () => {
  const defaultRowCountArray = Array(numberOfRows).fill(numberOfBallsPerRow);
  const defaultBallSize = 50;
  const [ballSize, setBallSize] = useState<number>(defaultBallSize);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [activeRow, setActiveRow] = useState<number>(numberOfRows);
  const [rowCount, setRowCount] = useState<number[]>(defaultRowCountArray);
  const [strawSize, setStrawSize] = useState<number>(defaultBallSize);
  const [isDraggingStraw, setIsDraggingStraw] = useState<boolean>(false);
  const [bobaBalls, setBobaBalls] = useState<BobaBallState[]>([]);
  const [draggingStrawPosition, setDraggingStrawPosition] = useState<Position>({ left: 50, top: 0 });
  const positionRef = useRef(draggingStrawPosition);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  positionRef.current = draggingStrawPosition; // Always keep the ref updated with the latest position
  const [strawPosition, setStrawPosition] = useState<Position>({ left: 50, top: 0 });
  useEffect(() => {
    const updateBallSize = () => {
      const screenWidth = window.innerWidth;
      const adjustmentSize = 6; // some value to make it slightly larger than exactly needed
      const newSize = Math.ceil(screenWidth / (numberOfBallsPerRow + 1)) + adjustmentSize;
      setBallSize(newSize);
      setStrawSize(newSize);
    };

    updateBallSize();
    window.addEventListener('resize', updateBallSize);

    return () => {
      window.removeEventListener('resize', updateBallSize);
    };
  }, [gameStarted]);

  const setUpBalls = useCallback((screenWidth: number) => {
    const leftoverBallSpace = screenWidth - (ballSize * numberOfBallsPerRow)
    const leftShiftedRowPositionStart = 8
    const rightShiftedRowPositionStart = 0.7 * leftoverBallSpace
    var randomSectionOfLeftoverBallSpace = 3;
    var remainingSpaceEquallyDivided = 0;
    setRowCount(defaultRowCountArray);
    setBobaBalls(() => {
      var ballLeft = 0
      return Array.from(
        { length: numberOfBalls },
        (_, index) => {
          const ballIndexWithinRow = index % numberOfBallsPerRow;
          const ballRow = Math.floor(index / numberOfBallsPerRow);

          if (ballIndexWithinRow == 0) {
            if (randomSectionOfLeftoverBallSpace == leftShiftedRowPositionStart) {
              randomSectionOfLeftoverBallSpace = rightShiftedRowPositionStart
            } else {
              randomSectionOfLeftoverBallSpace = leftShiftedRowPositionStart
            }
            remainingSpaceEquallyDivided =
              (leftoverBallSpace - randomSectionOfLeftoverBallSpace) /
              (numberOfBallsPerRow - 1)
            ballLeft = randomSectionOfLeftoverBallSpace
          } else {
            ballLeft += ballSize + remainingSpaceEquallyDivided / numberOfBallsPerRow
          }
          return {
            id: index,
            ballRow,
            ballIndexWithinRow,
            left: ballLeft,
            isSucked: false,
            startSuck: false,
            position: {
              left: ballLeft,
              bottom: ballRow * ballSize + 3,
            } as BobaPosition
          }
        }
      ).reverse()
    });
  }, [gameStarted, ballSize, setBobaBalls]);

  useEffect(() => {
    const screenWidth = window.innerWidth;
    setWindowWidth(screenWidth);
    setUpBalls(screenWidth);
    setActiveRow(numberOfRows);
  }, [gameStarted, ballSize, setBobaBalls])

  const suckBoba = (position: Position) => {
    bobaBalls.every((ball, index) => {
      if (!ball.isSucked && !ball.startSuck) {
        // Assuming the straw has a fixed width and spans the height of the viewport
        const strawLeft = position.left;
        const strawRight = strawLeft + 10; // width of the straw
        const ballLeft = ball.position.left; // Ball's left position in percentage
        const ballRight = ballLeft + ballSize; // Ball's width, assuming it fits within 3% of the viewport width

        // Check if the ball is within the horizontal range of the straw
        if (strawLeft <= ballRight && strawRight >= ballLeft) {
          const ballRow = ball.ballRow
          setRowCount((prevRowCounts) => {
            const updatedRows = [...prevRowCounts]
            console.log('ballRow', ballRow);
            updatedRows[ball.ballRow] = prevRowCounts[ball.ballRow] - 1
            console.log('updated Rows', updatedRows)
            if (updatedRows[ball.ballRow] == 0) {
              setActiveRow((activeRow) => activeRow - 1)
            }
            return updatedRows
          })
          setBobaBalls((prevBalls) => {
            const updatedBalls = [...prevBalls]
            updatedBalls[index].startSuck = true;
            return updatedBalls;
          })
          setTimeout(() => {
            setBobaBalls((prevBalls) => {
              const updatedBalls = [...prevBalls]
              updatedBalls[index].isSucked = true;
              return updatedBalls;
            })
          }, suckVelocity + 1);
          if (JSON.stringify(rowCount) == JSON.stringify([0,0,0,0,0])) {
            setGameStarted(false);
          }
          return false;
        }
      }
      return true;
    });
  };

  const startGameAgain = () => {
    setGameStarted(false);
    setUpBalls(windowWidth);
  }

  const handleDragMove = (event: any) => {
    const { delta } = event;
    setIsDraggingStraw(true);
    setDraggingStrawPosition(() => {
      const newPosition = { left: strawPosition.left + delta.x, top: 0 }
      return newPosition;
    });
  }

  const handleDragEnd = (event: any) => {
    setIsDraggingStraw(false);
    const { delta } = event;
    setStrawPosition((prev) => {
      const newPosition = { left: prev.left + delta.x, top: 0 }
      suckBoba(newPosition)
      return newPosition;
    });
  };


  useEffect(() => {
    var suckBobaInterval: string | number | NodeJS.Timeout | undefined;
    if (isDraggingStraw) {
      suckBobaInterval = setInterval(() => {
        suckBoba(positionRef.current);
      }, 500)
    }
    return () => {
      if (suckBobaInterval) {
        clearInterval(suckBobaInterval);
      }
    };
  }, [isDraggingStraw]);

  const appStyle: CSSProperties = {
    position: 'relative' as 'relative',
    width: '100%',
    height: '100vh',
  };

  const imgStyle: CSSProperties = {
    width: 250,
    margin: '0 auto'
  }

  const dialogueStyle: CSSProperties = {
    height: '100%',
    margin: "38px 28px",
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    flexDirection: 'column',
    fontSize: 28,
  }
  if (!gameStarted) {
    return (
      <div style={dialogueStyle}>
        <img style={imgStyle} src="/momo-dialogue.png" />
        <p>
          Hey it's me, Momo!
        </p>
        <p>
          Help me celebrate Tiffany's birthday by drinking all her boba!
        </p>
        <button className="modern-button" onClick={() => setGameStarted(true)}>Let's get slurping!</button>
      </div>

    );
  } else if (JSON.stringify(rowCount) != JSON.stringify([0,0,0,0,0])) {
    return (
      <DndContext onDragMove={handleDragMove} onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
        <Droppable>
          <div id="app-style" style={appStyle}>
            {bobaBalls.map((ball) => !ball.isSucked &&
              <BobaBall
                key={ball.id}
                id={ball.id}
                size={ballSize}
                left={ball.position.left}
                strawPositionLeft={draggingStrawPosition.left}
                startSuck={ball.startSuck}
                bottom={ball.position.bottom}
              />
            )}
            <DraggableStraw
              width={strawSize}
              position={strawPosition}
              heightOffset={activeRow * ballSize - ballSize * 0.8}
            />
          </div>
        </Droppable>
      </DndContext >
    );
  } else {
    return (
      <div style={dialogueStyle}>
        <img style={imgStyle} src="/momo-dialogue.png" />
        <p>
          Thank you for helping me out.
          <br /><br />Another successful day of eating human food!
        </p>
        <button  style={{ marginBottom: 28, }} className="modern-button" onClick={startGameAgain}>
          Play again?
        </button>
        <p style={{ fontSize: 16 }}>
          {"Psst it's me, Steph! Happy birthday Tiffany <3"}
        </p>
      </div>
    );
  }

};

export default App;
