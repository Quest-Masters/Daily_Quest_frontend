<script setup>
import { ref } from 'vue'
import { useUserLoginStore } from '@/modules/user/login/login-store.js'
import { storeToRefs } from 'pinia'
import BaseButton from '@/components/BaseSetting/BaseButton.vue'
import { useRouter } from 'vue-router'
import { List, Calendar, User, LogIn, UserPlus, LogOut } from 'lucide-vue-next'

const isMenuOpen = ref(false)
const loginStore = useUserLoginStore()
const { isLoggedIn } = storeToRefs(loginStore)
const router = useRouter()

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const logout = () => {
  loginStore.logout()
  isMenuOpen.value = false
  router.push('/')
}
</script>

<template>
  <header class="header">
    <div class="header-container">
      <div class="logo">
        <router-link to="/">
          <h1><img src="@/assets/images/logo.png" class="logo-image" alt="로고 이미지" /></h1>
        </router-link>
      </div>

      <button class="hamburger" @click="toggleMenu">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </button>

      <nav class="nav" :class="{ open: isMenuOpen }">
        <ul class="nav-list">
          <li v-if="isLoggedIn">
            <router-link to="/quests" class="nav-link">
              <List :size="18" />
              <span>Quest list</span>
            </router-link>
          </li>
          <li v-if="isLoggedIn">
            <router-link to="/quest-calendar" class="nav-link">
              <Calendar :size="18" />
              <span>Quest calendar</span>
            </router-link>
          </li>
          <li v-if="isLoggedIn">
            <router-link to="/profile" class="nav-link">
              <User :size="18" />
              <span>My Page</span>
            </router-link>
          </li>
          <li v-if="!isLoggedIn">
            <router-link to="/login" class="nav-link">
              <LogIn :size="18" />
              <span>Login</span>
            </router-link>
          </li>
          <li v-if="!isLoggedIn">
            <router-link to="/register" class="nav-link">
              <UserPlus :size="18" />
              <span>Signup</span>
            </router-link>
          </li>
          <li v-if="isLoggedIn">
            <base-button @click="logout" class="logout-btn">
              <LogOut :size="16" />
              <span>Logout</span>
            </base-button>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  width: 100%;
  background-color: var(--card-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0.4rem 0;
}

.header-container {
  justify-content: space-between;
  display: flex;
  align-items: center;
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 로고 */
.logo h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--primary-color);
}

.logo a {
  text-decoration: none;
}

.logo-image {
  width: 4rem;
  height: 4rem;
}

.hamburger {
  display: none;
  flex-direction: column;
  cursor: pointer;
  border: none;
  background: none;
  padding: 0.5rem;
  margin-left: auto;
}

.bar {
  width: 25px;
  height: 3px;
  background-color: var(--primary-color);
  margin: 4px 0;
  transition: 0.3s;
}

.nav-list {
  display: none;
  flex-direction: column;
  list-style: none;
  padding: 1rem;
  margin: 1rem 0 0 0;
  background-color: var(--card-color);
  position: absolute;
  top: 100%;
  right: 0;
  width: 12.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
  border-radius: 8px;
}

.nav.open .nav-list {
  display: flex;
}

.nav-list li {
  padding: 1rem;
  min-width: 100px;
  text-align: center;
}

.nav-list .nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--primarlogouty-dark);
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-list .nav-link:hover {
  color: var(--primary-color);
}

.nav-list .nav-link.router-link-active {
  color: var(--primary-color);
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  width: 6rem;
  height: 3rem;
  font-size: 0.8rem;
  background-color: var(--primary-light);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.logout-btn:hover {
  background-color: #d32f2f;
}

@media (min-width: 769px) {
  .nav-list {
    display: flex !important;
    align-items: center;
    flex-direction: row;
    position: static;
    background: none;
    box-shadow: none;
    width: auto;
    margin: 0;
    padding: 0;
  }

  .nav-list li {
    margin-left: 1.5rem;
    padding: 0.5rem;
  }

  .hamburger {
    display: none;
  }
}

@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }

  .logo-image {
    width: 3rem;
    height: 3rem;
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: 0 0.75rem;
  }

  .nav-list {
    right: -0.75rem;
    left: -0.75rem;
    width: auto;
  }

  .nav-list .nav-link {
    gap: 0.4rem;
  }

  .logout-btn {
    gap: 0.3rem;
  }
}
</style>
