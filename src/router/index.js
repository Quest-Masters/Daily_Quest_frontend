import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/modules/home/views/AppHome.vue'
import Login from '@/modules/user/login/views/LoginPage.vue'
import Register from '@/modules/user/register/views/RegisterPage.vue'
import FindId from '@/modules/user/auth/FindId.vue'
import FindPassword from '@/modules/user/auth/FindPassword.vue'
import NotFound from '@/components/NotFound.vue'
import Forbidden from '@/components/Forbidden.vue'
import ServerError from '@/components/ServerError.vue'
// import QuestCalendar from '@/modules/calendar/views/QuestCalendar.vue'
// import QuestDetail from '@/modules/calendar/views/QuestDetail.vue'
// import QuestBoard from '@/modules/board/views/QuestBoard.vue'
// import Profile from '@/modules/board/views/Profile.vue'

import AiQuestGenerator from '@/modules/quests/AiQuestGenerator.vue'
import QuestBoard from '@/modules/quests/QuestBoard.vue'
import QuestDetail from '@/modules/quests/QuestDetail.vue'
import QuestEdit from '@/modules/quests/QuestEdit.vue'
import QuestCalendar from '@/modules/quests/QuestCalendar.vue'

import Profile from '@/modules/user/profile/Profile.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
  },
  {
    path: '/find-id',
    name: 'FindId',
    component: FindId,
  },
  {
    path: '/find-password',
    name: 'FindPassword',
    component: FindPassword,
  },
  { path: '/ai-quest', name: 'AiQuestGenerator', component: AiQuestGenerator },

  {
    path: '/quests',
    name: 'QuestBoard',
    component: QuestBoard,
    meta: { requiresAuth: true },
  },
  {
    path: '/quest/:id',
    name: 'QuestDetail',
    component: QuestDetail,
    meta: { requiresAuth: true },
  },
  {
    path: '/quest/:id/edit',
    name: 'QuestEdit',
    component: QuestEdit,
    meta: { requiresAuth: true },
  },
  {
    path: '/quest-calendar',
    name: 'QuestCalendar',
    component: QuestCalendar,
    meta: { requiresAuth: true },
  },
  // {
  //   path: '/quest-calendar',
  //   name: 'QuestCalendar',
  //   component: QuestCalendar,
  //   meta: { requiresAuth: true },
  // },
  // {
  //   path: '/quest/:id',
  //   name: 'QuestDetail',
  //   component: QuestDetail,
  //   meta: { requiresAuth: true },
  // },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true },
  },
  // 404 페이지는 맨 마지막에 위치
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// 인증 관련 네비게이션 가드
router.beforeEach(async (to, from, next) => {
  // Pinia 스토어 동적 import로 순환 참조 방지
  const { useUserLoginStore } = await import('@/modules/user/login/login-store.js')
  const loginStore = useUserLoginStore()

  // 404 페이지 처리 - 존재하지 않는 라우트인지 확인
  if (to.name === 'NotFound') {
    // 토큰이 있다면 세션 복원 시도
    const token = localStorage.getItem('access_token')
    if (token) {
      loginStore.restoreSession()
    }
    
    if (!loginStore.isLoggedIn) {
      // 미인증 사용자는 로그인 페이지로
      next({ name: 'Login' })
      return
    } else {
      // 인증된 사용자는 홈페이지로
      next({ name: 'Home' })
      return
    }
  }

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!loginStore.isLoggedIn) {
      // 토큰이 있다면 세션 복원 시도
      const token = localStorage.getItem('access_token')
      if (token) {
        loginStore.restoreSession()
      }
      
      // 여전히 로그인되지 않았다면 Forbidden 페이지로
      if (!loginStore.isLoggedIn) {
        next({ name: 'Forbidden' })
        return
      }
    }
  }
  
  next()
})

// 전역 에러 핸들러
router.onError((error) => {
  console.error('Router error:', error)
  router.push({ name: 'ServerError' })
})

export default router
