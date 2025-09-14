<template>
  <div class="calendar">
    <div class="calendar-header">
      <button @click="previousMonth" class="nav-button">
        <ChevronLeft class="nav-icon" />
      </button>
      <h2 class="month-title">{{ monthTitle }}</h2>
      <button @click="nextMonth" class="nav-button">
        <ChevronRight class="nav-icon" />
      </button>
    </div>

    <div class="calendar-body">
      <div class="weekdays">
        <div
          v-for="day in weekdays"
          :key="day"
          class="weekday"
        >
          {{ day }}
        </div>
      </div>

      <div class="calendar-grid">
        <div
          v-for="day in calendarDays"
          :key="day.key"
          :class="[
            'calendar-day',
            {
              'other-month': !day.inCurrentMonth,
              'today': day.isToday,
              'selected': day.isSelected,
              'has-events': day.hasEvents,
              'weekend': day.isWeekend
            }
          ]"
          @click="selectDate(day)"
        >
          <div class="day-number">{{ day.date }}</div>

          <div v-if="day.hasEvents" class="events-container">
            <div
              v-for="event in day.events"
              :key="event.id"
              :class="[
                'event-item',
                `event-${event.status}`,
                `view-${viewMode}`
              ]"
              :title="`${event.title} - ${getStatusText(event.status)}`"
            >
              <template v-if="viewMode === 'deadline'">
                <div class="event-deadline">
                  <Clock class="event-icon" />
                  <span class="event-title">{{ event.title }}</span>
                </div>
              </template>

              <template v-else-if="viewMode === 'card'">
                <div class="event-card">
                  <div class="event-card-header">
                    <span class="event-title">{{ event.title }}</span>
                    <div :class="['event-status', `status-${event.status}`]"></div>
                  </div>
                  <div class="event-meta">
                    <span class="event-xp">{{ event.xp }}XP</span>
                    <span class="event-category">{{ getCategoryText(event.category) }}</span>
                  </div>
                </div>
              </template>

              <template v-else-if="viewMode === 'icon'">
                <div class="event-icon-container">
                  <div :class="['event-icon-badge', `status-${event.status}`]">
                    <Target class="event-icon" />
                  </div>
                </div>
              </template>

              <template v-else-if="viewMode === 'timeline'">
                <div class="event-timeline">
                  <div :class="['timeline-bar', `status-${event.status}`]"></div>
                  <span class="timeline-title">{{ event.title }}</span>
                </div>
              </template>

              <template v-else-if="viewMode === 'dot'">
                <div :class="['event-dot', `status-${event.status}`]"></div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ChevronLeft, ChevronRight, Clock, Target } from 'lucide-vue-next'

const props = defineProps({
  events: {
    type: Array,
    default: () => []
  },
  selectedDate: {
    type: Date,
    default: () => new Date()
  },
  viewMode: {
    type: String,
    default: 'deadline'
  }
})

const emit = defineEmits(['date-selected', 'month-changed'])

const currentDate = ref(new Date())
const currentYear = ref(currentDate.value.getFullYear())
const currentMonth = ref(currentDate.value.getMonth())

const weekdays = ['일', '월', '화', '수', '목', '금', '토']

const monthTitle = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long'
  })
})

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startDate = new Date(firstDay)

  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const selectedDate = new Date(props.selectedDate)
  selectedDate.setHours(0, 0, 0, 0)

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)

    // 타임존 문제를 피하기 위해 로컬 날짜로 변환
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const dateStr = localDate.toISOString().split('T')[0]
    const dayEvents = props.events.filter(event => event.dueDate === dateStr)

    const isToday = localDate.getTime() === today.getTime()
    const isSelected = localDate.getTime() === selectedDate.getTime()
    const inCurrentMonth = date.getMonth() === currentMonth.value
    const isWeekend = date.getDay() === 0 || date.getDay() === 6

    days.push({
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      date: date.getDate(),
      fullDate: localDate,
      dateStr,
      inCurrentMonth,
      isToday,
      isSelected,
      hasEvents: dayEvents.length > 0,
      events: dayEvents,
      isWeekend
    })
  }

  return days
})

const selectDate = (day) => {
  emit('date-selected', {
    date: day.fullDate,
    hasEvents: day.hasEvents,
    events: day.events
  })
}

const previousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
  emit('month-changed', new Date(currentYear.value, currentMonth.value))
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
  emit('month-changed', new Date(currentYear.value, currentMonth.value))
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

watch([currentYear, currentMonth], () => {
  emit('month-changed', new Date(currentYear.value, currentMonth.value))
})
</script>

<style scoped>
.calendar {
  background-color: var(--card-color);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.nav-button {
  background-color: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-button:hover {
  background-color: var(--primary-light);
  border-color: var(--primary-color);
}

.nav-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-primary);
}

.month-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0;
}

.calendar-body {
  width: 100%;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 0.5rem;
}

.weekday {
  text-align: center;
  padding: 0.75rem 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.calendar-day {
  background-color: var(--card-color);
  min-height: 120px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}

.calendar-day:hover {
  background-color: var(--primary-light);
}

.calendar-day.other-month {
  opacity: 0.5;
}

.calendar-day.today {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
}

.calendar-day.today .day-number {
  color: white;
  font-weight: 700;
}

.calendar-day.selected {
  background-color: var(--accent-color);
  color: white;
}

.calendar-day.weekend {
  background-color: rgba(255, 152, 0, 0.05);
}

.calendar-day.weekend.today {
  background: linear-gradient(135deg, var(--accent-color), rgba(255, 152, 0, 0.8));
}

.day-number {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  text-align: center;
}

.events-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.event-item {
  border-radius: 4px;
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.event-deadline {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 4px;
}

.event-deadline .event-icon {
  width: 12px;
  height: 12px;
}

.event-deadline .event-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-card {
  padding: 0.5rem;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.event-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.25rem;
}

.event-card .event-title {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.75rem;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.event-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-left: 0.25rem;
}

.event-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.625rem;
  color: var(--text-secondary);
}

.event-xp {
  color: var(--primary-color);
  font-weight: 600;
}

.event-icon-container {
  display: flex;
  justify-content: center;
  padding: 0.25rem;
}

.event-icon-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.event-icon-badge .event-icon {
  width: 12px;
  height: 12px;
  color: white;
}

.event-timeline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem;
}

.timeline-bar {
  width: 4px;
  height: 20px;
  border-radius: 2px;
}

.timeline-title {
  flex: 1;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin: 2px auto;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.status-pending, .event-pending {
  background-color: #6b7280;
}

.status-in-progress, .event-in-progress {
  background-color: var(--primary-color);
}

.status-completed, .event-completed {
  background-color: var(--success-color);
}

.status-failed, .event-failed {
  background-color: var(--error-color);
}

@media (max-width: 768px) {
  .calendar {
    padding: 1rem;
  }

  .calendar-day {
    min-height: 80px;
    padding: 0.25rem;
  }

  .day-number {
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }

  .event-item {
    font-size: 0.625rem;
  }

  .month-title {
    font-size: 1.25rem;
  }

  .nav-icon {
    width: 1rem;
    height: 1rem;
  }
}

@media (max-width: 480px) {
  .calendar-day {
    min-height: 60px;
    padding: 0.125rem;
  }

  .day-number {
    font-size: 0.75rem;
  }

  .weekday {
    padding: 0.5rem 0.25rem;
    font-size: 0.75rem;
  }

  .event-deadline .event-title,
  .timeline-title {
    display: none;
  }

  .event-card .event-title {
    font-size: 0.625rem;
  }
}
</style>