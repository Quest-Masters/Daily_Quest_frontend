<template>
  <div class="title-manager">
    <div class="title-section">
      <h3>보유 칭호</h3>
      <div class="titles-grid">
        <div
          v-for="title in availableTitles"
          :key="title.id"
          class="title-item"
          :class="{
            'title-active': title.name === profileStore.userProfile.currentTitle,
            'title-locked': !isUnlocked(title.id)
          }"
          @click="selectTitle(title)"
        >
          <div class="title-icon">
            <component :is="title.icon" v-if="title.icon" />
            <span v-else>{{ title.emoji }}</span>
          </div>
          <div class="title-details">
            <h4>{{ title.name }}</h4>
            <p>{{ title.description }}</p>
            <div v-if="!isUnlocked(title.id)" class="unlock-condition">
              <small>{{ title.unlockCondition }}</small>
            </div>
            <div v-if="title.name === profileStore.userProfile.currentTitle" class="current-title-badge">
              현재 칭호
            </div>
          </div>
          <div class="title-status">
            <div v-if="isUnlocked(title.id)" class="unlocked-icon">✓</div>
            <div v-else class="locked-icon">🔒</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 칭호 변경 확인 모달 -->
    <div v-if="showTitleModal" class="modal-overlay" @click="closeTitleModal">
      <div class="modal-content" @click.stop>
        <h3>칭호 변경</h3>
        <p>"{{ selectedTitle?.name }}" 칭호로 변경하시겠습니까?</p>
        <div class="modal-actions">
          <button @click="closeTitleModal" class="btn-cancel">취소</button>
          <button @click="confirmTitleChange" class="btn-confirm">변경</button>
        </div>
      </div>
    </div>

    <!-- 업적 달성 알림 -->
    <div v-if="showAchievementNotification" class="achievement-notification">
      <div class="achievement-content">
        <div class="achievement-icon">🏆</div>
        <div class="achievement-text">
          <h4>새로운 칭호 획득!</h4>
          <p>{{ newAchievement?.name }}</p>
          <small>{{ newAchievement?.description }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProfileStore } from '@/modules/user/profile/profile-store.js'
import { Crown, Shield, Sword, Star, Trophy, Target } from 'lucide-vue-next'

const profileStore = useProfileStore()

const showTitleModal = ref(false)
const selectedTitle = ref(null)
const showAchievementNotification = ref(false)
const newAchievement = ref(null)

// 사용 가능한 모든 칭호 정의
const availableTitles = ref([
  {
    id: 'beginner_adventurer',
    name: '초보 모험가',
    description: '퀘스트를 시작한 새내기 모험가',
    unlockCondition: '기본 칭호',
    emoji: '🌟',
    icon: Star,
    isDefault: true
  },
  {
    id: 'dedicated_adventurer',
    name: '성실한 모험가',
    description: '꾸준히 퀘스트를 완료하는 모험가',
    unlockCondition: '퀘스트 10개 완료',
    emoji: '⚔️',
    icon: Sword
  },
  {
    id: 'quest_master',
    name: '퀘스트 마스터',
    description: '퀘스트의 달인이 된 숙련자',
    unlockCondition: '퀘스트 50개 완료',
    emoji: '👑',
    icon: Crown
  },
  {
    id: 'legendary_hero',
    name: '전설의 영웅',
    description: '모든 이가 존경하는 전설적인 영웅',
    unlockCondition: '퀘스트 100개 완료',
    emoji: '🏆',
    icon: Trophy
  },
  {
    id: 'experienced_warrior',
    name: '숙련된 전사',
    description: '높은 레벨에 도달한 경험 많은 전사',
    unlockCondition: '레벨 10 달성',
    emoji: '🛡️',
    icon: Shield
  },
  {
    id: 'dedicated_user',
    name: '성실한 사용자',
    description: '꾸준함의 대명사인 성실한 사용자',
    unlockCondition: '7일 연속 퀘스트 완료',
    emoji: '🎯',
    icon: Target
  },
  {
    id: 'study_expert',
    name: '학습 전문가',
    description: '학습 퀘스트를 많이 완료한 전문가',
    unlockCondition: '학습 퀘스트 20개 완료',
    emoji: '📚'
  },
  {
    id: 'fitness_guru',
    name: '운동 구루',
    description: '운동 퀘스트의 달인',
    unlockCondition: '운동 퀘스트 15개 완료',
    emoji: '💪'
  }
])

