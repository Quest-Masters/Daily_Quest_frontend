<template>
  <div class="quest-detail-page" v-if="quest">
    <div class="quest-header">
      <button @click="goBack" class="back-button">
        <ArrowLeft />
        <span>뒤로가기</span>
      </button>

      <div class="quest-status-badge">
        <span :class="['status-indicator', `status-${quest.status}`]"></span>
        {{ getStatusText(quest.status) }}
      </div>
    </div>

    <div class="quest-content">
      <div class="quest-main">
        <div class="quest-title-section">
          <h1>{{ quest.title }}</h1>
          <div class="quest-badges">
            <div :class="['difficulty-badge', `difficulty-${quest.difficulty}`]">
              {{ getDifficultyText(quest.difficulty) }}
            </div>
            <div class="category-badge">
              {{ getCategoryText(quest.category) }}
            </div>
          </div>
        </div>

        <div class="quest-description">
          <h2>퀘스트 설명</h2>
          <p>{{ quest.description }}</p>
        </div>

        <div class="quest-objectives">
          <h2>목표</h2>
          <div class="objectives-list">
            <div
              v-for="(objective, index) in quest.objectives"
              :key="index"
              :class="['objective-item', { completed: objective.completed }]"
            >
              <div class="objective-checkbox" @click="toggleObjective(index)">
                <CheckCircle v-if="objective.completed" class="icon completed" />
                <Circle v-else class="icon" />
              </div>
              <span>{{ objective.text }}</span>
            </div>
          </div>
        </div>

        <div class="quest-progress">
          <h2>진행률</h2>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <p class="progress-text">
            {{ completedObjectives }}/{{ quest.objectives.length }} 완료 ({{ progressPercentage }}%)
          </p>
        </div>
      </div>

      <div class="quest-sidebar">
        <div class="quest-info-card">
          <h3>퀘스트 정보</h3>
          <div class="info-item">
            <span class="info-label">보상 XP</span>
            <span class="info-value">
              <Star class="xp-icon" />
              {{ quest.xp }} XP
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">마감일</span>
            <span class="info-value">{{ formatDate(quest.dueDate) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">생성일</span>
            <span class="info-value">{{ formatDate(quest.createdAt) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">예상 속요시간</span>
            <span class="info-value">{{ quest.estimatedTime }}</span>
          </div>
        </div>

        <div class="quest-actions">
          <base-button
            v-if="quest.status === 'pending'"
            variant="primary"
            block
            @click="startQuest"
          >
            퀘스트 시작
          </base-button>

          <base-button
            v-else-if="quest.status === 'in-progress'"
            variant="primary"
            block
            @click="completeQuest"
            :disabled="!canComplete"
          >
            퀘스트 완료
          </base-button>

          <base-button v-else-if="quest.status === 'completed'" variant="success" block disabled>
            완료됨
          </base-button>

          <base-button variant="secondary" block @click="editQuest" class="edit-button">
            퀘스트 수정
          </base-button>

          <base-button
            v-if="quest.status !== 'completed'"
            variant="destructive"
            block
            @click="deleteQuest"
            class="delete-button"
          >
            퀘스트 삭제
          </base-button>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="loading-state">로딩 중...</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { ArrowLeft, CheckCircle, Circle, Star } from 'lucide-vue-next'
import BaseButton from '@/components/BaseSetting/BaseButton.vue'
import { useUserLoginStore } from '@/modules/user/login/login-store'

const route = useRoute()
const router = useRouter()
const loginStore = useUserLoginStore()

const quest = ref(null)
const questId = route.params.id

const fetchQuest = async () => {
  try {
    const res = await axios.get(`/api/quests/${questId}`, {
      headers: { Authorization: `Bearer ${loginStore.token}` },
    })

    const data = res.data
    const completedCount = (data.objectives || []).filter((obj) => obj.completed === true).length
    const totalCount = data.objectives?.length || 0
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    quest.value = {
      id: data.id,
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      category: data.category,
      status: data.status,
      xp: data.xp,
      dueDate: data.dueDate,
      createdAt: data.createdAt,
      estimatedTime: data.estimatedTime ?? '30분',
      progress,
      objectives: (data.objectives || []).map((obj) =>
        typeof obj === 'string'
          ? { text: obj, completed: data.status === 'completed' }
          : { text: obj.text, completed: obj.completed ?? false },
      ),
    }
  } catch (err) {
    console.error('퀘스트 불러오기 실패:', err)
    if (err.response?.status === 401 || err.response?.status === 403) {
      alert('로그인이 필요합니다. 다시 로그인해주세요.')
      router.push('/login')
    } else {
      alert('퀘스트 정보를 불러오는 데 실패했습니다.')
    }
  }
}

onMounted(() => {
  fetchQuest()
})

const completedObjectives = computed(() => {
  return quest.value?.objectives.filter((obj) => obj.completed).length || 0
})

const progressPercentage = computed(() => {
  const total = quest.value?.objectives.length || 0
  return total ? Math.round((completedObjectives.value / total) * 100) : 0
})

const canComplete = computed(() => {
  return quest.value?.objectives.every((obj) => obj.completed)
})

const goBack = () => {
  router.go(-1)
}

const toggleObjective = async (index) => {
  if (quest.value.status === 'completed') return

  const newStatus = !quest.value.objectives[index].completed
  quest.value.objectives[index].completed = newStatus

  try {
    await axios.patch(
      `/api/quests/${quest.value.id}/objective/${index}`,
      { completed: newStatus },
      { headers: { Authorization: `Bearer ${loginStore.token}` } },
    )
    quest.value.progress = progressPercentage.value
  } catch (err) {
    console.error('목표 상태 업데이트 실패:', err)
    alert('체크 상태를 저장하는 데 실패했습니다.')
  }
}

const startQuest = async () => {
  try {
    await axios.patch(`/api/quests/${quest.value.id}/start`, null, {
      headers: { Authorization: `Bearer ${loginStore.token}` },
    })
    await fetchQuest()
  } catch (err) {
    console.error('퀘스트 시작 실패:', err)
    alert('퀘스트 시작에 실패했습니다.')
  }
}

const completeQuest = async () => {
  if (!canComplete.value) return

  try {
    await axios.patch(`/api/quests/${quest.value.id}/completed`, null, {
      headers: { Authorization: `Bearer ${loginStore.token}` },
    })
    await fetchQuest()
    alert(`퀘스트 완료! ${quest.value.xp} XP를 획득했습니다!`)
    router.push('/quests')
  } catch (err) {
    console.error('퀘스트 완료 실패:', err)
    alert('퀘스트 완료 처리에 실패했습니다.')
  }
}

const deleteQuest = async () => {
  const confirmDelete = confirm('정말 이 퀘스트를 삭제하시겠습니까?')
  if (!confirmDelete) return

  try {
    await axios.delete(`/api/quests/${quest.value.id}`, {
      headers: { Authorization: `Bearer ${loginStore.token}` },
    })
    alert('퀘스트가 삭제되었습니다.')
    router.push('/quests')
  } catch (err) {
    console.error('퀘스트 삭제 실패 : ', err)
    alert('퀘스트 삭제에 실패했습니다.')
  }
}

const editQuest = () => {
  router.push(`/quest/${quest.value.id}/edit`)
}

const getDifficultyText = (difficulty) => {
  const map = { easy: '쉬운', medium: '보통', hard: '어렵음' }
  return map[difficulty] || '보통'
}

const getCategoryText = (category) => {
  const map = {
    health: '건강',
    learning: '학습',
    skill: '스킬',
    social: '소셜',
    creative: '창작',
  }
  return map[category] || '기타'
}

const getStatusText = (status) => {
  const map = {
    pending: '대기중',
    'in-progress': '진행중',
    completed: '완료',
    failed: '실패',
  }
  return map[status] || '대기중'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style scoped>
.quest-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.quest-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.back-button:hover {
  background-color: var(--primary-light);
  color: var(--primary-color);
}

.quest-status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background-color: var(--card-color);
  font-weight: 500;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-pending {
  background-color: #6b7280;
}

.status-in-progress {
  background-color: var(--primary-color);
}

.status-completed {
  background-color: var(--success-color, #22c55e);
}

.status-failed {
  background-color: var(--error-color);
}

.quest-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

@media (max-width: 768px) {
  .quest-content {
    grid-template-columns: 1fr;
  }
}

.quest-main {
  background-color: var(--card-color);
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.quest-title-section {
  margin-bottom: 2rem;
}

.quest-title-section h1 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.quest-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.difficulty-badge,
.category-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
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

.category-badge {
  background-color: var(--primary-light);
  color: var(--primary-color);
}

.quest-description,
.quest-objectives,
.quest-progress {
  margin-bottom: 2rem;
}

.quest-description h2,
.quest-objectives h2,
.quest-progress h2 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.125rem;
}

.quest-description p {
  color: var(--text-secondary);
  line-height: 1.6;
}

.objectives-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.objective-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: var(--background-color);
  border-radius: 6px;
  transition: all 0.2s;
}

.objective-item:hover {
  background-color: var(--primary-light);
}

.objective-item.completed {
  opacity: 0.7;
}

.objective-item.completed span {
  text-decoration: line-through;
}

.objective-checkbox {
  cursor: pointer;
}

.objective-checkbox .icon {
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
}

.objective-checkbox .icon.completed {
  color: var(--primary-color);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
}

.progress-text {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.quest-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.quest-info-card,
.quest-stats {
  background-color: var(--card-color);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.quest-info-card h3,
.quest-stats h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.info-item,
.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.info-item:last-child,
.stat-item:last-child {
  margin-bottom: 0;
}

.info-label,
.stat-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.info-value,
.stat-value {
  color: var(--text-primary);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.xp-icon {
  width: 16px;
  height: 16px;
  color: var(--primary-color);
}

.quest-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.edit-button {
  margin-top: 0.5rem;
}
</style>
