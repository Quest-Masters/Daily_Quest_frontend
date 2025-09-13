<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal">
      <div class="modal-header">
        <div class="header-content">
          <h2>{{ formatDate(date) }} 마감 퀘스트</h2>
          <p class="header-subtitle">오늘 마감되는 {{ quests.length }}개의 퀘스트</p>
        </div>
        <button class="close-button" @click="close">&times;</button>
      </div>

      <div class="modal-body">
        <div v-if="quests.length === 0" class="empty-state">
          <div class="empty-icon">📅</div>
          <h3>마감되는 퀘스트가 없습니다</h3>
          <p>오늘은 여유로운 하루를 보내세요!</p>
        </div>

        <div v-else class="quest-list">
          <div
            v-for="quest in quests"
            :key="quest.id"
            :class="['quest-item', `status-${quest.status}`, `priority-${getPriority(quest)}`]"
            @click="select(quest.id)"
          >
            <div class="quest-header">
              <div class="quest-icon">
                <component :is="getCategoryIcon(quest.category)" class="category-icon" />
              </div>
              <div class="quest-badges">
                <span :class="['status-badge', `status-${quest.status}`]">
                  {{ getStatusText(quest.status) }}
                </span>
                <span class="priority-badge" v-if="getPriority(quest) === 'high'"> 🔥 긴급 </span>
              </div>
            </div>

            <div class="quest-content">
              <h3 class="quest-title">{{ quest.title }}</h3>
              <p class="quest-description">{{ quest.description }}</p>

              <div class="quest-meta">
                <div class="meta-item">
                  <span class="meta-label">카테고리:</span>
                  <span class="meta-value">{{ getCategoryText(quest.category) }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">난이도:</span>
                  <span :class="['difficulty-badge', `difficulty-${quest.difficulty}`]">
                    {{ getDifficultyText(quest.difficulty) }}
                  </span>
                </div>
                <div class="meta-item xp-item">
                  <span class="meta-label">보상:</span>
                  <span class="xp-value">{{ quest.xp }} XP</span>
                </div>
              </div>
            </div>

            <div class="quest-action">
              <div class="deadline-indicator">
                <span class="deadline-text">오늘 마감</span>
                <div
                  :class="['deadline-dot', quest.status === 'completed' ? 'completed' : 'pending']"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Dumbbell, BookOpen, Code, Users, Palette, Home, Target } from 'lucide-vue-next'

const props = defineProps({
  visible: Boolean,
  date: Date,
  quests: Array,
})

const emit = defineEmits(['close', 'quest-selected'])

const close = () => emit('close')
const select = (questId) => emit('quest-selected', questId)

const formatDate = (date) => {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '대기중',
    'in-progress': '진행중',
    completed: '완료',
    failed: '실패',
  }
  return statusMap[status] || status
}

const getCategoryText = (category) => {
  const categoryMap = {
    health: '건강',
    learning: '학습',
    skill: '스킬',
    social: '소셜',
    creative: '창작',
    life: '생활',
  }
  return categoryMap[category] || '기타'
}

const getDifficultyText = (difficulty) => {
  const difficultyMap = {
    easy: '쉬움',
    medium: '보통',
    hard: '어려움',
  }
  return difficultyMap[difficulty] || '보통'
}

const getPriority = (quest) => {
  const xp = quest.xp || 0
  if (xp >= 150) return 'high'
  if (xp >= 100) return 'medium'
  return 'low'
}

const getCategoryIcon = (category) => {
  const iconMap = {
    health: Dumbbell,
    learning: BookOpen,
    skill: Code,
    social: Users,
    creative: Palette,
    life: Home,
    default: Target,
  }
  return iconMap[category] || iconMap.default
}
</script>

<style scoped>
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
  padding: 1rem;
}

.modal {
  background-color: var(--card-background);
  border-radius: 16px;
  width: 100%;
  max-width: 700px;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid var(--border-color);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
}

.header-content h2 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.header-subtitle {
  margin: 0;
  font-size: 0.875rem;
  opacity: 0.9;
}

.close-button {
  background: none;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  color: white;
  font-size: 1.5rem;
  transition: all 0.2s;
  line-height: 1;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.modal-body {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
  background-color: var(--background-color);
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-size: 1.25rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

.quest-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.quest-item {
  background-color: var(--card-background);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.quest-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color, #ffd166));
}

.quest-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color);
}

.quest-item.status-completed {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  border-color: #22c55e;
}

.quest-item.status-completed::before {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

.quest-item.priority-high {
  border-color: #ef4444;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.quest-item.priority-high::before {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.quest-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.quest-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--primary-light);
  border-radius: 10px;
}

.category-icon {
  width: 20px;
  height: 20px;
  color: var(--primary-color);
}

.quest-badges {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.status-pending {
  background-color: #f3f4f6;
  color: #6b7280;
}

.status-badge.status-in-progress {
  background-color: #dbeafe;
  color: #2563eb;
}

.status-badge.status-completed {
  background-color: #dcfce7;
  color: #16a34a;
}

.status-badge.status-failed {
  background-color: #fee2e2;
  color: #dc2626;
}

.priority-badge {
  padding: 0.25rem 0.5rem;
  background-color: #fee2e2;
  color: #dc2626;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meta-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-value {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 500;
}

.difficulty-badge {
  padding: 0.125rem 0.5rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  align-self: flex-start;
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

.xp-item {
  background-color: var(--primary-light);
  padding: 0.5rem;
  border-radius: 8px;
}

.xp-value {
  color: var(--primary-color);
  font-weight: 700;
  font-size: 0.875rem;
}

.quest-action {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.deadline-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--background-color);
  border-radius: 20px;
  border: 1px solid var(--border-color);
}

.deadline-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.deadline-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.deadline-dot.pending {
  background-color: #ef4444;
}

.deadline-dot.completed {
  background-color: #22c55e;
  animation: none;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .modal {
    margin: 0.5rem;
    max-height: 90vh;
  }

  .modal-header {
    padding: 1.5rem;
  }

  .header-content h2 {
    font-size: 1.25rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .quest-item {
    padding: 1rem;
  }

  .quest-meta {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .meta-item {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .quest-header {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .quest-badges {
    align-self: stretch;
    justify-content: space-between;
  }

  .deadline-indicator {
    align-self: stretch;
    justify-content: center;
  }
}
</style>
