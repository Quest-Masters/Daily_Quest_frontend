<template>
  <div class="quest-calendar-page">
    <div class="page-header">
      <h1>퀘스트 캘린더</h1>
      <p>모험의 여정을 기록하고 추적하세요</p>
    </div>

    <div class="calendar-controls">
      <div class="view-toggle">
        <base-button
          :variant="showBars ? 'primary' : 'secondary'"
          @click="showBars = !showBars"
          size="small"
        >
          <BarChart3 class="button-icon" />
          {{ showBars ? '막대 보기' : '점 보기' }}
        </base-button>
      </div>

      <div class="legend" v-if="showBars">
        <div class="legend-item">
          <div class="legend-bar pending"></div>
          <span>대기중</span>
        </div>
        <div class="legend-item">
          <div class="legend-bar in-progress"></div>
          <span>진행중</span>
        </div>
        <div class="legend-item">
          <div class="legend-bar completed"></div>
          <span>완료</span>
        </div>
      </div>
    </div>

    <div class="calendar-container">
      <Calendar
        :events="questEvents"
        :selected-date="selectedDate"
        :show-quest-bars="showBars"
        @date-selected="onDateSelected"
        @month-changed="onMonthChanged"
      />
    </div>

    <QuestListModal
      :visible="showQuestModal"
      :date="selectedDate"
      :quests="selectedDateQuests"
      @close="showQuestModal = false"
      @quest-selected="goToQuestDetail"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BarChart3 } from 'lucide-vue-next'
import Calendar from './Calendar.vue'
import QuestListModal from './QuestListModal.vue'
import BaseButton from '@/components/BaseSetting/BaseButton.vue'
import axios from 'axios'

const router = useRouter()
const selectedDate = ref(new Date())
const showQuestModal = ref(false)
const showBars = ref(true)
const quests = ref([])

const isValidDate = (d) => d instanceof Date && !isNaN(d.getTime())

onMounted(async () => {
  try {
    const res = await axios.get('/api/quests/list', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    console.log(res)

    quests.value = res.data.map((q) => ({
      ...q,
      startDate: isValidDate(new Date(q.createdAt)) ? new Date(q.createdAt) : null,
      dueDate: isValidDate(new Date(q.dueDate)) ? new Date(q.dueDate) : null,
    }))
  } catch (err) {
    console.error('퀘스트 로딩 실패:', err)
  }
})

const questEvents = computed(() => {
  return quests.value
    .filter((quest) => isValidDate(quest.startDate) && isValidDate(quest.dueDate))
    .map((quest) => ({
      id: quest.id,
      title: quest.title,
      date: quest.startDate.toISOString().split('T')[0],
      startDate: quest.startDate.toISOString().split('T')[0],
      dueDate: quest.dueDate.toISOString().split('T')[0],
      type: quest.status === 'completed' ? 'completed' : 'quest',
      status: quest.status,
      category: quest.category,
      xp: quest.xp,
      difficulty: quest.difficulty,
      description: quest.description,
    }))
})

const selectedDateQuests = computed(() => {
  if (!selectedDate.value) return []

  const dateString = selectedDate.value.toISOString().split('T')[0]
  return questEvents.value.filter((quest) => {
    const startDate = new Date(quest.startDate)
    const endDate = new Date(quest.dueDate)
    const selectedDateObj = new Date(dateString)

    return selectedDateObj >= startDate && selectedDateObj <= endDate
  })
})

const onDateSelected = (dateObj) => {
  selectedDate.value = dateObj.date
  if (dateObj.hasEvents) {
    showQuestModal.value = true
  }
}

const onMonthChanged = (date) => {
  console.log('Month changed:', date)
}

const goToQuestDetail = (questId) => {
  router.push(`/quest/${questId}`)
  showQuestModal.value = false
}
</script>

<style scoped>
.quest-calendar-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.page-header p {
  color: var(--text-secondary);
}

.calendar-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.view-toggle .button-icon {
  width: 1rem;
  height: 1rem;
}

.legend {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.legend-bar {
  width: 20px;
  height: 12px;
  border-radius: 6px;
}

.legend-bar.pending {
  background-color: #6b7280;
  opacity: 0.7;
}

.legend-bar.in-progress {
  background: linear-gradient(45deg, #8fd694 0%, rgba(255, 255, 255, 0.2) 50%, #8fd694 100%);
  animation: progressShimmer 2s ease-in-out infinite;
}

.legend-bar.completed {
  background-color: #22c55e;
  opacity: 0.8;
}

.calendar-container {
  margin-bottom: 2rem;
}

@keyframes progressShimmer {
  0%,
  100% {
    background-position: -100% 0;
  }
  50% {
    background-position: 100% 0;
  }
}

@media (max-width: 640px) {
  .calendar-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .legend {
    justify-content: center;
  }
}
</style>
