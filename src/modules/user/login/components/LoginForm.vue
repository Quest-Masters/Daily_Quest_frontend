<script setup>
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseInput from '@/components/BaseSetting/BaseInput.vue'
import BaseButton from '@/components/BaseSetting/BaseButton.vue'
import { useUserLoginStore } from '@/modules/user/login/login-store.js'
import { useValidation } from '@/modules/user/use-validation.js'

const isLoading = ref(false)
const errorMessage = ref('')
const loginExpiresAt = ref(null) // 로그인 유지 시간 표시용

const form = reactive({
  id: '',
  password: '',
  rememberMe: false,
})

const errors = reactive({
  id: '',
  password: '',
})

const loginStore = useUserLoginStore()
const router = useRouter()

const { validateId, validatePassword, validateLogin } = useValidation(form, errors)

watch(() => form.id, validateId)
watch(() => form.password, validatePassword)

const handleSubmit = async () => {
  isLoading.value = true
  errorMessage.value = ''
  loginExpiresAt.value = null

  const isValidation = validateLogin()
  if (!isValidation) {
    alert('입력을 확인해주세요!')
    isLoading.value = false
    return
  }

  try {
    const success = await loginStore.login({
      id: form.id,
      password: form.password,
    })

    if (success) {
      loginExpiresAt.value = loginStore.expiresAt // Pinia에서 받은 로그인 만료 시간
      router.push('/')
    } else {
      errorMessage.value = loginStore.errorMessage
    }
  } catch (e) {
    errorMessage.value = '로그인 처리 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <base-input
      id="id"
      label="아이디"
      v-model="form.id"
      type="text"
      placeholder="아이디을 입력하세요"
      :error="errors.id"
      required
    />

    <base-input
      id="password"
      label="비밀번호"
      v-model="form.password"
      type="password"
      placeholder="비밀번호를 입력하세요"
      :error="errors.password"
      required
    />

    <div class="form-options">
      <label class="checkbox-label">
        <input type="checkbox" v-model="form.rememberMe" />
        <span>로그인 상태 유지</span>
      </label>
      <div class="user-define">
        <router-link to="/find-id" class="forgot-id">아이디 찾기</router-link>
        <a> \ </a>
        <router-link to="/find-password" class="forgot-password">비밀번호 찾기</router-link>
      </div>
    </div>

    <base-button type="submit" variant="primary" block :disabled="isLoading">
      {{ isLoading ? '로그인 중...' : '로그인' }}
    </base-button>

    <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

    <div class="auth-links">
      <p>
        계정이 없으신가요?
        <router-link to="/register">회원가입</router-link>
      </p>
    </div>
  </form>
</template>

<style scoped>
.auth-form {
  max-width: 400px;
  margin: 0 auto;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-label input {
  margin-right: 0.5rem;
}

.user-define {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.forgot-id {
  color: var(--primary-color);
  text-decoration: none;
}

.forgot-id:hover {
  text-decoration: underline;
}

.forgot-password {
  color: var(--primary-color);
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
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
</style>
