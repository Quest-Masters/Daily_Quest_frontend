<template>
  <div class="error-page error-404">
    <div class="error-container">
      <div class="error-illustration">
        <div class="lost-adventurer">
          <div class="character">
            <div class="character-body">🧙‍♂️</div>
            <div class="question-marks">
              <span>?</span>
              <span>?</span>
              <span>?</span>
            </div>
          </div>
          <div class="map">
            <MapPin class="map-icon" />
            <div class="map-lines">
              <div class="line"></div>
              <div class="line"></div>
              <div class="line"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="error-content">
        <div class="error-code">404</div>
        <h1 class="error-title">길을 잃었습니다!</h1>
        <p class="error-description">
          모험가여, 찾고 있는 페이지가 존재하지 않습니다.<br />
          지도를 다시 확인하고 올바른 경로로 돌아가세요.
        </p>

        <div class="error-actions">
          <base-button variant="primary" @click="goHome" class="action-button">
            <Home class="button-icon" />
            홈으로 돌아가기
          </base-button>

          <base-button variant="secondary" @click="goBack" class="action-button">
            <ArrowLeft class="button-icon" />
            이전 페이지로
          </base-button>
        </div>

        <div class="helpful-links">
          <h3>도움이 될 만한 링크:</h3>
          <ul>
            <li><router-link to="/quests">퀘스트 보드</router-link></li>
            <li><router-link to="/quest-calendar">퀘스트 캘린더</router-link></li>
            <li><router-link to="/profile">프로필</router-link></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Home, ArrowLeft, MapPin } from 'lucide-vue-next'
import BaseButton from '@/components/BaseSetting/BaseButton.vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #8fd694 0%, #6ab46f 100%);
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

.lost-adventurer {
  position: relative;
  animation: float 3s ease-in-out infinite;
}

.character {
  position: relative;
  margin-bottom: 2rem;
}

.character-body {
  font-size: 4rem;
  animation: bounce 2s ease-in-out infinite;
}

.question-marks {
  position: absolute;
  top: -1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
}

.question-marks span {
  font-size: 1.5rem;
  color: #ffd166;
  animation: questionFloat 2s ease-in-out infinite;
}

.question-marks span:nth-child(2) {
  animation-delay: 0.3s;
}

.question-marks span:nth-child(3) {
  animation-delay: 0.6s;
}

.map {
  position: relative;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid #b5e6b9;
}

.map-icon {
  width: 2rem;
  height: 2rem;
  color: #dc3545;
  margin-bottom: 0.5rem;
}

.map-lines {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.line {
  height: 2px;
  background-color: #6ab46f;
  border-radius: 1px;
}

.line:nth-child(1) {
  width: 60%;
}
.line:nth-child(2) {
  width: 80%;
}
.line:nth-child(3) {
  width: 40%;
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

.helpful-links {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.helpful-links h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  color: #ffd166;
}

.helpful-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.helpful-links li {
  margin-bottom: 0.5rem;
}

.helpful-links a {
  color: #b5e6b9;
  text-decoration: none;
  transition: color 0.2s;
}

.helpful-links a:hover {
  color: #ffd166;
  text-decoration: underline;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes questionFloat {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-5px) rotate(10deg);
  }
}
</style>
