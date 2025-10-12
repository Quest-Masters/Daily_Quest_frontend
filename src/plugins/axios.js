// src/plugins/axios.js
import axios from 'axios'
import { getAccessToken } from '@/utils/cookie-utils'

axios.defaults.baseURL = 'http://localhost:8080'
axios.defaults.headers.common['Content-Type'] = 'application/json'
axios.defaults.withCredentials = true // httpOnly 쿠키 사용을 위해 모든 요청에 포함

// Request interceptor - 토큰 자동 추가
axios.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token && token !== 'null' && token !== 'undefined') {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    // 토큰이 없거나 유효하지 않으면 Authorization 헤더 삭제
    delete config.headers.Authorization
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// 요청 큐를 위한 변수들
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

// Response interceptor - 자동 토큰 갱신 및 인증 오류 처리
axios.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // 401 Unauthorized 에러 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 토큰 갱신 중이면 큐에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token
          return axios(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Pinia 스토어 동적 import로 순환 참조 방지
        const { useUserLoginStore } = await import('@/modules/user/login/login-store.js')
        const loginStore = useUserLoginStore()

        // refresh 토큰으로 새 access 토큰 요청
        const success = await loginStore.refreshAccessToken()
        
        if (success) {
          processQueue(null, loginStore.token)
          originalRequest.headers['Authorization'] = 'Bearer ' + loginStore.token
          return axios(originalRequest)
        } else {
          processQueue(error, null)
          throw error
        }
      } catch (refreshError) {
        processQueue(refreshError, null)
        
        // refresh 토큰도 만료된 경우 로그아웃
        const { useUserLoginStore } = await import('@/modules/user/login/login-store.js')
        const loginStore = useUserLoginStore()
        loginStore.logout()
        
        // 로그인 페이지로 리다이렉트 (현재 페이지가 로그인 페이지가 아닌 경우)
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default axios
