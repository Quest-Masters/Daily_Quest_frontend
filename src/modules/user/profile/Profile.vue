<template>
  <div class="profile-page" v-if="userProfile">
    <div class="profile-header">
      <div class="profile-avatar">
        <div class="avatar-image">
          <User class="avatar-icon" />
          <span class="avatar-level">Lv.{{ userProfile.level }}</span>
        </div>
      </div>
      <div class="profile-info">
        <h1>{{ userProfile.name }}</h1>
        <p class="profile-title">{{ profileForm.title }}</p>
        <div class="profile-stats">
          <div class="stat-item">
            <span class="stat-value">0</span>
            <span class="stat-label">완료한 퀘스트</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">0</span>
            <span class="stat-label">연속 일수</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">0</span>
            <span class="stat-label">획득한 배지</span>
          </div>
        </div>
      </div>
    </div>

    <div class="profile-content">
      <div class="profile-section">
        <h2>레벨 진행도</h2>
        <div class="level-progress">
          <div class="level-info">
            <span>레벨 {{ userProfile.level }}</span>
            <span>{{ userProfile.xp }} / 100 XP</span>
          </div>
          <div class="xp-bar">
            <div class="xp-progress" :style="{ width: xpPercentage + '%' }"></div>
          </div>
        </div>
      </div>

      <div class="profile-section">
        <h2>계정 설정</h2>
        <div class="settings-form">
          <base-input
            id="profile-name"
            label="이름"
            v-model="profileForm.name"
            placeholder="이름을 입력하세요"
          />

          <base-input
            id="profile-email"
            label="이메일"
            v-model="profileForm.email"
            type="email"
            placeholder="이메일을 입력하세요"
          />

          <base-input
            id="profile-phone"
            label="휴대폰 번호"
            v-model="profileForm.phone"
            placeholder="010-1234-5678"
          />

          <div class="form-group">
            <label for="profile-title" class="form-label">칭호</label>
            <select id="profile-title" v-model="profileForm.title" class="form-input">
              <option value="초보 모험가">초보 모험가</option>
              <option value="성실한 용사">성실한 용사</option>
              <option value="퀘스트 마스터">퀘스트 마스터</option>
              <option value="전설의 영웅">전설의 영웅</option>
            </select>
          </div>

          <base-button @click="saveProfile" variant="primary"> 저장하기 </base-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'
import { User } from 'lucide-vue-next'
import BaseInput from '@/components/BaseSetting/BaseInput.vue'
import BaseButton from '@/components/BaseSetting/BaseButton.vue'

const userProfile = reactive({
  id: '',
  name: '',
  email: {
    id: '',
    selectedDomain: '',
    customDomain: '',
  },
  phone: {
    first: '',
    middle: '',
    last: '',
  },
  level: 0,
  xp: 0,
  status: 0,
})

const profileForm = reactive({
  name: '',
  email: '',
  phone: '',
  title: '초보 모험가',
})

// 레벨 퍼센트 계산
const xpPercentage = computed(() => {
  return (userProfile.xp / 100) * 100
})

// 프로필 불러오기
const fetchProfile = async () => {
  try {
    const res = await axios.get('/api/profile', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })

    const data = res.data

    // 프로필 바인딩
    userProfile.id = data.id
    userProfile.name = data.name
    userProfile.level = data.level
    userProfile.xp = data.xp
    userProfile.status = data.status
    userProfile.email = data.email
    userProfile.phone = data.phone

    profileForm.name = data.name
    profileForm.email = `${data.email.id}@${data.email.selectedDomain}`
    profileForm.phone = `${data.phone.first}-${data.phone.middle}-${data.phone.last}`
  } catch (error) {
    console.error('프로필 가져오기 실패:', error)
  }
}

// 저장
const saveProfile = () => {
  alert('프로필이 저장되었습니다. (데모용)')
}

onMounted(fetchProfile)
</script>

<style scoped>
.profile-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--card-color);
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@media (min-width: 640px) {
  .profile-header {
    flex-direction: row;
    align-items: flex-start;
  }
}

.profile-avatar {
  margin-bottom: 1.5rem;
}

@media (min-width: 640px) {
  .profile-avatar {
    margin-bottom: 0;
    margin-right: 2rem;
  }
}

.avatar-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: var(--primary-light);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  color: var(--primary-dark);
  position: relative;
}

.avatar-icon {
  width: 60px;
  height: 60px;
}

.avatar-level {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: var(--primary-color);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
}

.profile-info {
  flex: 1;
  text-align: center;
}

@media (min-width: 640px) {
  .profile-info {
    text-align: left;
  }
}

.profile-info h1 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.profile-title {
  color: var(--primary-color);
  font-weight: 600;
  margin-bottom: 1rem;
}

.profile-stats {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .profile-stats {
    justify-content: flex-start;
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

@media (min-width: 640px) {
  .stat-item {
    align-items: flex-start;
  }
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-dark);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.profile-section {
  background-color: var(--card-color);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-section h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-size: 1.25rem;
}

.level-progress {
  margin-bottom: 1rem;
}

.level-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.xp-bar {
  width: 100%;
  height: 8px;
  background-color: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.xp-progress {
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
}

.badges-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .badges-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.badge-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: var(--background-color);
  border-radius: 8px;
}

.badge-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--primary-light);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  margin-right: 1rem;
}

.badge-locked {
  opacity: 0.5;
  background-color: var(--border-color);
}

.badge-details h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.badge-details p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.badge-locked-text {
  display: inline-block;
  font-size: 0.75rem;
  color: var(--error-color);
  margin-top: 0.25rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  padding: 1rem;
  background-color: var(--background-color);
  border-radius: 8px;
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.stat-card .stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.stat-card p {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.settings-form {
  max-width: 500px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--background-color);
  color: var(--text-primary);
  font-size: 1rem;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-label input {
  margin-right: 0.5rem;
}
</style>
