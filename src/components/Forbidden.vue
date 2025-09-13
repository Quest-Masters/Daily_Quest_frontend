<template>
  <div class="error-page error-403">
    <div class="error-container">
      <div class="error-illustration">
        <div class="forbidden-gate">
          <div class="gate">
            <div class="gate-bars">
              <div class="bar"></div>
              <div class="bar"></div>
              <div class="bar"></div>
              <div class="bar"></div>
            </div>
            <div class="lock">
              <Lock class="lock-icon" />
            </div>
          </div>
          <div class="guard">
            <div class="guard-character">🛡️</div>
            <div class="speech-bubble">
              <span>출입 금지!</span>
            </div>
          </div>
        </div>
      </div>

      <div class="error-content">
        <div class="error-code">403</div>
        <h1 class="error-title">접근이 금지되었습니다!</h1>
        <p class="error-description">
          용감한 모험가여, 이 영역에 들어갈 권한이 없습니다.<br />
          수호자가 길을 막고 있네요. 적절한 권한을 얻고 다시 시도해보세요.
        </p>

        <div class="permission-info">
          <div class="info-item">
            <Shield class="info-icon" />
            <span>로그인이 필요할 수 있습니다</span>
          </div>
          <div class="info-item">
            <Key class="info-icon" />
            <span>관리자 권한이 필요할 수 있습니다</span>
          </div>
          <div class="info-item">
            <Crown class="info-icon" />
            <span>특별한 자격이 필요할 수 있습니다</span>
          </div>
        </div>

        <div class="error-actions">
          <base-button variant="primary" @click="goToLogin" class="action-button">
            <LogIn class="button-icon" />
            로그인하기
          </base-button>

          <base-button variant="secondary" @click="goHome" class="action-button">
            <Home class="button-icon" />
            홈으로 돌아가기
          </base-button>
        </div>

        <div class="contact-info">
          <p>문제가 지속된다면 관리자에게 문의하세요.</p>
          <base-button variant="outline" size="small">
            <Mail class="button-icon" />
            문의하기
          </base-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { Lock, Shield, Key, Crown, LogIn, Home, Mail } from 'lucide-vue-next'
import BaseButton from '@/components/BaseSetting/BaseButton.vue'

const router = useRouter()

const goToLogin = () => {
  router.push('/login')
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #dc3545 0%, #b02a37 100%);
  padding: 2rem 1rem;
}

.error-container {
  max-width: 800px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

@media (max-width: 768px) {
  .error-container {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

.error-illustration {
  display: flex;
  justify-content: center;
  align-items: center;
}

.forbidden-gate {
  position: relative;
  animation: shake 4s ease-in-out infinite;
}

.gate {
  position: relative;
  background-color: #374151;
  border-radius: 8px 8px 0 0;
  padding: 2rem 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 2px solid #6b7280;
}

.gate-bars {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.bar {
  width: 8px;
  height: 60px;
  background-color: #9ca3af;
  border-radius: 4px;
  animation: barGlow 2s ease-in-out infinite alternate;
}

.bar:nth-child(2) {
  animation-delay: 0.2s;
}
.bar:nth-child(3) {
  animation-delay: 0.4s;
}
.bar:nth-child(4) {
  animation-delay: 0.6s;
}

.lock {
  display: flex;
  justify-content: center;
}

.lock-icon {
  width: 2rem;
  height: 2rem;
  color: #ffd166;
  animation: lockPulse 2s ease-in-out infinite;
}

.guard {
  position: absolute;
  bottom: -3rem;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.guard-character {
  font-size: 3rem;
  animation: guardBounce 3s ease-in-out infinite;
}

.speech-bubble {
  position: relative;
  background-color: white;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  margin-top: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  border: 2px solid #ffd166;
}

.speech-bubble::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid white;
}

.error-content {
  color: white;
}

.error-code {
  font-size: 6rem;
  font-weight: 900;
  color: #ffd166;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  margin-bottom: 1rem;
  line-height: 1;
}

.error-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.error-description {
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  opacity: 0.95;
}

.permission-info {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #ffd166;
}

.error-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.button-icon {
  width: 1rem;
  height: 1rem;
}

.contact-info {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.contact-info p {
  margin-bottom: 1rem;
  opacity: 0.9;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-2px);
  }
  75% {
    transform: translateX(2px);
  }
}

@keyframes barGlow {
  0% {
    box-shadow: 0 0 5px rgba(220, 53, 69, 0.5);
  }
  100% {
    box-shadow: 0 0 15px rgba(220, 53, 69, 0.8);
  }
}

@keyframes lockPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes guardBounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
</style>
