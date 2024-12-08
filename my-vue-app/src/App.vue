<script setup lang="ts">
import Game2048 from './components/Game2048.vue';
</script>

<template>
  <div class="app">
    <Game2048 />
  </div>
</template>

<style>
/* 全局样式 */
body {
  font-family: Arial, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  background-color: #faf8ef;
}

.app {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
</style>
