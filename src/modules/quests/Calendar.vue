<template>
  <div class="calendar">
    <div class="calendar-header">
      <button @click="previousMonth" class="nav-button">
        <ChevronLeft />
      </button>
      <h2 class="calendar-title">{{ currentMonthYear }}</h2>
      <button @click="nextMonth" class="nav-button">
        <ChevronRight />
      </button>
    </div>

    <div class="calendar-grid">
      <div class="calendar-weekdays">
        <div v-for="day in weekdays" :key="day" class="weekday">
          {{ day }}
        </div>
      </div>

      <div class="calendar-days">
        <div
          v-for="date in calendarDates"
          :key="date.key"
          :class="[
            'calendar-day',
            {
              'other-month': !date.isCurrentMonth,
              today: date.isToday,
              selected: date.isSelected,
              'has-events': date.hasEvents,
            },
          ]"
          @click="selectDate(date)"
        >
          <span class="day-number">{{ date.day }}</span>

          <!-- 마감일 보기 -->
          <div v-if="viewMode === 'deadline' && date.deadlineQuests.length" class="deadline-quests">
            <div
              v-for="quest in date.deadlineQuests.slice(0, 2)"
              :key="quest.id"
              :class="['deadline-quest', `status-${quest.status}`, `priority-${quest.priority}`]"
              :title="`${quest.title} (마감: ${quest.status === 'completed' ? '완료' : '오늘'})`"
            >
              <div class="quest-icon">
                <component :is="getCategoryIcon(quest.category)" class="category-icon" />
              </div>
              <div class="quest-info">
                <span class="quest-title-short">{{ quest.shortTitle }}</span>
                <span class="quest-xp">{{ quest.xp }}XP</span>
              </div>
              <div :class="['status-indicator', `status-${quest.status}`]"></div>
            </div>
            <div v-if="date.deadlineQuests.length > 2" class="more-quests">
              +{{ date.deadlineQuests.length - 2 }}개
            </div>
          </div>

          <!-- 카드 보기 -->
          <div v-else-if="viewMode === 'card' && date.questCards.length" class="quest-cards">
            <div
              v-for="quest in date.questCards.slice(0, 1)"
              :key="quest.id"
              :class="['quest-card', `status-${quest.status}`]"
              :title="quest.title"
            >
              <div class="card-header">
                <component :is="getCategoryIcon(quest.category)" class="card-icon" />
                <span class="card-xp">{{ quest.xp }}</span>
              </div>
              <div class="card-title">{{ quest.shortTitle }}</div>
              <div class="card-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: quest.progress + '%' }"></div>
                </div>
              </div>
            </div>
            <div v-if="date.questCards.length > 1" class="more-cards">
              +{{ date.questCards.length - 1 }}
            </div>
          </div>

          <!-- 아이콘 보기 -->
          <div v-else-if="viewMode === 'icon' && date.iconQuests.length" class="icon-quests">
            <div
              v-for="quest in date.iconQuests.slice(0, 4)"
              :key="quest.id"
              :class="['quest-icon-item', `status-${quest.status}`]"
              :title="`${quest.title} (${getStatusText(quest.status)})`"
            >
              <component :is="getCategoryIcon(quest.category)" class="quest-icon-svg" />
              <div :class="['icon-status', `status-${quest.status}`]"></div>
            </div>
            <div v-if="date.iconQuests.length > 4" class="more-icons">
              +{{ date.iconQuests.length - 4 }}
            </div>
          </div>

          <!-- 타임라인 보기 -->
          <div
            v-else-if="viewMode === 'timeline' && date.timelineQuests.length"
            class="timeline-quests"
          >
            <div
              v-for="quest in date.timelineQuests.slice(0, 3)"
              :key="quest.id"
              :class="['timeline-quest', quest.timelineType, `status-${quest.status}`]"
              :title="`${quest.title} (${quest.timelineType === 'start' ? '시작' : '마감'})`"
            >
              <div class="timeline-marker"></div>
              <span class="timeline-title">{{ quest.shortTitle }}</span>
            </div>
          </div>

          <!-- 기본 점 보기 -->
          <div v-else-if="viewMode === 'dot' && date.events.length > 0" class="event-indicators">
            <div
              v-for="event in date.events.slice(0, 3)"
              :key="event.id"
              :class="['event-dot', `event-${event.type || event.status}`]"
            ></div>
            <span v-if="date.events.length > 3" class="more-events">
              +{{ date.events.length - 3 }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  BookOpen,
  Code,
  Users,
  Palette,
  Home,
  Target,
  Clock,
} from 'lucide-vue-next'

