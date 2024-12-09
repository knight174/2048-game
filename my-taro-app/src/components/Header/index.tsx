import { View } from '@tarojs/components'
import './index.scss'

interface HeaderProps {
  score: number
  highScore: number
}

export function Header({ score, highScore }: HeaderProps) {
  return (
    <View className='header'>
      <View className='title-container'>
        <View className='title'>2048</View>
      </View>
      <View className='scores'>
        <View className='score-container'>
          <View className='score-label'>得分</View>
          <View className='score'>{score}</View>
        </View>
        <View className='score-container'>
          <View className='score-label'>最高分</View>
          <View className='score'>{highScore}</View>
        </View>
      </View>
    </View>
  )
} 