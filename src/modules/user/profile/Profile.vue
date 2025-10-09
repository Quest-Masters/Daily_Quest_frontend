<template>
  <div class="profile-page" v-if="profileStore.userProfile.name">
    <!-- 프로필 헤더 -->
    <div class="profile-header">
      <div class="profile-avatar">
        <div class="avatar-image">
          <User class="avatar-icon" />
          <span class="avatar-level">Lv.{{ profileStore.userProfile.level }}</span>
        </div>
      </div>
      <div class="profile-info">
        <h1>{{ profileStore.userProfile.name }}</h1>
        <p class="profile-title">{{ profileStore.userProfile.currentTitle }}</p>
        <div class="profile-stats">
          <div class="stat-item">
            <span class="stat-value">{{ profileStore.userProfile.totalQuestsCompleted }}</span>
            <span class="stat-label">완료한 퀘스트</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ profileStore.userProfile.totalXp || 0 }}</span>
            <span class="stat-label">총 경험치</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ profileStore.userProfile.consecutiveDays }}</span>
            <span class="stat-label">연속 일수</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ profileStore.userProfile.titles ? profileStore.userProfile.titles.length : 1 }}</span>
            <span class="stat-label">획득한 칭호</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 탭 네비게이션 -->
    <div class="tab-navigation">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-button', { 'tab-active': activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" class="tab-icon" />
        {{ tab.label }}
      </button>
    </div>

    <!-- 탭 컨텐츠 -->
    <div class="tab-content">
      <!-- 개요 탭 -->
      <div v-if="activeTab === 'overview'" class="tab-panel">
        <div class="profile-section">
          <h2>레벨 진행도</h2>
          <div class="level-progress">
            <div class="level-info">
              <span>레벨 {{ profileStore.userProfile.level }}</span>
              <span>{{ profileStore.userProfile.xp }} / {{ profileStore.requiredXpForCurrentLevel }} XP</span>
            </div>
            <div class="xp-bar">
              <div class="xp-progress" :style="{ width: profileStore.xpPercentage + '%' }"></div>
            </div>
            <div class="xp-details">
              <small>다음 레벨까지 {{ profileStore.requiredXpForCurrentLevel - profileStore.userProfile.xp }} XP 남음</small>
            </div>
          </div>
        </div>

        <div class="profile-section">
          <h2>최근 활동</h2>
          <div class="activity-list">
            <div class="activity-item">
              <div class="activity-icon">🏆</div>
              <div class="activity-content">
                <p>새로운 칭호 "{{ profileStore.userProfile.currentTitle }}" 획득</p>
                <small>최근</small>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon">⭐</div>
              <div class="activity-content">
                <p>레벨 {{ profileStore.userProfile.level }} 달성</p>
                <small>최근</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 칭호 탭 -->
      <div v-if="activeTab === 'titles'" class="tab-panel">
        <div class="profile-section">
          <h2>칭호 관리</h2>
          <TitleManager ref="titleManagerRef" />
        </div>
      </div>

      <!-- 설정 탭 -->
      <div v-if="activeTab === 'settings'" class="tab-panel">
        <div class="profile-section">
          <h2>계정 정보</h2>
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

            <div class="form-actions">
              <base-button @click="saveProfile" variant="primary" :loading="profileStore.loading">
                저장하기
              </base-button>
            </div>
          </div>
        </div>

        <div class="profile-section">
          <h2>알림 설정</h2>
          <div class="settings-form">
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="notificationSettings.questReminders" />
                퀘스트 리마인더
              </label>
              <small>미완료 퀘스트에 대한 알림을 받습니다.</small>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="notificationSettings.levelUpAlerts" />
                레벨업 알림
              </label>
              <small>레벨업 시 알림을 받습니다.</small>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="notificationSettings.titleUnlocks" />
                칭호 획득 알림
              </label>
              <small>새로운 칭호 획득 시 알림을 받습니다.</small>
            </div>
          </div>
        </div>

        <div class="profile-section danger-zone">
          <h2>계정 관리</h2>
          <div class="danger-actions">
            <button class="danger-button" @click="confirmAccountReset">
              <AlertTriangle class="icon" />
              계정 초기화
            </button>
            <button class="danger-button" @click="confirmAccountDelete">
              <Trash2 class="icon" />
              계정 삭제
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 레벨업 알림 모달 -->
    <div v-if="showLevelUpModal" class="modal-overlay" @click="closeLevelUpModal">
      <div class="modal-content level-up-modal" @click.stop>
        <div class="level-up-animation">
          <div class="level-up-icon">🎉</div>
          <h2>레벨업!</h2>
          <p class="level-text">레벨 {{ newLevel }}에 도달했습니다!</p>
          <p class="xp-gained">+{{ xpGained }} XP 획득</p>
          <button @click="closeLevelUpModal" class="level-up-button">
            확인
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { User, Trophy, Settings, BarChart3, AlertTriangle, Trash2 } from 'lucide-vue-next'
import BaseInput from '@/components/BaseSetting/BaseInput.vue'
import BaseButton from '@/components/BaseSetting/BaseButton.vue'
import TitleManager from '@/components/TitleManager.vue'
import { useProfileStore } from '@/modules/user/profile/profile-store.js'

