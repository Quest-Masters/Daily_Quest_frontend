<template>
  <div class="quest-board-page">
    <div class="page-header">
      <div class="header-content">
        <h1>퀘스트 보드</h1>
        <p>모험을 시작하고 경험치를 획득하세요!</p>
      </div>
      <base-button variant="primary" @click="showCreateModal = true">
        <Sparkles class="button-icon" />
        AI 퀘스트 생성
      </base-button>
    </div>

    <div class="quest-stats">
      <div class="stat-card">
        <h3>진행 중인 퀘스트</h3>
        <div class="stat-value">{{ activeQuests.length }}</div>
      </div>
      <div class="stat-card">
        <h3>완료된 퀘스트</h3>
        <div class="stat-value">{{ completedQuests.length }}</div>
      </div>
      <div class="stat-card">
        <h3>총 획득 XP</h3>
        <div class="stat-value">{{ totalXP }}</div>
      </div>
      <div class="stat-card">
        <h3>성공률</h3>
        <div class="stat-value">{{ successRate }}%</div>
      </div>
    </div>

    <div class="quest-filters">
      <div class="filter-group">
        <label>상태</label>
        <select v-model="selectedStatus" class="filter-select">
          <option value="">전체</option>
          <option value="pending">대기중</option>
          <option value="in-progress">진행중</option>
          <option value="completed">완료</option>
          <option value="failed">실패</option>
        </select>
      </div>

      <div class="filter-group">
        <label>카테고리</label>
        <select v-model="selectedCategory" class="filter-select">
          <option value="">전체</option>
          <option value="health">건강</option>
          <option value="learning">학습</option>
          <option value="skill">스킬</option>
          <option value="social">소셜</option>
          <option value="creative">창작</option>
        </select>
      </div>

      <div class="filter-group">
        <label>난이도</label>
        <select v-model="selectedDifficulty" class="filter-select">
          <option value="">전체</option>
          <option value="easy">쉬움</option>
          <option value="medium">보통</option>
          <option value="hard">어려움</option>
        </select>
      </div>

      <div class="filter-group">
        <label>날짜</label>
        <input type="date" v-model="selectedDate" class="filter-select filter-btn" />
        <base-button size="small" variant="secondary" @click="selectedDate = ''">
          전체 날짜
        </base-button>
      </div>
    </div>

    <div class="quest-grid">
      <quest-item
        v-for="quest in filteredQuests"
        :key="quest.id"
        :quest="quest"
        @quest-click="goToQuestDetail"
        @quest-start="startQuest"
        @quest-complete="completeQuest"
      />
    </div>

    <div v-if="filteredQuests.length === 0" class="no-quests">
      <Sword class="icon" />
      <h3>퀘스트가 없습니다</h3>
      <p>새로운 퀘스트를 생성하여 모험을 시작해보세요!</p>
      <base-button variant="primary" @click="showCreateModal = true">
        <Sparkles class="button-icon" />
        첫 퀘스트 만들기
      </base-button>
    </div>

    <quest-create-modal
      :visible="showCreateModal"
      @close="showCreateModal = false"
      @quest-created="onQuestCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { Sword, Sparkles } from 'lucide-vue-next'
import BaseButton from '@/components/BaseSetting/BaseButton.vue'
import QuestItem from './QuestItem.vue'
import QuestCreateModal from './AiQuestGenerator.vue'

const router = useRouter()
const showCreateModal = ref(false)
const quests = ref([])

const selectedStatus = ref('')
const selectedCategory = ref('')
const selectedDifficulty = ref('')
const selectedDate = ref(new Date().toISOString().substring(0, 10))

const fetchQuests = async () => {
  try {
    const res = await axios.get('/api/quests/list', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    quests.value = res.data.map((q) => ({
      ...q,
      difficulty: q.difficulty || (q.xp < 30 ? 'easy' : q.xp <= 40 ? 'medium' : 'hard'),
      progress: q.progress ?? 0,
      dueDate: new Date(q.dueDate),
    }))
  } catch (err) {
    console.error('퀘스트 불러오기 실패:', err)
  }
}

onMounted(fetchQuests)

const dateMatches = (quest) => {
  if (!selectedDate.value) return true
  const selected = new Date(selectedDate.value)
  const questDate = new Date(quest.dueDate)
  return (
    selected.getFullYear() === questDate.getFullYear() &&
    selected.getMonth() === questDate.getMonth() &&
    selected.getDate() === questDate.getDate()
  )
}

const filteredQuests = computed(() => {
  return quests.value.filter((quest) => {
    if (selectedStatus.value && quest.status !== selectedStatus.value) return false
    if (selectedCategory.value && quest.category !== selectedCategory.value) return false
    if (selectedDifficulty.value && quest.difficulty !== selectedDifficulty.value) return false
    if (!dateMatches(quest)) return false
    return true
  })
})

const activeQuests = computed(() =>
  quests.value.filter(
    (quest) => dateMatches(quest) && (quest.status === 'in-progress' || quest.status === 'pending'),
  ),
)

const completedQuests = computed(() =>
  quests.value.filter((quest) => dateMatches(quest) && quest.status === 'completed'),
)

const totalXP = computed(() =>
  completedQuests.value.reduce((total, quest) => total + (quest.xp || 0), 0),
)

const successRate = computed(() => {
  const relevantQuests = quests.value.filter(dateMatches)
  const completed = completedQuests.value.length
  const total = relevantQuests.length
  return total > 0 ? Math.round((completed / total) * 100) : 0
})

const onQuestCreated = () => {
  showCreateModal.value = false
  fetchQuests()
}

const goToQuestDetail = (questId) => {
  router.push(`/quest/${questId}`)
}

const startQuest = (questId) => {
  const quest = quests.value.find((q) => q.id === questId)
  if (quest) quest.status = 'in-progress'
}

const completeQuest = (questId) => {
  const quest = quests.value.find((q) => q.id === questId)
  if (quest) {
    quest.status = 'completed'
    quest.progress = 100
  }
}
</script>

<style scoped>
.quest-board-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-content h1 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.header-content p {
  color: var(--text-secondary);
  margin: 0;
}

.button-icon {
  width: 1rem;
  height: 1rem;
}

.quest-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: var(--card-background);
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
}

.quest-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-group {
  display: block;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--background-color);
  color: var(--text-primary);
  min-width: 120px;
}

.filter-btn {
  margin: 0 1rem 0 0;
}

.quest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.no-quests {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.no-quests .icon {
  width: 64px;
  height: 64px;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-quests h3 {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}
</style>
