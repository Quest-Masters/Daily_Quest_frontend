<template>
  <div
    :class="['quest-item', `status-${quest.status}`, `difficulty-${quest.difficulty}`]"
    @click="handleQuestClick"
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
      <h3 class="quest-title">{{ quest.title }}</h3>
      <p class="quest-description">{{ quest.description }}</p>

      <div class="quest-meta">
        <div class="quest-category">
          <Tag class="category-icon" />
          <span>{{ getCategoryText(quest.category) }}</span>
        </div>
        <div class="quest-xp">
          <Star class="xp-icon" />
          <span>{{ quest.xp }} XP</span>
        </div>
      </div>

      <div class="quest-progress" v-if="quest.objectives?.length">
        <div class="progress-info">
          <span>진행률</span>
          <span>{{ computedProgress }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: computedProgress + '%' }"></div>
        </div>
      </div>

      <div class="quest-due-date">
        <Calendar class="date-icon" />
        <span>{{ formatDueDate(quest.dueDate) }}</span>
      </div>
    </div>

    <div class="quest-actions">
      <base-button
        v-if="quest.status === 'pending'"
        variant="primary"
        size="small"
        @click.stop="handleStartQuest"
      >
        시작하기
      </base-button>

      <base-button
        v-else-if="quest.status === 'in-progress'"
        variant="success"
        size="small"
        @click.stop="handleCompleteQuest"
      >
        완료하기
      </base-button>

      <base-button
        v-else-if="quest.status === 'completed'"
        variant="secondary"
        size="small"
        disabled
      >
        완료됨
      </base-button>

      <base-button
        v-else-if="quest.status === 'failed'"
        variant="danger"
        size="small"
        @click.stop="handleStartQuest"
      >
        재시도
      </base-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Star, Tag, Calendar } from 'lucide-vue-next'
import BaseButton from '@/components/BaseSetting/BaseButton.vue'

const props = defineProps({
  quest: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['quest-click', 'quest-start', 'quest-complete'])

const handleQuestClick = () => {
  emit('quest-click', props.quest.id)
}

const handleStartQuest = () => {
  emit('quest-start', props.quest.id)
}

const handleCompleteQuest = () => {
  emit('quest-complete', props.quest.id)
}

// ✅ 진행률 계산
const computedProgress = computed(() => {
  const objectives = props.quest.objectives || []
  const total = objectives.length
  const completed = objectives.filter((obj) => obj.completed).length
  return total ? Math.round((completed / total) * 100) : 0
})

const getStatusText = (status) => {
  const statusMap = {
    pending: '대기중',
    'in-progress': '진행중',
    completed: '완료',
    failed: '실패',
  }
  return statusMap[status] || '대기중'
}

const getDifficultyText = (difficulty) => {
  const difficultyMap = {
    easy: '쉬움',
    medium: '보통',
    hard: '어려움',
  }
  return difficultyMap[difficulty] || '보통'
}

const getCategoryText = (category) => {
  const categoryMap = {
    health: '건강',
    learning: '학습',
    skill: '스킬',
    social: '소셜',
    creative: '창작',
  }
  return categoryMap[category] || '기타'
}

const formatDueDate = (date) => {
  const now = new Date()
  const dueDate = new Date(date)
  const diffTime = dueDate - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return '기한 만료'
  } else if (diffDays === 0) {
    return '오늘 마감'
  } else if (diffDays === 1) {
    return '내일 마감'
  } else {
    return `${diffDays}일 남음`
  }
}
</script>

<style scoped>
.quest-item {
  background-color: var(--card-color);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  position: relative;
  overflow: hidden;
}

.quest-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.quest-item.status-pending {
  border-left-color: #6b7280;
}

.quest-item.status-in-progress {
  border-left-color: var(--primary-color);
}

.quest-item.status-completed {
  border-left-color: #22c55e;
  opacity: 0.9;
}

.quest-item.status-failed {
  border-left-color: #ef4444;
}

.quest-item.difficulty-easy::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 30px 30px 0;
  border-color: transparent #22c55e transparent transparent;
}

.quest-item.difficulty-medium::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 30px 30px 0;
  border-color: transparent #f59e0b transparent transparent;
}

.quest-item.difficulty-hard::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 30px 30px 0;
  border-color: transparent #ef4444 transparent transparent;
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
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.status-pending {
  background-color: #6b7280;
}

.status-indicator.status-in-progress {
  background-color: var(--primary-color);
}

.status-indicator.status-completed {
  background-color: #22c55e;
}

.status-indicator.status-failed {
  background-color: #ef4444;
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
  margin-bottom: 1.5rem;
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.quest-category,
.quest-xp {
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

.category-icon,
.xp-icon,
.date-icon {
  width: 16px;
  height: 16px;
}

.quest-progress {
  margin-bottom: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.progress-info span:first-child {
  color: var(--text-secondary);
}

.progress-info span:last-child {
  color: var(--text-primary);
  font-weight: 600;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background-color: var(--border-color);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
  transition: width 0.3s ease;
  border-radius: 3px;
}

.quest-due-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.quest-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