const profileStore = useProfileStore()
const titleManagerRef = ref(null)

// 탭 관리
const activeTab = ref('overview')
const tabs = [
  { id: 'overview', label: '개요', icon: BarChart3 },
  { id: 'titles', label: '칭호', icon: Trophy },
  { id: 'settings', label: '설정', icon: Settings }
]

// 프로필 폼 데이터
const profileForm = reactive({
  name: '',
  email: '',
  phone: ''
})

// 알림 설정
const notificationSettings = reactive({
  questReminders: true,
  levelUpAlerts: true,
  titleUnlocks: true
})

// 레벨업 모달
const showLevelUpModal = ref(false)
const newLevel = ref(0)
const xpGained = ref(0)

// 프로필 저장
const saveProfile = async () => {
  try {
    // 이메일과 전화번호 파싱
    const emailParts = profileForm.email.split('@')
    const phoneParts = profileForm.phone.split('-')

    const profileData = {
      name: profileForm.name,
      email: {
        id: emailParts[0] || '',
        selectedDomain: emailParts[1] || '',
        customDomain: ''
      },
      phone: {
        first: phoneParts[0] || '',
        middle: phoneParts[1] || '',
        last: phoneParts[2] || ''
      }
    }

    const success = await profileStore.updateProfile(profileData)

    if (success) {
      showNotification('프로필이 저장되었습니다!', 'success')
    } else {
      showNotification('프로필 저장에 실패했습니다.', 'error')
    }
  } catch (error) {
    console.error('프로필 저장 실패:', error)
    showNotification('프로필 저장 중 오류가 발생했습니다.', 'error')
  }
}

// 알림 표시
const showNotification = (message, type = 'info') => {
  // 간단한 알림 (추후 전역 notification 시스템으로 대체 가능)
  alert(message)
}

// 레벨업 모달 표시
const showLevelUpAlert = (level, xp) => {
  newLevel.value = level
  xpGained.value = xp
  showLevelUpModal.value = true
}

// 레벨업 모달 닫기
const closeLevelUpModal = () => {
  showLevelUpModal.value = false
}

// 계정 초기화 확인
const confirmAccountReset = () => {
  if (confirm('정말로 계정을 초기화하시겠습니까? 모든 진행 상황이 삭제됩니다.')) {
    // 계정 초기화 로직
    alert('계정 초기화 기능은 아직 구현되지 않았습니다.')
  }
}

// 계정 삭제 확인
const confirmAccountDelete = () => {
  if (confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
    // 계정 삭제 로직
    alert('계정 삭제 기능은 아직 구현되지 않았습니다.')
  }
}

// 프로필 데이터 폼에 바인딩
const bindProfileToForm = () => {
  const profile = profileStore.userProfile
  profileForm.name = profile.name

  if (profile.email && profile.email.id && profile.email.selectedDomain) {
    profileForm.email = `${profile.email.id}@${profile.email.selectedDomain}`
  }

  if (profile.phone && profile.phone.first && profile.phone.middle && profile.phone.last) {
    profileForm.phone = `${profile.phone.first}-${profile.phone.middle}-${profile.phone.last}`
  }
}

