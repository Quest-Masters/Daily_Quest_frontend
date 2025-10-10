<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h1>아이디 찾기</h1>
        <p>가입 시 등록한 이메일 주소를 입력해주세요</p>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <base-input
          id="name"
          label="이름"
          v-model="name"
          type="text"
          placeholder="이름을 입력하세요"
          :error="nameError"
          required
        />

        <base-input
          id="email"
          label="이메일"
          v-model="email"
          type="email"
          placeholder="example@email.com"
          :error="emailError"
          required
        />

        <base-button type="submit" variant="primary" block :disabled="isLoading">
          {{ isLoading ? '처리 중...' : '아이디 찾기' }}
        </base-button>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
      </form>

      <div class="auth-links">
        <router-link to="/login">로그인으로 돌아가기</router-link>
        <span class="divider">|</span>
        <router-link to="/find-password">비밀번호 재설정</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import BaseInput from '@/components/BaseSetting/BaseInput.vue'
import BaseButton from '@/components/BaseSetting/BaseButton.vue'

const router = useRouter()

const name = ref('')
const email = ref('')
const nameError = ref('')
const emailError = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

const validateName = () => {
  if (!name.value) {
    nameError.value = '이름을 입력해주세요'
    return false
  }

  if (name.value.length < 2) {
    nameError.value = '이름은 최소 2자 이상이어야 합니다'
    return false
  }

  nameError.value = ''
  return true
}

const validateEmail = () => {
  if (!email.value) {
    emailError.value = '이메일을 입력해주세요'
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    emailError.value = '올바른 이메일 형식이 아닙니다'
    return false
  }

  emailError.value = ''
  return true
}

const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!validateName() || !validateEmail()) {
    return
  }

  isLoading.value = true

  try {
    const response = await axios.post('/api/users/find-id', {
      name: name.value,
      email: email.value,
    })

    successMessage.value = response.data || '아이디가 이메일로 발송되었습니다.'

    // 3초 후 로그인 페이지로 이동
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (error) {
    errorMessage.value = error.response?.data || '아이디 찾기에 실패했습니다.'
    console.error('아이디 찾기 에러:', error)
  } finally {
    isLoading.value = false
  }
}
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

.auth-form {
  max-width: 400px;
  margin: 0 auto;
}

.verification-method {
  margin-bottom: 1.5rem;
}

.method-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.method-options {
  display: flex;
  gap: 1.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-label input {
  margin-right: 0.5rem;
}

.verification-code {
  position: relative;
}

.verification-timer {
  position: absolute;
  right: 0;
  top: 2.5rem;
  color: var(--error-color);
  font-size: 0.875rem;
}

.form-error {
  color: var(--error-color);
  margin-top: 1rem;
  text-align: center;
}

.auth-links {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
}

.auth-links a {
  color: var(--primary-color);
  text-decoration: none;
}

.auth-links a:hover {
  text-decoration: underline;
}

.error-message {
  color: var(--error-color);
  font-size: 0.875rem;
  margin-top: 1rem;
  text-align: center;
  padding: 0.75rem;
  background-color: rgba(244, 67, 54, 0.1);
  border-radius: 8px;
}

.success-message {
  color: var(--success-color);
  font-size: 0.875rem;
  margin-top: 1rem;
  text-align: center;
  padding: 0.75rem;
  background-color: rgba(16, 185, 129, 0.1);
  border-radius: 8px;
}

.divider {
  margin: 0 0.75rem;
  color: var(--border-color);
}
</style>