const props = defineProps({
  events: {
    type: Array,
    default: () => [],
  },
  selectedDate: {
    type: Date,
    default: () => new Date(),
  },
  viewMode: {
    type: String,
    default: 'deadline', // deadline, card, icon, timeline, dot
    validator: (value) => ['deadline', 'card', 'icon', 'timeline', 'dot'].includes(value),
  },
})

const emit = defineEmits(['date-selected', 'month-changed'])

const currentDate = ref(new Date())
const selected = ref(props.selectedDate)

const weekdays = ['일', '월', '화', '수', '목', '금', '토']

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
  })
})

const isValidDate = (date) => date instanceof Date && !isNaN(date.getTime())

const calendarDates = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dates = []

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    date.setHours(0, 0, 0, 0)

    const dateEvents = props.events.filter((event) => {
      const eventDate = new Date(event.date)
      eventDate.setHours(0, 0, 0, 0)
      return isValidDate(eventDate) && eventDate.getTime() === date.getTime()
    })

    // 각 보기 모드별 데이터 계산
    const deadlineQuests = calculateDeadlineQuests(date)
    const questCards = calculateQuestCards(date)
    const iconQuests = calculateIconQuests(date)
    const timelineQuests = calculateTimelineQuests(date)

    dates.push({
      key: isValidDate(date) ? date.toISOString() : `${i}`,
      date,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: date.getTime() === today.getTime(),
      isSelected: selected.value && date.getTime() === selected.value.getTime(),
      hasEvents:
        dateEvents.length > 0 ||
        deadlineQuests.length > 0 ||
        questCards.length > 0 ||
        iconQuests.length > 0 ||
        timelineQuests.length > 0,
      events: dateEvents,
      deadlineQuests,
      questCards,
      iconQuests,
      timelineQuests,
    })
  }

  return dates
})

