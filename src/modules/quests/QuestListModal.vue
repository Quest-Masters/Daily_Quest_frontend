<template>
  <div v-if="visible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <Calendar class="title-icon" />
          {{ formatDate(date) }} 퀘스트
        </h3>
        <button @click="closeModal" class="close-button">
          <X class="close-icon" />
        </button>
      </div>

      <div class="modal-body">
        <div v-if="quests.length === 0" class="no-quests">
          <Sword class="no-quest-icon" />
          <p>이 날짜에는 마감인 퀘스트가 없습니다.</p>
        </div>

        <div v-else class="quests-list">
          <div
            v-for="quest in quests"
            :key="quest.id"
            :class="['quest-item-modal', `status-${quest.status}`]"
            @click="selectQuest(quest.id)"
          >
            <div class="quest-header">
              <div class="quest-status">
                <div :class="['status-indicator', `status-${quest.status}`]"></div>
                <span class="status-text">{{ getStatusText(quest.status) }}</span>
              </div>
              <div :class="['difficulty-badge', `difficulty-${quest.difficulty}`]">
                {{ getDifficultyText(quest.difficulty) }}
              </div>
            </div>

            <div class="quest-content">
              <h4 class="quest-title">{{ quest.title }}</h4>
              <p class="quest-description">{{ quest.description }}</p>

              <div class="quest-meta">
                <div class="quest-category">
                  <Tag class="meta-icon" />
                  <span>{{ getCategoryText(quest.category) }}</span>
                </div>
                <div class="quest-xp">
                  <Star class="meta-icon" />
                  <span>{{ quest.xp }} XP</span>
                </div>
                <div class="quest-due">
                  <Clock class="meta-icon" />
                  <span>{{ formatDueTime(quest.dueDate) }}</span>
                </div>
              </div>
            </div>

            <div class="quest-actions">
              <base-button
                variant="secondary"
                size="small"
                @click.stop="selectQuest(quest.id)"
              >
                <ExternalLink class="action-icon" />
                상세보기
              </base-button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div class="quest-summary">
          <div class="summary-item">
            <span class="summary-label">총 퀘스트</span>
            <span class="summary-value">{{ quests.length }}개</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">완료</span>
            <span class="summary-value completed">{{ completedQuests }}개</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">진행중</span>
            <span class="summary-value in-progress">{{ inProgressQuests }}개</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">총 XP</span>
            <span class="summary-value xp">{{ totalXP }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Calendar, X, Sword, Tag, Star, Clock, ExternalLink } from 'lucide-vue-next'
import BaseButton from '@/components/BaseSetting/BaseButton.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    required: true
  },
  quests: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'quest-selected'])

const closeModal = () => {
  emit('close')
}

const selectQuest = (questId) => {
  emit('quest-selected', questId)
}

const formatDate = (date) => {
  if (!date) return ''

  const dateObj = new Date(date)
  return dateObj.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

const formatDueTime = (dueDate) => {
  if (!dueDate) return '시간 미정'

  const date = new Date(dueDate)
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '대기중',
    'in-progress': '진행중',
    completed: '완료',
    failed: '실패'
  }
  return statusMap[status] || '대기중'
}

const getDifficultyText = (difficulty) => {
  const difficultyMap = {
    easy: '쉬움',
    medium: '보통',
    hard: '어려움'
  }
  return difficultyMap[difficulty] || '보통'
}

const getCategoryText = (category) => {
  const categoryMap = {
    health: '건강',
    learning: '학습',
    skill: '스킬',
    social: '소셜',
    creative: '창작'
  }
  return categoryMap[category] || '기타'
}

const completedQuests = computed(() => {
  return props.quests.filter(quest => quest.status === 'completed').length
})

const inProgressQuests = computed(() => {
  return props.quests.filter(quest => quest.status === 'in-progress').length
})

const totalXP = computed(() => {
  return props.quests.reduce((total, quest) => {
    return total + (quest.status === 'completed' ? quest.xp : 0)
  }, 0)
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: var(--card-color);
  border-radius: 16px;
  max-width: 600px;
  max-height: 80vh;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(135deg, var(--primary-light), rgba(255, 255, 255, 0.8));
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color);
}

.title-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

.close-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-secondary);
}

.close-button:hover .close-icon {
  color: var(--error-color);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.no-quests {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
}

.no-quest-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  opacity: 0.5;
}

.no-quests p {
  margin: 0;
  font-size: 1rem;
}

.quests-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.quest-item-modal {
  background-color: var(--background-color);
  border-radius: 12px;
  padding: 1.25rem;
  border-left: 4px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

.quest-item-modal:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  background-color: var(--card-color);
}

.quest-item-modal.status-pending {
  border-left-color: #6b7280;
}

.quest-item-modal.status-in-progress {
  border-left-color: var(--primary-color);
}

.quest-item-modal.status-completed {
  border-left-color: var(--success-color);
}

.quest-item-modal.status-failed {
  border-left-color: var(--error-color);
}

.quest-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.quest-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-indicator.status-pending {
  background-color: #6b7280;
}

.status-indicator.status-in-progress {
  background-color: var(--primary-color);
}

.status-indicator.status-completed {
  background-color: var(--success-color);
}

.status-indicator.status-failed {
  background-color: var(--error-color);
}

.status-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.difficulty-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.difficulty-easy {
  background-color: #dcfce7;
  color: #16a34a;
}

.difficulty-medium {
  background-color: #fef3c7;
  color: #d97706;
}

.difficulty-hard {
  background-color: #fee2e2;
  color: #dc2626;
}

.quest-content {
  margin-bottom: 1rem;
}

.quest-title {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.4;
}

.quest-description {
  margin: 0 0 1rem 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
}

.quest-meta {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.quest-category,
.quest-xp,
.quest-due {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.quest-category {
  color: var(--text-secondary);
}

.quest-xp {
  color: var(--primary-color);
  font-weight: 600;
}

.quest-due {
  color: var(--text-secondary);
}

.meta-icon {
  width: 14px;
  height: 14px;
}

.quest-actions {
  display: flex;
  justify-content: flex-end;
}

.action-icon {
  width: 1rem;
  height: 1rem;
}

.modal-footer {
  border-top: 1px solid var(--border-color);
  padding: 1.25rem 1.5rem;
  background-color: var(--background-color);
}

.quest-summary {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.summary-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.summary-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.summary-value.completed {
  color: var(--success-color);
}

.summary-value.in-progress {
  color: var(--primary-color);
}

.summary-value.xp {
  color: var(--accent-color);
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-height: 90vh;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }

  .quest-meta {
    gap: 1rem;
  }

  .quest-summary {
    gap: 0.75rem;
  }

  .summary-item {
    flex: 1;
    min-width: 60px;
  }

  .modal-title {
    font-size: 1.125rem;
  }
}

@media (max-width: 480px) {
  .modal-content {
    width: 100%;
    height: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .quest-item-modal {
    padding: 1rem;
  }

  .quest-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .quest-summary {
    justify-content: center;
  }
}
</style>