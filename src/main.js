import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@fortawesome/fontawesome-free/css/all.min.css'

// 创建Vue实例并挂载
const app = createApp(App)
app.use(router)
app.mount('#app')