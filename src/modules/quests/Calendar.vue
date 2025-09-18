<template>
  <div class="calendar-container">
    <!-- Header -->
    <div class="calendar-header">
      <div class="star-icon">✦</div>
      <h1 class="calendar-title">QUEST CALENDAR</h1>
    </div>

    <!-- Navigation and Month Display -->
    <div class="calendar-nav">
      <button @click="previousMonth" class="nav-button">
        <ChevronLeft class="nav-icon" />
      </button>

      <div class="month-display">
        <div class="month-text">{{ currentMonthName.toUpperCase() }}</div>
      </div>

      <button @click="nextMonth" class="nav-button">
        <ChevronRight class="nav-icon" />
      </button>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid">
      <!-- Day Headers -->
      <div class="day-headers">
        <div v-for="day in dayHeaders" :key="day" class="day-header">
          {{ day }}
        </div>
      </div>

      <!-- Calendar Days -->
      <div class="calendar-days">
        <div
          v-for="day in calendarDays"
          :key="day.key"
          class="calendar-day"
          :class="{
            'other-month': !day.inCurrentMonth,
            today: day.isToday,
            'has-event': day.hasEvents,
          }"
          @click="selectDate(day)"
        >
          <div class="day-number">{{ day.date }}</div>
          <div v-if="day.hasEvents" class="events-container">
            <!-- Deadline View -->
            <template v-if="viewMode === 'deadline'">
              <div v-for="event in day.events.slice(0, 1)" :key="event.id" class="event-deadline">
                <Clock class="event-icon" />
                <span class="event-title">{{ event.title }}</span>
              </div>
              <div v-if="day.events.length > 1" class="event-more">
                +{{ day.events.length - 1 }}개
              </div>
            </template>

            <!-- Card View -->
            <template v-else-if="viewMode === 'card'">
              <div v-for="event in day.events.slice(0, 1)" :key="event.id" class="event-card">
                <div class="event-card-header">
                  <span class="event-title">{{ event.title }}</span>
                  <div :class="['event-status', `status-${event.status}`]"></div>
                </div>
                <div class="event-meta">
                  <span class="event-xp">{{ event.xp }}XP</span>
                  <span class="event-category">{{ getCategoryText(event.category) }}</span>
                </div>
              </div>
              <div v-if="day.events.length > 1" class="event-more">
                +{{ day.events.length - 1 }}
              </div>
            </template>

            <!-- Icon View -->
            <template v-else-if="viewMode === 'icon'">
              <div class="event-icons">
                <div v-for="event in day.events.slice(0, 3)" :key="event.id" class="event-icon-badge" :class="`status-${event.status}`">
                  <Target class="event-icon" />
                </div>
                <div v-if="day.events.length > 3" class="event-more-icon">
                  +{{ day.events.length - 3 }}
                </div>
              </div>
            </template>

            <!-- Timeline View -->
            <template v-else-if="viewMode === 'timeline'">
              <div v-for="event in day.events.slice(0, 2)" :key="event.id" class="event-timeline">
                <div :class="['timeline-bar', `status-${event.status}`]"></div>
                <span class="timeline-title">{{ event.title }}</span>
              </div>
              <div v-if="day.events.length > 2" class="event-more">
                +{{ day.events.length - 2 }}
              </div>
            </template>

            <!-- Dot View -->
            <template v-else-if="viewMode === 'dot'">
              <div class="event-dots">
                <div v-for="event in day.events.slice(0, 4)" :key="event.id" :class="['event-dot', `status-${event.status}`]"></div>
                <div v-if="day.events.length > 4" class="event-more-dot">
                  +{{ day.events.length - 4 }}
                </div>
              </div>
            </template>
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
    default: () => [],
  },
  selectedDate: {
    type: Date,
    default: () => new Date(),
  },
  viewMode: {
    type: String,
    default: 'deadline',
  },
})

const emit = defineEmits(['date-selected', 'month-changed'])

const currentDate = ref(new Date())
const currentYear = ref(currentDate.value.getFullYear())
const currentMonth = ref(currentDate.value.getMonth())

const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const currentMonthName = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value)
  return date.toLocaleDateString('en-US', { month: 'long' })
})

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startDate = new Date(firstDay)

  // Adjust for Monday start (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = (firstDay.getDay() + 6) % 7 // Convert to Monday = 0
  startDate.setDate(firstDay.getDate() - dayOfWeek)

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
    const dayEvents = props.events.filter((event) => event.dueDate === dateStr)

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
      isWeekend,
    })
  }

  return days
})

const selectDate = (day) => {
  emit('date-selected', {
    date: day.fullDate,
    hasEvents: day.hasEvents,
    events: day.events,
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
    failed: '실패',
  }
  return statusMap[status] || '대기중'
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

watch([currentYear, currentMonth], () => {
  emit('month-changed', new Date(currentYear.value, currentMonth.value))
})
</script>

<style scoped>
.calendar-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem;
  background-color: var(--background-color);
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.star-icon {
  font-size: 1.5rem;
  color: var(--accent-color);
  transform: rotate(45deg);
}

.calendar-title {
  font-size: 2rem;
  font-weight: 400;
  letter-spacing: 0.15em;
  color: var(--text-primary);
  margin: 0;
}

.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  position: relative;
}

.nav-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
  color: var(--text-secondary);
  position: absolute;
}

