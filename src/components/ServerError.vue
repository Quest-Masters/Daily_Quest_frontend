<template>
  <div class="error-page error-500">
    <div class="error-container">
      <div class="error-illustration">
        <div class="broken-system">
          <div class="server-rack">
            <div class="server">
              <div class="server-lights">
                <div class="light error"></div>
                <div class="light warning"></div>
                <div class="light error"></div>
              </div>
              <div class="server-screen">
                <div class="error-text">ERROR</div>
                <div class="error-lines">
                  <div class="line"></div>
                  <div class="line"></div>
                  <div class="line"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="technician">
            <div class="technician-character">🔧</div>
            <div class="tools">
              <Wrench class="tool" />
              <Settings class="tool" />
            </div>
          </div>
          <div class="sparks">
            <div class="spark"></div>
            <div class="spark"></div>
            <div class="spark"></div>
          </div>
        </div>
      </div>

      <div class="error-content">
        <div class="error-code">500</div>
        <h1 class="error-title">시스템에 문제가 발생했습니다!</h1>
        <p class="error-description">
          앗! 서버에 예상치 못한 오류가 발생했습니다.<br />
          기술자들이 열심히 수리 중이니 잠시만 기다려주세요.
        </p>

        <div class="status-info">
          <div class="status-item">
            <div class="status-indicator working"></div>
            <span>기술팀이 문제를 파악 중입니다</span>
          </div>
          <div class="status-item">
            <div class="status-indicator working"></div>
            <span>시스템 복구 작업이 진행 중입니다</span>
          </div>
          <div class="status-item">
            <div class="status-indicator pending"></div>
            <span>서비스가 곧 정상화될 예정입니다</span>
          </div>
        </div>

        <div class="error-actions">
          <base-button variant="primary" @click="refreshPage" class="action-button">
            <RefreshCw class="button-icon" />
            페이지 새로고침
          </base-button>

          <base-button variant="secondary" @click="goHome" class="action-button">
            <Home class="button-icon" />
            홈으로 돌아가기
          </base-button>
        </div>

        <div class="help-section">
          <h3>문제가 지속된다면:</h3>
          <ul>
            <li>몇 분 후 다시 시도해보세요</li>
            <li>브라우저 캐시를 삭제해보세요</li>
            <li>다른 브라우저를 사용해보세요</li>
            <li>관리자에게 문의해주세요</li>
          </ul>

          <div class="contact-section">
            <base-button variant="outline" size="small">
              <Mail class="button-icon" />
              기술 지원팀 연락하기
            </base-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Wrench, Settings, RefreshCw, Home, Mail } from 'lucide-vue-next'
import BaseButton from '@/components/BaseSetting/BaseButton.vue'

const router = useRouter()

const refreshPage = () => {
  window.location.reload()
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
  background: linear-gradient(135deg, #ffc107 0%, #e6ac00 100%);
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

.broken-system {
  position: relative;
  animation: systemShake 3s ease-in-out infinite;
}

.server-rack {
  background-color: #374151;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 2px solid #6b7280;
}

.server {
  background-color: #1f2937;
  border-radius: 4px;
  padding: 1rem;
}

.server-lights {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.light {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  animation: blink 1s ease-in-out infinite;
}

.light.error {
  background-color: #dc3545;
  box-shadow: 0 0 10px rgba(220, 53, 69, 0.6);
}

.light.warning {
  background-color: #ffd166;
  box-shadow: 0 0 10px rgba(255, 209, 102, 0.6);
  animation-delay: 0.3s;
}

.server-screen {
  background-color: #000;
  border-radius: 4px;
  padding: 1rem;
  color: #dc3545;
  font-family: 'Courier New', monospace;
  border: 1px solid #333;
}

.error-text {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  animation: textFlicker 2s ease-in-out infinite;
}

.error-lines {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.line {
  height: 2px;
  background-color: #dc3545;
  border-radius: 1px;
  animation: lineGlitch 1.5s ease-in-out infinite;
}

.line:nth-child(1) {
  width: 80%;
}
.line:nth-child(2) {
  width: 60%;
  animation-delay: 0.2s;
}
.line:nth-child(3) {
  width: 90%;
  animation-delay: 0.4s;
}

.technician {
  position: absolute;
  bottom: -2rem;
  right: -1rem;
  text-align: center;
}

.technician-character {
  font-size: 2.5rem;
  animation: work 2s ease-in-out infinite;
}

.tools {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.5rem;
}

.tool {
  width: 1.5rem;
  height: 1.5rem;
  color: #6ab46f;
  animation: toolSpin 3s linear infinite;
}

.tool:nth-child(2) {
  animation-delay: 1s;
}

.sparks {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.spark {
  position: absolute;
  width: 4px;
  height: 4px;
  background-color: #ffd166;
  border-radius: 50%;
  animation: sparkFly 2s ease-out infinite;
}

.spark:nth-child(1) {
  top: 20%;
  left: 30%;
  animation-delay: 0s;
}

.spark:nth-child(2) {
  top: 40%;
  left: 70%;
  animation-delay: 0.7s;
}

.spark:nth-child(3) {
  top: 60%;
  left: 20%;
  animation-delay: 1.4s;
}

.error-content {
  color: #333333;
}

.error-code {
  font-size: 6rem;
  font-weight: 900;
  color: #dc3545;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  margin-bottom: 1rem;
  line-height: 1;
}

.error-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.error-description {
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  color: #666666;
}

.status-info {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.status-item:last-child {
  margin-bottom: 0;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.status-indicator.working {
  background-color: #28a745;
  box-shadow: 0 0 10px rgba(40, 167, 69, 0.6);
}

.status-indicator.pending {
  background-color: #ffd166;
  box-shadow: 0 0 10px rgba(255, 209, 102, 0.6);
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

.help-section {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.help-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  color: #333333;
}

.help-section ul {
  margin: 0 0 1.5rem 0;
  padding-left: 1.5rem;
  color: #666666;
}

.help-section li {
  margin-bottom: 0.5rem;
}

.contact-section {
  text-align: center;
}

@keyframes systemShake {
  0%,
  100% {
    transform: translateX(0) rotate(0deg);
  }
  25% {
    transform: translateX(-1px) rotate(-0.5deg);
  }
  75% {
    transform: translateX(1px) rotate(0.5deg);
  }
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0.3;
  }
}

@keyframes textFlicker {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes lineGlitch {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-2px);
  }
  40% {
    transform: translateX(2px);
  }
  60% {
    transform: translateX(-1px);
  }
  80% {
    transform: translateX(1px);
  }
}

@keyframes work {
  0%,
  100% {
    transform: rotate(-5deg);
  }
  50% {
    transform: rotate(5deg);
  }
}

@keyframes toolSpin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes sparkFly {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scale(0.5);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
