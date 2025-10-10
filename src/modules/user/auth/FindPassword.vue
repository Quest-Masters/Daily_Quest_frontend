<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h1>비밀번호 재설정</h1>
        <p>가입 시 등록한 이메일로 비밀번호를 재설정할 수 있습니다</p>
      </div>

      <!-- Step Indicator -->
      <div class="step-indicator">
        <div :class="['step', { active: currentStep >= 1, completed: currentStep > 1 }]">
          <span class="step-number">1</span>
          <span class="step-label">이메일</span>
        </div>
        <div class="step-divider"></div>
        <div :class="['step', { active: currentStep >= 2, completed: currentStep > 2 }]">
          <span class="step-number">2</span>
          <span class="step-label">인증</span>
        </div>
        <div class="step-divider"></div>
        <div :class="['step', { active: currentStep >= 3 }]">
          <span class="step-number">3</span>
          <span class="step-label">변경</span>
        </div>
      </div>

      <!-- Step 1: 이름과 이메일 입력 -->
      <div v-if="currentStep === 1" class="auth-form">
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

        <base-button @click="handleSendCode" variant="primary" block :disabled="isSendingCode">
          {{ isSendingCode ? '발송 중...' : '인증 코드 발송' }}
        </base-button>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
      </div>

      <!-- Step 2: 인증 코드 입력 -->
      <div v-else-if="currentStep === 2" class="auth-form">
        <p class="step-description">{{ email }}로 발송된 인증 코드를 입력해주세요</p>

        <div class="code-input-wrapper">
          <base-input
            id="code"
            label="인증 코드"
            v-model="verificationCode"
            type="text"
            placeholder="6자리 코드"
            maxlength="6"
            required
          />
          <span v-if="timeRemaining > 0" class="timer">{{ formatTime(timeRemaining) }}</span>
          <span v-else class="timer expired">시간만료</span>
        </div>

        <div class="button-group">
          <base-button
            @click="handleVerifyCode"
            variant="primary"
            block
            :disabled="isVerifying || !verificationCode"
          >
            {{ isVerifying ? '확인 중...' : '인증 확인' }}
          </base-button>

          <base-button
            @click="handleSendCode"
            variant="secondary"
            block
            :disabled="isSendingCode || timeRemaining > 0"
          >
            재전송
          </base-button>
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
      </div>

      <!-- Step 3: 새 비밀번호 입력 -->
      <div v-else-if="currentStep === 3" class="auth-form">
        <base-input
          id="new-password"
          label="새 비밀번호"
          v-model="newPassword"
          type="password"
          placeholder="새 비밀번호를 입력하세요"
          :error="passwordError"
          required
        />

        <base-input
          id="confirm-password"
          label="비밀번호 확인"
          v-model="confirmPassword"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          :error="confirmPasswordError"
          required
        />

        <div class="password-rules">
          <p class="rules-title">비밀번호 조건</p>
          <ul>
            <li :class="{ valid: passwordRules.minLength }">최소 8자 이상</li>
            <li :class="{ valid: passwordRules.hasUpperCase }">영문 대문자 포함</li>
            <li :class="{ valid: passwordRules.hasLowerCase }">영문 소문자 포함</li>
            <li :class="{ valid: passwordRules.hasNumber }">숫자 포함</li>
            <li :class="{ valid: passwordRules.hasSpecial }">특수문자 포함</li>
          </ul>
        </div>

        <base-button @click="handleResetPassword" variant="primary" block :disabled="isResetting">
          {{ isResetting ? '변경 중...' : '비밀번호 변경' }}
        </base-button>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
      </div>

      <div class="auth-links">
        <router-link to="/login">로그인으로 돌아가기</router-link>
        <span class="divider">|</span>
        <router-link to="/find-id">아이디 찾기</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseInput from '@/components/BaseSetting/BaseInput.vue'
import BaseButton from '@/components/BaseSetting/BaseButton.vue'
import { usePasswordReset } from './use-password-reset'

const router = useRouter()

const {
  currentStep,
  name,
  email,
  verificationCode,
  newPassword,
  confirmPassword,
  timeRemaining,
  isSendingCode,
  isVerifying,
  isResetting,
  errorMessage,
  successMessage,
  sendResetCode,
  verifyResetCode,
  resetPassword,
  formatTime,
} = usePasswordReset()

const nameError = computed(() => {
  if (!name.value) return ''
  if (name.value.length < 2) return '이름은 최소 2자 이상이어야 합니다'
  return ''
})

const emailError = computed(() => {
  if (!email.value) return ''
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value) ? '' : '올바른 이메일 형식이 아닙니다'
})

const passwordError = computed(() => {
  if (!newPassword.value) return ''
  if (newPassword.value.length < 8) return '최소 8자 이상 입력해주세요'
  return ''
})

const confirmPasswordError = computed(() => {
  if (!confirmPassword.value) return ''
  return newPassword.value === confirmPassword.value ? '' : '비밀번호가 일치하지 않습니다'
})

const passwordRules = computed(() => ({
  minLength: newPassword.value.length >= 8,
  hasUpperCase: /[A-Z]/.test(newPassword.value),
  hasLowerCase: /[a-z]/.test(newPassword.value),
  hasNumber: /[0-9]/.test(newPassword.value),
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword.value),
}))

const handleSendCode = async () => {
  if (nameError.value || emailError.value) return
  await sendResetCode()
}

const handleVerifyCode = async () => {
  await verifyResetCode()
}

const handleResetPassword = async () => {
  if (passwordError.value || confirmPasswordError.value) {
    return
  }

  const success = await resetPassword()
  if (success) {
    setTimeout(() => {
      router.push('/login')
    }, 2000)
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

.password-rules ul {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}

.password-rules li {
  margin-bottom: 0.25rem;
  color: var(--text-secondary);
  position: relative;
  padding-left: 1.5rem;
}

/* Step Indicator */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  padding: 1rem 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--border-color);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background-color: var(--primary-color);
  color: white;
}

.step.completed .step-number {
  background-color: var(--success-color);
  color: white;
}

.step-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.step.active .step-label {
  color: var(--primary-color);
}

.step-divider {
  width: 60px;
  height: 2px;
  background-color: var(--border-color);
  margin: 0 0.5rem;
  margin-bottom: 1.5rem;
}

.step.completed + .step-divider {
  background-color: var(--success-color);
}

/* Step Description */
.step-description {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background-color: var(--background-color);
  border-radius: 8px;
}

/* Code Input */
.code-input-wrapper {
  position: relative;
  margin-bottom: 1rem;
}

.timer {
  position: absolute;
  right: 1rem;
  top: 2.5rem;
  font-weight: 600;
  color: var(--primary-color);
  font-size: 0.875rem;
}

.timer.expired {
  color: var(--error-color);
}

/* Button Group */
.button-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Password Rules */
.password-rules {
  margin: 1rem 0;
  padding: 1rem;
  background-color: var(--background-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.rules-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.password-rules ul {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}

.password-rules li {
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  position: relative;
  padding-left: 1.5rem;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.password-rules li:before {
  content: '✕';
  position: absolute;
  left: 0;
  color: var(--error-color);
  font-weight: bold;
}

.password-rules li.valid {
  color: var(--success-color);
}

.password-rules li.valid:before {
  content: '✓';
  color: var(--success-color);
}

/* Links */
.auth-links {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.auth-links a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.2s ease;
}

.auth-links a:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

.divider {
  margin: 0 0.75rem;
  color: var(--border-color);
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
</style>
