import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia) // ✅ 먼저 Pinia 등록
app.use(router)

// ✅ Pinia 등록 후에 store 사용해야 함
import { useUserLoginStore } from '@/modules/user/login/login-store.js'
const loginStore = useUserLoginStore()
loginStore.restoreSession() // 로그인 상태 복원

app.mount('#app')
