<template>
  <div class="quest-calendar-page">
    <div class="page-header">
      <h1>퀘스트 캘린더</h1>
      <p>모험의 여정을 기록하고 추적하세요</p>
    </div>

    <div class="calendar-controls">
      <div class="view-controls">
        <div class="view-toggle">
          <base-button
            v-for="mode in viewModes"
            :key="mode.value"
            :variant="currentViewMode === mode.value ? 'primary' : 'secondary'"
            @click="currentViewMode = mode.value"
            size="small"
            class="mode-button"
          >
            <component :is="mode.icon" class="button-icon" />
            {{ mode.label }}
          </base-button>
        </div>
        
      </div>

      <div class="legend" v-if="currentViewMode !== 'dot'">
        <div class="legend-item" v-for="status in statusLegend" :key="status.key">
          <div :class="['legend-indicator', status.class]"></div>
          <span>{{ status.label }}</span>
        </div>
      </div>
    </div>

    <div class="calendar-container" :class="[`mode-${currentViewMode}`]">
      <Calendar
        :events="questEvents"
        :selected-date="selectedDate"
        :view-mode="currentViewMode"
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
import { 
  Calendar as CalendarIcon,
  Grid3X3,
  Clock,
  Target,
  Sparkles,
  Moon,
  Sun,
  Trees,
  Gem,
  Zap
} from 'lucide-vue-next'
import Calendar from './Calendar.vue'
import QuestListModal from './QuestListModal.vue'
import BaseButton from '@/components/BaseSetting/BaseButton.vue'
import axios from 'axios'

const router = useRouter()
const selectedDate = ref(new Date())
const showQuestModal = ref(false)
const currentViewMode = ref('deadline')
const quests = ref([])

const viewModes = ref([
  { value: 'deadline', label: '마감일', icon: Clock },
  { value: 'card', label: '카드', icon: Grid3X3 },
  { value: 'icon', label: '아이콘', icon: Target },
  { value: 'timeline', label: '타임라인', icon: CalendarIcon },
  { value: 'dot', label: '점', icon: Sparkles }
])

const statusLegend = ref([
  { key: 'pending', label: '대기중', class: 'status-pending' },
  { key: 'in-progress', label: '진행중', class: 'status-in-progress' },
  { key: 'completed', label: '완료', class: 'status-completed' }
])

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
  background: linear-gradient(135deg, rgba(143, 214, 148, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(143, 214, 148, 0.2);
  box-shadow: 0 8px 32px rgba(143, 214, 148, 0.1);
}

.view-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
  border-radius: 12px;
  backdrop-filter: blur(5px);
}

.mode-button {
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.mode-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(143, 214, 148, 0.3);
  border-color: var(--primary-color);
}

.mode-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.mode-button:hover::before {
  left: 100%;
}

.button-icon {
  width: 1rem;
  height: 1rem;
  transition: transform 0.3s ease;
}

.mode-button:hover .button-icon {
  transform: scale(1.1) rotate(5deg);
}

.legend {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  backdrop-filter: blur(5px);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.legend-item:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.legend-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.legend-indicator.status-pending {
  background: linear-gradient(135deg, #6b7280, #9ca3af);
}

.legend-indicator.status-in-progress {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  animation: legendPulse 2s ease-in-out infinite;
}

.legend-indicator.status-completed {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  position: relative;
}

.legend-indicator.status-completed::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 10px;
  font-weight: bold;
}

.calendar-container {
  margin-bottom: 2rem;
  transition: all 0.5s ease;
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

@keyframes legendPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 0 0 rgba(143, 214, 148, 0.7);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), 0 0 0 8px rgba(143, 214, 148, 0);
  }
}

@keyframes floatingGlow {
  0%, 100% {
    box-shadow: 0 8px 32px rgba(143, 214, 148, 0.1);
    transform: translateY(0px);
  }
  50% {
    box-shadow: 0 12px 40px rgba(143, 214, 148, 0.2);
    transform: translateY(-2px);
  }
}

@media (max-width: 768px) {
  .calendar-controls {
    padding: 1rem;
  }
  
  .view-controls {
    flex-direction: column;
    gap: 1rem;
  }
  
  .view-toggle,
  .theme-toggle {
    justify-content: center;
  }
  
  .legend {
    gap: 1rem;
  }
  
  .legend-item {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .calendar-controls {
    padding: 0.75rem;
  }
  
  .view-toggle,
  .theme-toggle {
    gap: 0.25rem;
  }
  
  .mode-button,
  .theme-button {
    padding: 0.5rem;
    font-size: 0.75rem;
  }
  
  .legend {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .legend-item {
    justify-content: center;
  }
}
</style>
