import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'
import { useTheme } from './composables/useTheme.ts'

// 先恢复上次主题，再挂载，避免首屏闪烁
useTheme().initTheme()

createApp(App).mount('#app')
