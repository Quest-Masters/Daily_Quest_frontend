<template>
  <div class="form-group">
    <label for="email-id" class="form-label">
      이메일 <span class="required">*</span>
      <span v-if="isVerified" class="verified-badge">✓ 인증완료</span>
    </label>

    <div class="email-input-group">
      <input
        id="email-id"
        v-model="emailId"
        type="text"
        placeholder="아이디"
        class="form-input email-id"
        :disabled="isVerified"
        required
      />
      <span class="email-separator">@</span>
      <select
        v-model="selectedDomain"
        class="form-input email-domain-select"
        :disabled="isVerified"
        v-if="selectedDomain !== 'custom'"
      >
        <option v-for="domain in emailDomains" :key="domain.value" :value="domain.value">
          {{ domain.label }}
        </option>
      </select>
      <input
        v-if="selectedDomain === 'custom'"
        v-model="customDomain"
        type="text"
        placeholder="직접 입력"
        class="form-input email-domain-input"
        :disabled="isVerified"
        required
      />
    </div>

    <!-- 인증 코드 발송 버튼 -->
    <div class="verification-actions" v-if="!isVerified">
      <BaseButton
        type="button"
        @click="handleSendCode"
        :disabled="!canSendCode || isSendingCode"
        variant="secondary"
        class="send-code-btn"
      >
        {{ isCodeSent ? '재전송' : '인증코드 발송' }}
      </BaseButton>
    </div>

    <!-- 인증 코드 입력 -->
    <div v-if="isCodeSent && !isVerified" class="verification-input-group">
      <div class="code-input-wrapper">
        <input
          v-model="verificationCode"
          type="text"
          placeholder="인증 코드 입력"
          class="form-input code-input"
          maxlength="6"
        />
        <span v-if="timeRemaining > 0" class="timer">
          {{ formatTime(timeRemaining) }}
        </span>
        <span v-else class="timer expired">시간만료</span>
      </div>
      <BaseButton
        type="button"
        @click="handleVerifyCode"
        :disabled="!verificationCode || isVerifying"
        variant="primary"
        class="verify-button"
      >
        확인
      </BaseButton>
    </div>

    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import BaseButton from '@/components/BaseSetting/BaseButton.vue'
import { useEmailVerification } from '../use-email-verification'

const props = defineProps({
  emailId: String,
  selectedDomain: String,
  customDomain: String,
  emailDomains: Array,
  error: String,
})

const emit = defineEmits([
  'update:emailId',
  'update:selectedDomain',
  'update:customDomain',
  'verified',
])

const emailId = computed({
  get: () => props.emailId,
  set: (val) => emit('update:emailId', val),
})

const selectedDomain = computed({
  get: () => props.selectedDomain,
  set: (val) => emit('update:selectedDomain', val),
})

const customDomain = computed({
  get: () => props.customDomain,
  set: (val) => emit('update:customDomain', val),
})

const {
  isCodeSent,
  isVerified,
  verificationCode,
  timeRemaining,
  isSendingCode,
  isVerifying,
  sendVerificationCode,
  verifyCode,
  formatTime,
  reset,
} = useEmailVerification()

const fullEmail = computed(() => {
  const domain = selectedDomain.value === 'custom' ? customDomain.value : selectedDomain.value
  return emailId.value && domain ? `${emailId.value}@${domain}` : ''
})

const canSendCode = computed(() => {
  return (
    emailId.value &&
    (selectedDomain.value === 'custom' ? customDomain.value : selectedDomain.value) &&
    (!isCodeSent.value || timeRemaining.value === 0)
  )
})

const handleSendCode = async () => {
  const success = await sendVerificationCode(fullEmail.value)
  if (!success) {
    reset()
  }
}

const handleVerifyCode = async () => {
  const success = await verifyCode(fullEmail.value)
  if (success) {
    emit('verified', fullEmail.value)
  }
}

// 이메일이 변경되면 인증 상태 초기화
watch([emailId, selectedDomain, customDomain], () => {
  if (isCodeSent.value || isVerified.value) {
    reset()
  }
})
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.required {
  color: var(--error-color);
}

.verified-badge {
  margin-left: 0.5rem;
  padding: 0.25rem 0.5rem;
  background-color: var(--success-color, #10b981);
  color: white;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.email-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.email-id {
  flex: 1;
}

.email-separator {
  font-weight: 500;
  color: var(--text-secondary);
}

.email-domain-select,
.email-domain-input {
  flex: 1;
}

.verification-actions {
  margin-bottom: 0.75rem;
}

.send-code-btn {
  width: 100%;
}

.verification-input-group {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
}

.code-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.code-input {
  flex: 1;
  padding-right: 4.5rem;
}

.timer {
  position: absolute;
  right: 0.75rem;
  font-weight: 600;
  color: var(--primary-color);
  white-space: nowrap;
  font-size: 0.875rem;
  pointer-events: none;
}

.timer.expired {
  color: var(--error-color);
}

.verify-button {
  flex-shrink: 0;
  min-width: fit-content;
}

.error-message {
  color: var(--error-color);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--card-color);
  color: var(--text-primary);
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-input:disabled {
  background-color: var(--disabled-bg, #f3f4f6);
  cursor: not-allowed;
  opacity: 0.7;
}

.email-input-group .form-input {
  width: 94%;
}
</style>
