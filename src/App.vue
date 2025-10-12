<script setup>
import { onMounted } from 'vue'
import Header from '@/components/AppHeader.vue'
import Footer from '@/components/AppFooter.vue'
import { useUserLoginStore } from '@/modules/user/login/login-store.js'

const loginStore = useUserLoginStore()

// 앱 시작 시 세션 복원
onMounted(() => {
  console.log('🔄 앱 시작: 세션 복원 시도')
  loginStore.restoreSession()
})
</script>

<template>
  <div>
    <div>
      <Header />
    </div>
  </div>
  <div>
    <div>
      <router-view></router-view>
    </div>
  </div>
  <div>
    <div>
      <Footer />
    </div>
  </div>
</template>

<style scoped></style>
