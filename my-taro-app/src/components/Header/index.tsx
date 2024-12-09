import { View } from "@tarojs/components";
import "./index.scss";

interface HeaderProps {
  score: number;
  highScore: number;
}

export const Header = ({ score, highScore }) => {
  return (
    <View className='header'>
      <View className='title'>2048</View>
      <View className='scores'>
        <View className='score-box'>
          <View className='label'>得分</View>
          <View className='value'>{score}</View>
        </View>
        <View className='score-box'>
          <View className='label'>最高分</View>
          <View className='value'>{highScore}</View>
        </View>
      </View>
    </View>
  );
};
