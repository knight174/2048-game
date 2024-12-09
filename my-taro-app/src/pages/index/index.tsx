import { View } from "@tarojs/components";
import { useEffect } from "react";
import { AtButton } from "taro-ui";
import { Header } from "../../components/Header";
import { Board } from "../../components/Board";
import { use2048Game } from "../../hooks/use2048Game";
import "./index.scss";

export default function Index() {
  const { gameState, highScore, initGame, handleMove } = use2048Game();

  useEffect(() => {
    initGame();
  }, []);

  // 处理触摸事件
  let touchStartX = 0;
  let touchStartY = 0;

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  };

  const handleTouchEnd = (e) => {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (Math.max(absDeltaX, absDeltaY) > 30) {
      if (absDeltaX > absDeltaY) {
        handleMove(deltaX > 0 ? "right" : "left");
      } else {
        handleMove(deltaY > 0 ? "down" : "up");
      }
    }
  };

  console.log("Game State:", gameState.gameOver, gameState.won);

  return (
    <View className='index'>
      <Header score={gameState.score} highScore={highScore} />

      <View className='controls'>
        <AtButton onClick={initGame} type='primary'>
          新游戏
        </AtButton>
      </View>

      <Board
        board={gameState.board}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      />

      <View className='instructions'>滑动屏幕移动方块</View>

      {(gameState.gameOver || gameState.won) && (
        <View className='modal'>
          <View className='modal-content'>
            <View className='modal-title'>
              {gameState.won ? "🎉 胜利!" : "💫 游戏结束"}
            </View>
            <View>得分: {gameState.score}</View>
            <View>最高分: {highScore}</View>
            <AtButton onClick={initGame} type='primary'>
              再来一局
            </AtButton>
          </View>
        </View>
      )}
    </View>
  );
}