.nav-button:first-child {
  left: 0;
}

.nav-button:last-child {
  right: 0;
}

.nav-button:hover {
  background-color: var(--primary-light);
}

.nav-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.month-display {
  text-align: center;
}

.month-text {
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--text-primary);
  white-space: nowrap;
}

.calendar-grid {
  margin-left: 0;
}

.day-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.day-header {
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  padding: 0.5rem;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.calendar-day {
  aspect-ratio: 1;
  background-color: var(--card-color);
  border: 2px solid transparent;
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  min-height: 90px;
  padding: 0.5rem 0.375rem;
}

.calendar-day:hover {
  background-color: var(--primary-light);
  transform: translateY(-1px);
}

.calendar-day.other-month {
  opacity: 0.3;
}

.calendar-day.today {
  border-color: var(--text-primary);
  border-width: 2px;
}

.calendar-day.has-event {
  background-color: var(--primary-light);
  color: var(--primary-dark);
  border: 1px solid var(--primary-color);
}

.calendar-day.has-event:hover {
  background-color: var(--primary-color);
  color: white;
}

.day-number {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.375rem;
  align-self: flex-start;
  width: 100%;
  text-align: left;
}

/* Events Container */
.events-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
  width: 100%;
}

/* Common Event Styles */
.event-more {
  font-size: 0.6rem;
  color: var(--text-secondary);
  text-align: center;
  margin-top: 2px;
  font-weight: 600;
}

/* Deadline View */
.event-deadline {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.375rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 4px;
  font-size: 0.7rem;
}

.event-deadline .event-icon {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
}

.event-deadline .event-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

/* Card View */
.event-card {
  padding: 0.375rem;
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-size: 0.65rem;
}

.event-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.25rem;
  gap: 0.25rem;
}

