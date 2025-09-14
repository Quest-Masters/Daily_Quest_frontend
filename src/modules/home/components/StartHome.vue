<script setup>
import BaseButton from '@/components/BaseSetting/BaseButton.vue'
import { useUserLoginStore } from '@/modules/user/login/login-store.js'
import { storeToRefs } from 'pinia'

const loginStore = useUserLoginStore()
const { isLoggedIn } = storeToRefs(loginStore)
</script>

<template>
  <section class="hero">
    <div class="hero-content">
      <h1>Daliy Quest는 일상을 모험으로!</h1>
      <p>
        일상의 지루한 일들을 재미있는 퀘스트로 바꾸어! 하나씩 클리어 해서 <br />레벨을 올리며 보상을
        획득하세요!
      </p>
      <div class="hero-buttons">
        <router-link to="/login" v-if="!isLoggedIn">
          <base-button variant="primary">시작하기</base-button>
        </router-link>
        <router-link to="/quests" v-if="isLoggedIn">
          <base-button variant="primary">퀘스트 보드로 이동</base-button>
        </router-link>
        <router-link to="/about">
          <base-button variant="secondary">더 알아보기</base-button>
        </router-link>
      </div>
    </div>
    <div class="hero-image">
      <img src="@/assets/images/penguin-character.png" alt="메인 이미지" />
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 1rem;
  justify-content: center;
  background-color: var(--primary-light);
  border-radius: 0 0 30px 30px;
  margin-bottom: 4rem;
}

@media (min-width: 768px) {
  .hero {
    flex-direction: row;
    text-align: left;
    padding: 6rem 2rem;
  }
}

.hero-content {
  max-width: 600px;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--primary-dark);
}

.hero p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  color: var(--text-primary);
}

.hero-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

@media (min-width: 768px) {
  .hero-buttons {
    justify-content: flex-start;
  }
}

.hero-image {
  max-width: 400px;
  margin-top: 2rem;
}

@media (min-width: 768px) {
  .hero-image {
    margin-top: 0;
    margin-left: 2rem;
  }
}

.hero-image img {
  width: 100%;
  height: auto;
}
</style>
