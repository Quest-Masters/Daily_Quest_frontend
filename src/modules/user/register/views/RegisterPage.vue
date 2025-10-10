<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h1>회원가입</h1>
        <img
          src="../../../../assets/images/register-character.png"
          alt="캐릭터 이미지"
          class="character"
        />
        <p>Daily Quest의 모험가가 되어보세요!</p>
      </div>
      <register-form />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import RegisterForm from '@/modules/user/register/components/RegisteForm.vue'
import { useUserRegisterStore } from '@/modules/user/register/user-store'

const registerStore = useUserRegisterStore()

// 페이지 진입 시 폼 초기화
onMounted(() => {
  registerStore.resetForm()
})
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 2rem 1rem;
}

.auth-container {
  width: 100%;
  max-width: 480px;
  background-color: var(--card-color);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h1 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.auth-header p {
  color: var(--text-secondary);
}

.character {
  width: 25%;
  height: 20%;
}
</style>
