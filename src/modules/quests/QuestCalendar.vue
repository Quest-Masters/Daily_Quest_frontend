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
import { Calendar as CalendarIcon, Grid3X3, Clock, Target, Sparkles } from 'lucide-vue-next'
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
  { value: 'dot', label: '점', icon: Sparkles },
])

const statusLegend = ref([
  { key: 'pending', label: '대기중', class: 'status-pending' },
  { key: 'in-progress', label: '진행중', class: 'status-in-progress' },
  { key: 'completed', label: '완료', class: 'status-completed' },
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
    .filter((quest) => {
      return quest.dueDate && isValidDate(new Date(quest.dueDate))
    })
    .map((quest) => {
      const startDate = quest.createdAt ? new Date(quest.createdAt) : new Date()
      const dueDate = new Date(quest.dueDate)

      // 타임존 문제를 피하기 위해 로컬 날짜로 변환
      const localStartDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
      )
      const localDueDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())

      return {
        id: quest.id,
        title: quest.title,
        date: localStartDate.toISOString().split('T')[0],
        startDate: localStartDate.toISOString().split('T')[0],
        dueDate: localDueDate.toISOString().split('T')[0],
        type: quest.status === 'completed' ? 'completed' : 'quest',
        status: quest.status,
        category: quest.category,
        xp: quest.xp || 50,
        difficulty: quest.difficulty,
        description: quest.description,
      }
    })
})

const selectedDateQuests = computed(() => {
  if (!selectedDate.value) return []

  // 선택된 날짜를 YYYY-MM-DD 형식으로 변환 (타임존 문제 해결)
  const selectedDateObj = new Date(selectedDate.value)
  const localSelectedDate = new Date(
    selectedDateObj.getFullYear(),
    selectedDateObj.getMonth(),
    selectedDateObj.getDate(),
  )
  const selectedDateStr = localSelectedDate.toISOString().split('T')[0]

  console.log('선택된 날짜:', selectedDateStr)
  console.log(
    '퀘스트 목록:',
    questEvents.value.map((q) => ({ title: q.title, dueDate: q.dueDate })),
  )

  // 선택된 날짜가 마감일인 퀘스트만 필터링
  const filteredQuests = questEvents.value.filter((quest) => {
    return quest.dueDate === selectedDateStr
  })

  console.log('필터된 퀘스트:', filteredQuests)
  return filteredQuests
})

