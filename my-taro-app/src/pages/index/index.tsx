import { View, Text } from "@tarojs/components";
import { useLoad } from "@tarojs/taro";
import { AtButton, AtInput } from "taro-ui";
import { useState } from "react";
import "./index.scss";

export default function Index() {
  const [inputValue, setInputValue] = useState("");

  useLoad(() => {
    console.log("Page loaded.");
  });

  const handleClick = () => {
    Taro.showToast({
      title: "点击成功",
      icon: "success",
      duration: 2000
    });
  };

  const handleInput = (value) => {
    setInputValue(value);
  };

  return (
    <View className="index">
      <Text className="title">欢迎使用</Text>
      
      <AtInput
        name="value"
        title="输入框"
        type="text"
        placeholder="请输入内容"
        value={inputValue}
        onChange={handleInput}
      />
      
      <View className="button-group">
        <AtButton type="primary" onClick={handleClick}>
          主要按钮
        </AtButton>
        
        <AtButton type="secondary" onClick={() => {
          Taro.navigateTo({
            url: "/pages/detail/index"
          });
        }}>
          跳转详情
        </AtButton>
      </View>
    </View>
  );
}