.event-card .event-title {
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.event-status {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.event-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.55rem;
  color: var(--text-secondary);
  gap: 0.25rem;
}

.event-xp {
  color: var(--primary-color);
  font-weight: 600;
}

.event-category {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Icon View */
.event-icons {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  justify-content: center;
  align-items: center;
}

.event-icon-badge {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.event-icon-badge .event-icon {
  width: 8px;
  height: 8px;
  color: white;
}

.event-more-icon {
  font-size: 0.5rem;
  color: var(--text-secondary);
  font-weight: 600;
  min-width: 16px;
  text-align: center;
}

/* Timeline View */
.event-timeline {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.125rem;
}

.timeline-bar {
  width: 3px;
  height: 12px;
  border-radius: 1.5px;
  flex-shrink: 0;
}

.timeline-title {
  flex: 1;
  font-size: 0.65rem;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Dot View */
.event-dots {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  justify-content: center;
  align-items: center;
  padding: 0.25rem;
}

.event-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.event-more-dot {
  font-size: 0.5rem;
  color: var(--text-secondary);
  font-weight: 600;
  margin-left: 2px;
}

/* Status Colors */
.status-pending {
  background-color: var(--text-secondary);
}

.status-in-progress {
  background-color: var(--primary-color);
}

.status-completed {
  background-color: var(--success-color);
}

.status-failed {
  background-color: var(--error-color);
}

/* Large Desktop */
@media (min-width: 1440px) {
  .calendar-container {
    max-width: 1000px;
    padding: 2rem;
  }

  .calendar-day {
    min-height: 110px;
    padding: 0.75rem 0.5rem;
  }

  .day-number {
    font-size: 1.125rem;
    margin-bottom: 0.5rem;
  }

  .events-container {
    gap: 3px;
  }

  .event-deadline {
    padding: 0.3rem 0.4rem;
    font-size: 0.75rem;
  }

  .event-deadline .event-icon {
    width: 12px;
    height: 12px;
  }

  .event-card {
    padding: 0.4rem;
    font-size: 0.7rem;
  }

  .event-icon-badge {
    width: 18px;
    height: 18px;
  }

  .event-icon-badge .event-icon {
    width: 10px;
    height: 10px;
  }

  .timeline-title {
    font-size: 0.7rem;
  }

  .calendar-title {
    font-size: 2.25rem;
  }

  .month-text {
    font-size: 1.875rem;
  }
}

/* Desktop */
@media (min-width: 1024px) and (max-width: 1439px) {
  .calendar-container {
    max-width: 900px;
    padding: 1.75rem;
  }

  .calendar-day {
    min-height: 95px;
    padding: 0.5rem 0.375rem;
  }

  .day-number {
    font-size: 1rem;
  }
}

/* Tablet Landscape */
@media (min-width: 768px) and (max-width: 1023px) {
  .calendar-container {
    max-width: 750px;
    padding: 1.5rem 1.25rem;
  }

  .calendar-header {
    margin-bottom: 1.5rem;
  }

  .calendar-title {
    font-size: 1.875rem;
  }

  .star-icon {
    font-size: 1.375rem;
  }

  .calendar-nav {
    margin-bottom: 1.25rem;
  }

  .month-text {
    font-size: 1.5rem;
  }

  .calendar-day {
    min-height: 80px;
    padding: 0.425rem 0.3rem;
  }

  .day-number {
    font-size: 0.9rem;
    margin-bottom: 0.3rem;
  }

  .event-deadline {
    padding: 0.25rem 0.3rem;
    font-size: 0.65rem;
  }

  .event-deadline .event-icon {
    width: 9px;
    height: 9px;
  }

  .event-card {
    padding: 0.3rem;
    font-size: 0.6rem;
  }

  .event-icon-badge {
    width: 14px;
    height: 14px;
  }

  .event-icon-badge .event-icon {
    width: 8px;
    height: 8px;
  }

  .timeline-title {
    font-size: 0.6rem;
  }

  .event-title {
    margin-bottom: 0.125rem;
  }

  .nav-icon {
    width: 1.125rem;
    height: 1.125rem;
  }
}

/* Tablet Portrait */
@media (min-width: 481px) and (max-width: 767px) {
  .calendar-container {
    padding: 1.25rem 0.875rem;
  }

  .calendar-header {
    margin-bottom: 1.25rem;
  }

  .calendar-title {
    font-size: 1.75rem;
  }

  .star-icon {
    font-size: 1.25rem;
  }

  .calendar-nav {
    margin-bottom: 1rem;
  }

  .month-text {
    font-size: 1.375rem;
  }

  .calendar-day {
    min-height: 70px;
    padding: 0.375rem 0.25rem;
    border-radius: 0.5rem;
  }

  .day-number {
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
  }

  .event-info {
    font-size: 0.6rem;
  }

  .event-title {
    margin-bottom: 0.125rem;
  }

  .event-time {
    font-size: 0.55rem;
  }

  .day-header {
    font-size: 0.75rem;
    padding: 0.3rem;
  }
}

/* Mobile */
@media (max-width: 480px) {
  .calendar-container {
    padding: 1rem 0.75rem;
    max-width: 100%;
  }

  .calendar-header {
    margin-bottom: 1rem;
    gap: 0.5rem;
  }

  .calendar-title {
    font-size: 1.5rem;
    letter-spacing: 0.1em;
  }

  .star-icon {
    font-size: 1.125rem;
  }

  .calendar-nav {
    margin-bottom: 0.875rem;
  }

  .month-text {
    font-size: 1.25rem;
  }

  .day-headers {
    gap: 0.25rem;
    margin-bottom: 0.5rem;
  }

  .day-header {
    font-size: 0.7rem;
    padding: 0.25rem;
    font-weight: 600;
  }

  .calendar-days {
    gap: 0.25rem;
  }

  .calendar-day {
    min-height: 55px;
    padding: 0.3rem 0.2rem;
    border-radius: 0.5rem;
    justify-content: space-between;
  }

  .day-number {
    font-size: 0.75rem;
    margin-bottom: 0.125rem;
    text-align: center;
    align-self: center;
  }

  .event-deadline {
    padding: 0.2rem 0.25rem;
    font-size: 0.55rem;
  }

  .event-deadline .event-icon {
    width: 8px;
    height: 8px;
  }

  .event-card {
    padding: 0.25rem;
    font-size: 0.5rem;
  }

  .event-icon-badge {
    width: 12px;
    height: 12px;
  }

  .event-icon-badge .event-icon {
    width: 6px;
    height: 6px;
  }

  .timeline-title {
    font-size: 0.5rem;
  }

  .event-more {
    font-size: 0.45rem;
  }

  .nav-icon {
    width: 1rem;
    height: 1rem;
  }
}

/* Extra Small Mobile */
@media (max-width: 360px) {
  .calendar-container {
    padding: 0.75rem 0.5rem;
  }

  .calendar-title {
    font-size: 1.25rem;
  }

  .month-text {
    font-size: 1.125rem;
  }

  .calendar-day {
    min-height: 45px;
    padding: 0.25rem 0.15rem;
  }

  .day-number {
    font-size: 0.7rem;
  }

  .event-deadline {
    padding: 0.15rem 0.2rem;
    font-size: 0.45rem;
  }

  .event-deadline .event-icon {
    width: 6px;
    height: 6px;
  }

  .event-card {
    padding: 0.2rem;
    font-size: 0.4rem;
  }

  .event-icon-badge {
    width: 10px;
    height: 10px;
  }

  .event-icon-badge .event-icon {
    width: 5px;
    height: 5px;
  }

  .event-time {
    display: none;
  }

  .day-header {
    font-size: 0.65rem;
    padding: 0.125rem;
  }
}
</style>