// 프로필 변경 감지
watch(() => profileStore.userProfile.name, () => {
  bindProfileToForm()
})

onMounted(async () => {
  // 프로필 데이터가 없으면 로드
  if (!profileStore.userProfile.name) {
    await profileStore.fetchProfile()
  }

  // 폼에 바인딩
  bindProfileToForm()
})

// 외부에서 접근 가능하도록 노출 (퀘스트 완료 시 사용)
defineExpose({
  showLevelUpAlert
})
</script>

<style scoped>
.profile-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
}

/* 프로필 헤더 */
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  color: white;
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
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  color: white;
  position: relative;
  backdrop-filter: blur(10px);
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.avatar-icon {
  width: 60px;
  height: 60px;
}

.avatar-level {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: var(--warning-color);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  border: 2px solid white;
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
  color: white;
  font-size: 2rem;
  font-weight: 700;
}

.profile-title {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.profile-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
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
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
}

/* 탭 네비게이션 */
.tab-navigation {
  display: flex;
  background-color: var(--card-color);
  border-radius: 12px;
  padding: 0.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  gap: 0.5rem;
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  background-color: transparent;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button:hover {
  background-color: var(--background-color);
  color: var(--text-primary);
}

.tab-button.tab-active {
  background-color: var(--primary-color);
  color: white;
  box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.3);
}

.tab-icon {
  width: 18px;
  height: 18px;
}

/* 탭 콘텐츠 */
.tab-content {
  min-height: 400px;
}

.tab-panel {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 프로필 섹션 */
.profile-section {
  background-color: var(--card-color);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
}

.profile-section h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

/* 레벨 진행도 */
.level-progress {
  margin-bottom: 1rem;
}

.level-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.xp-bar {
  width: 100%;
  height: 12px;
  background-color: var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.xp-progress {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
  transition: width 0.3s ease;
  border-radius: 6px;
}

.xp-details {
  text-align: center;
}

.xp-details small {
  color: var(--text-secondary);
  font-style: italic;
}

/* 활동 리스트 */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: var(--background-color);
  border-radius: 8px;
  border-left: 4px solid var(--primary-color);
}

.activity-icon {
  font-size: 1.5rem;
  margin-right: 1rem;
}

.activity-content p {
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
  font-weight: 500;
}

.activity-content small {
  color: var(--text-secondary);
}

/* 설정 폼 */
.settings-form {
  max-width: 500px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-actions {
  margin-top: 2rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  margin-bottom: 0.5rem;
}

.checkbox-label input {
  margin-right: 0.75rem;
  margin-top: 0.125rem;
}

.checkbox-label small {
  display: block;
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

/* 위험 구역 */
.danger-zone {
  border-color: var(--error-color);
  background-color: rgba(var(--error-color-rgb), 0.05);
}

.danger-zone h2 {
  color: var(--error-color);
}

.danger-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 640px) {
  .danger-actions {
    flex-direction: row;
  }
}

.danger-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px solid var(--error-color);
  border-radius: 8px;
  background-color: transparent;
  color: var(--error-color);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.danger-button:hover {
  background-color: var(--error-color);
  color: white;
}

.danger-button .icon {
  width: 18px;
  height: 18px;
}

/* 레벨업 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.level-up-modal {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  color: white;
  max-width: 400px;
  width: 90%;
}

.level-up-animation {
  animation: levelUpBounce 0.6s ease-out;
}

@keyframes levelUpBounce {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.level-up-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.level-up-modal h2 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
  font-weight: 700;
}

.level-text {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.xp-gained {
  font-size: 1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.level-up-button {
  background-color: white;
  color: var(--primary-color);
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.level-up-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

/* 반응형 개선 */
@media (max-width: 640px) {
  .tab-button {
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem 0.5rem;
    font-size: 0.875rem;
  }

  .profile-section {
    padding: 1.5rem;
  }

  .profile-header {
    padding: 1.5rem;
  }
}
</style>
