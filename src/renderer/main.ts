import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './styles/index.scss'
import './assets/iconfont/iconfont.css'

createApp(App).use(router).mount('#app')