// 칭호가 해제되었는지 확인
const isUnlocked = (titleId) => {
  // 기본 칭호는 항상 해제됨
  if (titleId === 'beginner_adventurer') return true

  return profileStore.userProfile.titles.includes(titleId)
}

// 해제된 칭호만 필터링
const unlockedTitles = computed(() => {
  return availableTitles.value.filter(title => isUnlocked(title.id))
})

// 칭호 선택
const selectTitle = (title) => {
  if (!isUnlocked(title.id)) {
    return // 잠긴 칭호는 선택할 수 없음
  }

  if (title.name === profileStore.userProfile.currentTitle) {
    return // 이미 현재 칭호인 경우
  }

  selectedTitle.value = title
  showTitleModal.value = true
}

// 칭호 변경 확인
const confirmTitleChange = async () => {
  if (selectedTitle.value) {
    const success = await profileStore.setCurrentTitle(selectedTitle.value.name)
    if (success) {
      showNotification('칭호가 변경되었습니다!', 'success')
    } else {
      showNotification('칭호 변경에 실패했습니다.', 'error')
    }
  }
  closeTitleModal()
}

// 모달 닫기
const closeTitleModal = () => {
  showTitleModal.value = false
  selectedTitle.value = null
}

// 업적 달성 알림 표시
const showAchievementAlert = (achievement) => {
  newAchievement.value = achievement
  showAchievementNotification.value = true

  // 3초 후 자동으로 닫기
  setTimeout(() => {
    showAchievementNotification.value = false
    newAchievement.value = null
  }, 3000)
}

// 알림 표시
const showNotification = (message, type = 'info') => {
  // 간단한 알림 (추후 전역 notification 시스템으로 대체 가능)
  alert(message)
}

// 새로운 칭호 해제 확인 (외부에서 호출)
const checkNewTitleUnlock = (titleId, titleName) => {
  const title = availableTitles.value.find(t => t.id === titleId)
  if (title) {
    showAchievementAlert(title)
  }
}

onMounted(() => {
  // 프로필 데이터 로드
  if (!profileStore.userProfile.name) {
    profileStore.fetchProfile()
  }
})

// 외부에서 접근할 수 있도록 노출
defineExpose({
  checkNewTitleUnlock,
  showAchievementAlert
})
</script>

<style scoped>
.title-manager {
  width: 100%;
}

.title-section h3 {
  margin-bottom: 1rem;
  color: var(--text-primary);
  font-size: 1.2rem;
  font-weight: 600;
}

.titles-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .titles-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.title-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: var(--background-color);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.title-item:hover:not(.title-locked) {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.title-item.title-active {
  border-color: var(--primary-color);
  background-color: var(--primary-light);
}

.title-item.title-locked {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--card-color);
}

.title-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--primary-light);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  margin-right: 1rem;
  flex-shrink: 0;
}

.title-locked .title-icon {
  background-color: var(--border-color);
  opacity: 0.7;
}

.title-details {
  flex: 1;
}

.title-details h4 {
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.title-details p {
  margin: 0 0 0.5rem 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.unlock-condition {
  margin-top: 0.5rem;
}

.unlock-condition small {
  color: var(--warning-color);
  font-weight: 500;
}

.current-title-badge {
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
  margin-top: 0.5rem;
}

.title-status {
  margin-left: 1rem;
  flex-shrink: 0;
}

.unlocked-icon {
  color: var(--success-color);
  font-size: 1.2rem;
  font-weight: bold;
}

.locked-icon {
  color: var(--text-secondary);
  font-size: 1rem;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--card-color);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.modal-content h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.modal-content p {
  margin: 0 0 1.5rem 0;
  color: var(--text-secondary);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-cancel, .btn-confirm {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background-color: var(--border-color);
  color: var(--text-primary);
}

.btn-cancel:hover {
  background-color: var(--text-secondary);
}

.btn-confirm {
  background-color: var(--primary-color);
  color: white;
}

.btn-confirm:hover {
  background-color: var(--primary-dark);
}

/* 업적 알림 */
.achievement-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: var(--card-color);
  border: 2px solid var(--primary-color);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  animation: slideIn 0.3s ease-out;
}

.achievement-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.achievement-icon {
  font-size: 2rem;
}

.achievement-text h4 {
  margin: 0 0 0.25rem 0;
  color: var(--primary-color);
  font-size: 1rem;
}

.achievement-text p {
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
  font-weight: 600;
}

.achievement-text small {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>