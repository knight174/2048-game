import { View, Text } from "@tarojs/components";
import "./index.scss";

interface BoardProps {
  board: number[][];
  onTouchStart: (e: any) => void;
  onTouchEnd: (e: any) => void;
}

export function Board({ board, onTouchStart, onTouchEnd }: BoardProps) {
  return (
    <View
      className='game-board'
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {board.map((row, i) =>
        row.map((cell, j) => (
          <View
            key={`${i}-${j}`}
            className={`tile ${cell > 0 ? `tile-${cell}` : ""}`}
          >
            {cell > 0 && <Text className='tile-text'>{cell}</Text>}
          </View>
        ))
      )}
    </View>
  );
}