// 마감일 보기: 마감되는 날짜에만 퀘스트 표시
const calculateDeadlineQuests = (currentDate) => {
  const quests = []

  props.events.forEach((event) => {
    if (event.dueDate) {
      const dueDate = new Date(event.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      const current = new Date(currentDate)
      current.setHours(0, 0, 0, 0)

      if (dueDate.getTime() === current.getTime()) {
        quests.push({
          ...event,
          shortTitle:
            event.title && event.title.length > 8
              ? event.title.substring(0, 8) + '...'
              : event.title || '퀘스트',
          priority: calculatePriority(event),
          progress: calculateProgress(event),
        })
      }
    }
  })

  return quests.sort((a, b) => {
    // 우선순위: 미완료 > 완료, 높은 XP > 낮은 XP
    if (a.status !== b.status) {
      if (a.status === 'completed') return 1
      if (b.status === 'completed') return -1
    }
    return (b.xp || 0) - (a.xp || 0)
  })
}

// 카드 보기: 진행 중인 퀘스트를 카드 형태로 표시
const calculateQuestCards = (currentDate) => {
  const cards = []

  props.events.forEach((event) => {
    if (event.startDate && event.dueDate) {
      const startDate = new Date(event.startDate)
      const endDate = new Date(event.dueDate)
      const current = new Date(currentDate)

      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(0, 0, 0, 0)
      current.setHours(0, 0, 0, 0)

      if (current >= startDate && current <= endDate) {
        cards.push({
          ...event,
          shortTitle:
            event.title && event.title.length > 10
              ? event.title.substring(0, 10) + '...'
              : event.title || '퀘스트',
          progress: calculateProgress(event),
        })
      }
    }
  })

  return cards
}

// 아이콘 보기: 카테고리별 아이콘으로 표시
const calculateIconQuests = (currentDate) => {
  const icons = []

  props.events.forEach((event) => {
    if (event.startDate && event.dueDate) {
      const startDate = new Date(event.startDate)
      const endDate = new Date(event.dueDate)
      const current = new Date(currentDate)

      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(0, 0, 0, 0)
      current.setHours(0, 0, 0, 0)

      if (current >= startDate && current <= endDate) {
        icons.push(event)
      }
    }
  })

  return icons
}

// 타임라인 보기: 시작일과 마감일만 표시
const calculateTimelineQuests = (currentDate) => {
  const timeline = []

  props.events.forEach((event) => {
    if (event.startDate && event.dueDate) {
      const startDate = new Date(event.startDate)
      const endDate = new Date(event.dueDate)
      const current = new Date(currentDate)

      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(0, 0, 0, 0)
      current.setHours(0, 0, 0, 0)

      if (current.getTime() === startDate.getTime()) {
        timeline.push({
          ...event,
          timelineType: 'start',
          shortTitle:
            event.title && event.title.length > 6
              ? event.title.substring(0, 6) + '...'
              : event.title || '퀘스트',
        })
      } else if (current.getTime() === endDate.getTime()) {
        timeline.push({
          ...event,
          timelineType: 'end',
          shortTitle:
            event.title && event.title.length > 6
              ? event.title.substring(0, 6) + '...'
              : event.title || '퀘스트',
        })
      }
    }
  })

  return timeline
}

const calculatePriority = (quest) => {
  const xp = quest.xp || 0
  if (xp >= 150) return 'high'
  if (xp >= 100) return 'medium'
  return 'low'
}

const calculateProgress = (quest) => {
  // 실제 구현에서는 API에서 진행률을 가져와야 함
  if (quest.status === 'completed') return 100
  if (quest.status === 'in-progress') return Math.floor(Math.random() * 80) + 20
  return 0
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

const getStatusText = (status) => {
  const statusMap = {
    pending: '대기중',
    'in-progress': '진행중',
    completed: '완료',
    failed: '실패',
  }
  return statusMap[status] || status
}

const selectDate = (dateObj) => {
  selected.value = dateObj.date
  emit('date-selected', dateObj)
}

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  emit('month-changed', currentDate.value)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  emit('month-changed', currentDate.value)
}

watch(
  () => props.selectedDate,
  (newDate) => {
    if (newDate) selected.value = newDate
  },
  { immediate: true },
)
</script>

<style scoped>
.calendar {
  background-color: var(--card-background);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.calendar-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.nav-button {
  background: none;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-button:hover {
  background-color: var(--primary-light);
  color: var(--primary-color);
  transform: scale(1.05);
}

.calendar-grid {
  width: 100%;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 0.5rem;
}

.weekday {
  padding: 0.75rem 0.5rem;
  text-align: center;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.875rem;
  background-color: var(--primary-light);
  border-radius: 6px;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  background-color: var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  padding: 2px;
}

.calendar-day {
  background-color: var(--background-color);
  padding: 0.75rem 0.5rem;
  min-height: 120px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  border: 2px solid transparent;
}

.calendar-day:hover {
  background-color: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.calendar-day.other-month {
  color: var(--text-secondary);
  opacity: 0.4;
  background-color: var(--card-background);
}

.calendar-day.today {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(143, 214, 148, 0.4);
}

.calendar-day.selected {
  background: linear-gradient(135deg, var(--primary-dark), var(--primary-color));
  color: white;
  border-color: var(--primary-dark);
}

.day-number {
  font-weight: 600;
  margin-bottom: 0.5rem;
  align-self: flex-start;
  font-size: 1rem;
  z-index: 10;
}

/* 마감일 보기 스타일 */
.deadline-quests {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.deadline-quest {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  background-color: var(--card-background);
  border-radius: 8px;
  border-left: 3px solid var(--primary-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.deadline-quest:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.deadline-quest.status-completed {
  border-left-color: #22c55e;
  opacity: 0.8;
}

.deadline-quest.status-in-progress {
  border-left-color: var(--primary-color);
}

.deadline-quest.status-pending {
  border-left-color: #6b7280;
}

.deadline-quest.priority-high {
  border-left-width: 4px;
}

.quest-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: var(--primary-light);
  border-radius: 4px;
}

.category-icon {
  width: 12px;
  height: 12px;
  color: var(--primary-color);
}

.quest-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.quest-title-short {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.quest-xp {
  font-size: 0.625rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-indicator.status-completed {
  background-color: #22c55e;
}

.status-indicator.status-in-progress {
  background-color: var(--primary-color);
  animation: pulse 2s infinite;
}

.status-indicator.status-pending {
  background-color: #6b7280;
}

.more-quests {
  font-size: 0.625rem;
  color: var(--text-secondary);
  text-align: center;
  padding: 2px;
  background-color: var(--border-color);
  border-radius: 4px;
}

/* 카드 보기 스타일 */
.quest-cards {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.quest-card {
  background: linear-gradient(135deg, var(--card-background), var(--background-color));
  border-radius: 8px;
  padding: 8px;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.quest-card.status-completed {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
}

.quest-card.status-in-progress {
  background: linear-gradient(135deg, var(--primary-light), rgba(143, 214, 148, 0.3));
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.card-icon {
  width: 14px;
  height: 14px;
  color: var(--primary-color);
}

.card-xp {
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--primary-color);
}

.card-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
}

/* 아이콘 보기 스타일 */
.icon-quests {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  align-content: start;
}

.quest-icon-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: var(--card-background);
  border-radius: 8px;
  border: 2px solid var(--border-color);
  transition: all 0.2s;
}

.quest-icon-item:hover {
  transform: scale(1.1);
}

.quest-icon-svg {
  width: 16px;
  height: 16px;
  color: var(--text-primary);
}

.icon-status {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid white;
}

.icon-status.status-completed {
  background-color: #22c55e;
}

.icon-status.status-in-progress {
  background-color: var(--primary-color);
}

.icon-status.status-pending {
  background-color: #6b7280;
}

/* 타임라인 보기 스타일 */
.timeline-quests {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.timeline-quest {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border-radius: 6px;
  background-color: var(--card-background);
}

.timeline-quest.start {
  border-left: 3px solid #22c55e;
}

.timeline-quest.end {
  border-left: 3px solid #ef4444;
}

.timeline-marker {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.timeline-quest.start .timeline-marker {
  background-color: #22c55e;
}

.timeline-quest.end .timeline-marker {
  background-color: #ef4444;
}

.timeline-title {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 기본 점 보기 스타일 */
.event-indicators {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: auto;
  padding-top: 0.25rem;
}

.event-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.event-pending {
  background-color: #6b7280;
}

.event-in-progress {
  background-color: var(--primary-color);
  animation: dotPulse 2s ease-in-out infinite;
}

.event-completed {
  background-color: #22c55e;
}

.more-events,
.more-cards,
.more-icons {
  font-size: 0.625rem;
  color: var(--text-secondary);
  font-weight: 600;
  background-color: var(--card-background);
  padding: 2px 4px;
  border-radius: 4px;
  text-align: center;
  margin-top: 2px;
}

/* 애니메이션 */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes dotPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .calendar-day {
    min-height: 100px;
    padding: 0.5rem 0.25rem;
  }

  .deadline-quest {
    padding: 4px;
    gap: 4px;
  }

  .quest-title-short {
    font-size: 0.7rem;
  }

  .quest-xp {
    font-size: 0.6rem;
  }
}

@media (max-width: 480px) {
  .calendar-day {
    min-height: 80px;
    padding: 0.25rem;
  }

  .deadline-quest {
    padding: 3px;
  }

  .quest-icon {
    width: 16px;
    height: 16px;
  }

  .category-icon {
    width: 10px;
    height: 10px;
  }
}
</style>