const onDateSelected = (dateObj) => {
  selectedDate.value = dateObj.date
  // 항상 모달을 열어서 해당 날짜의 퀘스트 확인
  showQuestModal.value = true
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
  max-width: 950px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  background-color: var(--background-color);
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.page-header h1 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.page-header p {
  color: var(--text-secondary);
}

.calendar-controls {
  background: linear-gradient(135deg, rgba(139, 195, 74, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--primary-light);
  box-shadow: 0 6px 24px rgba(139, 195, 74, 0.08);
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
  box-shadow: 0 8px 25px rgba(139, 195, 74, 0.3);
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
  background: linear-gradient(135deg, var(--text-secondary), #9ca3af);
}

.legend-indicator.status-in-progress {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  animation: legendPulse 2s ease-in-out infinite;
}

.legend-indicator.status-completed {
  background: linear-gradient(135deg, var(--success-color), #16a34a);
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
  0%,
  100% {
    transform: scale(1);
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.2),
      0 0 0 0 rgba(139, 195, 74, 0.7);
  }
  50% {
    transform: scale(1.1);
    box-shadow:
      0 4px 8px rgba(0, 0, 0, 0.3),
      0 0 0 8px rgba(139, 195, 74, 0);
  }
}

@keyframes floatingGlow {
  0%,
  100% {
    box-shadow: 0 8px 32px rgba(139, 195, 74, 0.1);
    transform: translateY(0px);
  }
  50% {
    box-shadow: 0 12px 40px rgba(139, 195, 74, 0.2);
    transform: translateY(-2px);
  }
}

/* Large Desktop */
@media (min-width: 1440px) {
  .quest-calendar-page {
    max-width: 1400px;
    padding: 3rem 1.5rem;
  }

  .page-header h1 {
    font-size: 3rem;
  }

  .page-header p {
    font-size: 1.125rem;
  }

  .calendar-controls {
    padding: 2rem;
    margin-bottom: 2.5rem;
  }

  .mode-button {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }

  .legend-item {
    padding: 0.75rem 1.25rem;
    font-size: 1rem;
  }
}

/* Desktop */
@media (min-width: 1024px) and (max-width: 1439px) {
  .quest-calendar-page {
    max-width: 1200px;
    padding: 2.5rem 1.25rem;
  }

  .page-header h1 {
    font-size: 2.5rem;
  }

  .calendar-controls {
    padding: 1.75rem;
    margin-bottom: 2.25rem;
  }
}

/* Tablet Landscape */
@media (min-width: 768px) and (max-width: 1023px) {
  .quest-calendar-page {
    padding: 2rem 1rem;
  }

  .page-header {
    margin-bottom: 1.5rem;
  }

  .page-header h1 {
    font-size: 2.25rem;
  }

  .page-header p {
    font-size: 1rem;
  }

  .calendar-controls {
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .view-controls {
    gap: 1.25rem;
    margin-bottom: 1.25rem;
  }

  .mode-button {
    padding: 0.6rem 1.25rem;
    font-size: 0.9rem;
  }

  .button-icon {
    width: 0.9rem;
    height: 0.9rem;
  }

  .legend {
    gap: 1.5rem;
    padding: 0.875rem;
  }

  .legend-item {
    padding: 0.6rem 1rem;
    font-size: 0.875rem;
  }
}

/* Tablet Portrait */
@media (min-width: 481px) and (max-width: 767px) {
  .quest-calendar-page {
    padding: 1.5rem 0.875rem;
  }

  .page-header {
    margin-bottom: 1.25rem;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .page-header p {
    font-size: 0.9rem;
  }

  .calendar-controls {
    padding: 1.25rem;
    margin-bottom: 1.75rem;
  }

  .view-controls {
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .view-toggle {
    justify-content: center;
    gap: 0.375rem;
  }

  .mode-button {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }

  .button-icon {
    width: 0.875rem;
    height: 0.875rem;
  }

  .legend {
    gap: 1.25rem;
    padding: 0.75rem;
  }

  .legend-item {
    padding: 0.5rem 0.875rem;
    font-size: 0.8rem;
  }

  .legend-indicator {
    width: 14px;
    height: 14px;
  }
}

/* Mobile */
@media (max-width: 480px) {
  .quest-calendar-page {
    padding: 1rem 0.75rem;
  }

  .page-header {
    margin-bottom: 1rem;
  }

  .page-header h1 {
    font-size: 1.75rem;
  }

  .page-header p {
    font-size: 0.85rem;
  }

  .calendar-controls {
    padding: 1rem;
    margin-bottom: 1.5rem;
    border-radius: 12px;
  }

  .view-controls {
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 0.875rem;
  }

  .view-toggle {
    gap: 0.25rem;
    padding: 0.375rem;
    border-radius: 8px;
  }

  .mode-button {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    border-radius: 6px;
  }

  .button-icon {
    width: 0.75rem;
    height: 0.75rem;
  }

  .legend {
    flex-direction: column;
    gap: 0.625rem;
    padding: 0.625rem;
    border-radius: 8px;
  }

  .legend-item {
    justify-content: center;
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
    border-radius: 6px;
  }

  .legend-indicator {
    width: 12px;
    height: 12px;
  }
}

/* Extra Small Mobile */
@media (max-width: 360px) {
  .quest-calendar-page {
    padding: 0.875rem 0.5rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .page-header p {
    font-size: 0.8rem;
  }

  .calendar-controls {
    padding: 0.875rem;
    margin-bottom: 1.25rem;
  }

  .mode-button {
    padding: 0.4rem 0.6rem;
    font-size: 0.7rem;
  }

  .legend-item {
    padding: 0.3rem 0.6rem;
    font-size: 0.7rem;
  }

  .legend-indicator {
    width: 10px;
    height: 10px;
  }
}
</style>
