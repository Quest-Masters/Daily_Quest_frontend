<template>
  <div v-if="visible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <div class="header-icon">
          <Sparkles class="icon" />
        </div>
        <h2>AI 퀘스트 자동 생성</h2>
        <button @click="closeModal" class="close-button">
          <X />
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="createQuest" class="quest-form">
          <!-- 📝 할 일 입력 -->
          <div class="form-group">
            <label class="form-label">
              <Scroll class="label-icon" />
              할 일을 입력하세요
            </label>
            <base-input
              v-model="rawInput"
              type="text"
              placeholder="예: 세탁기 돌리기, 책 읽기, 운동하기..."
              required
              :error="errors.rawInput"
            />
          </div>

          <!-- 🏷️ 카테고리 선택 -->
          <div class="form-group">
            <label class="form-label">
              <Tag class="label-icon" />
              카테고리 (선택 또는 직접 입력)
            </label>
            <select v-model="categoryOption" class="form-select">
              <option value="">카테고리 선택</option>
              <option value="health">건강</option>
              <option value="learning">학습</option>
              <option value="skill">스킬</option>
              <option value="social">소셜</option>
              <option value="creative">창작</option>
              <option value="life">생활</option>
              <option value="custom">직접 입력</option>
            </select>
            <base-input
              v-if="categoryOption === 'custom'"
              v-model="customCategory"
              type="text"
              placeholder="카테고리를 입력하세요"
              :error="errors.category"
              class="mt-2"
            />
          </div>

          <!-- 📅 마감일 -->
          <div class="form-group">
            <label class="form-label">
              <Calendar class="label-icon" />
              마감일
            </label>
            <base-input v-model="dueDate" type="date" required :error="errors.dueDate" />
          </div>

          <!-- 버튼 -->
          <div class="form-actions">
            <base-button type="submit" variant="primary" :disabled="loading" class="create-button">
              <div v-if="loading" class="loading-content">
                <div class="spinner"></div>
                <span>AI가 퀘스트를 생성 중...</span>
              </div>
              <div v-else class="button-content">
                <Wand2 class="button-icon" />
                <span>퀘스트 생성</span>
              </div>
            </base-button>
          </div>
        </form>

        <!-- AI 생성 결과 -->
        <div v-if="quest" class="quest-result">
          <div class="quest-card">
            <div class="quest-card-header">
              <div class="quest-badge">
                <Crown class="badge-icon" />
                <span>새로운 퀘스트</span>
              </div>
              <div class="quest-rarity">
                <div class="rarity-stars">
                  <Star v-for="n in 3" :key="n" class="star" />
                </div>
              </div>
            </div>

            <div class="quest-card-body">
              <h3 class="quest-title">{{ quest.title }}</h3>
              <p class="quest-description">{{ quest.description }}</p>

              <!-- ✅ 체크리스트 표시 -->
              <div v-if="quest.objectives && quest.objectives.length" class="quest-objectives">
                <h4 class="objectives-title">체크리스트</h4>
                <ul class="objectives-list">
                  <li v-for="(item, index) in quest.objectives" :key="index">✅ {{ item }}</li>
                </ul>
              </div>

              <!-- 퀘스트 메타 -->
              <div class="quest-meta">
                <div class="meta-item">
                  <Tag class="meta-icon" />
                  <span>{{ getCategoryText(quest.category) }}</span>
                </div>
                <div class="meta-item">
                  <Calendar class="meta-icon" />
                  <span>{{ formatDate(quest.dueDate) }}</span>
                </div>
                <div class="meta-item xp-reward">
                  <Star class="meta-icon" />
                  <span>{{ quest.xpReward }} XP</span>
                </div>
              </div>
            </div>

            <!-- 수락/다시생성 -->
            <div class="quest-card-footer">
              <base-button variant="primary" @click="acceptQuest" class="accept-button">
                <Sword class="button-icon" />
                퀘스트 수락
              </base-button>
              <base-button variant="secondary" @click="regenerateQuest" class="regenerate-button">
                <RefreshCw class="button-icon" />
                다시 생성
              </base-button>
            </div>
          </div>
        </div>

        <!-- 오류 메시지 -->
        <div v-if="error" class="error-message">
          <AlertCircle class="error-icon" />
          <span>{{ error }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import axios from 'axios'
import {
  X,
  Sparkles,
  Scroll,
  Tag,
  Calendar,
  Wand2,
  Crown,
  Star,
  Sword,
  RefreshCw,
  AlertCircle,
} from 'lucide-vue-next'

import BaseInput from '@/components/BaseSetting/BaseInput.vue'
import BaseButton from '@/components/BaseSetting/BaseButton.vue'
import { useUserLoginStore } from '@/modules/user/login/login-store.js'

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close', 'quest-created'])

const rawInput = ref('')
const categoryOption = ref('')
const customCategory = ref('')
const dueDate = ref('')
const quest = ref(null)
const error = ref('')
const loading = ref(false)
const errors = reactive({ rawInput: '', dueDate: '', category: '' })

const loginStore = useUserLoginStore()

const actualCategory = computed(() => {
  return categoryOption.value === 'custom' ? customCategory.value.trim() : categoryOption.value
})

// AI 퀘스트 생성
const createQuest = async () => {
  errors.rawInput = ''
  errors.dueDate = ''
  errors.category = ''

  if (!rawInput.value.trim()) {
    errors.rawInput = '할 일을 입력해주세요.'
    return
  }
  if (!actualCategory.value) {
    errors.category = '카테고리를 입력하거나 선택해주세요.'
    return
  }
  if (!dueDate.value) {
    errors.dueDate = '마감일을 선택해주세요.'
    return
  }

  error.value = ''
  quest.value = null
  loading.value = true

  try {
    const res = await axios.post(
      '/api/quests/ai-generate',
      { rawInput: rawInput.value },
      { headers: { Authorization: `Bearer ${loginStore.token}` } },
    )

    quest.value = {
      title: res.data.title,
      description: res.data.description,
      xpReward: res.data.xpReward,
      objectives: res.data.objectives,
      category: actualCategory.value,
      dueDate: dueDate.value,
    }
  } catch (err) {
    console.error(err)
    error.value = err.response?.data || 'AI 퀘스트 생성에 실패했습니다.'
  } finally {
    loading.value = false
  }
}

// ✅ DB에 저장
const acceptQuest = async () => {
  try {
    const xp = quest.value.xpReward
    let difficulty = 'medium'
    if (xp <= 30) difficulty = 'easy'
    else if (xp <= 40) difficulty = 'medium'
    else difficulty = 'hard'

    const res = await axios.post(
      '/api/quests/create',
      {
        title: quest.value.title,
        description: quest.value.description,
        xpReward: quest.value.xpReward,
        category: quest.value.category,
        dueDate: new Date(quest.value.dueDate).toISOString(),
        userId: loginStore.currentUser?.userId,
        status: 'in-progress',
        difficulty: difficulty,
        objectives: quest.value.objectives.map((text) => ({
          text: text,
          completed: false,
        })),
      },
      {
        headers: { Authorization: `Bearer ${loginStore.token}` },
      },
    )

    emit('quest-created', res.data)
    closeModal()
  } catch (err) {
    console.error(err)
    error.value = err.response?.data || '퀘스트 저장에 실패했습니다.'
  }
}

const regenerateQuest = () => {
  createQuest()
}

const closeModal = () => {
  rawInput.value = ''
  categoryOption.value = ''
  customCategory.value = ''
  dueDate.value = ''
  quest.value = null
  error.value = ''
  loading.value = false
  emit('close')
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getCategoryText = (cat) => {
  const categoryMap = {
    health: '건강',
    learning: '학습',
    skill: '스킬',
    social: '소셜',
    creative: '창작',
    life: '생활',
  }
  return categoryMap[cat] || cat || '기타'
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

.modal-content {
  background-color: var(--card-background);
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  border: 2px solid var(--primary-light);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 2px solid var(--primary-light);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
  border-radius: 10px 10px 0 0;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.header-icon .icon {
  width: 24px;
  height: 24px;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.close-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 2rem;
  background-color: var(--card-color);
}

.quest-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.label-icon {
  width: 18px;
  height: 18px;
  color: var(--primary-color);
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--background-color);
  color: var(--text-color);
  font-size: 1rem;
  margin: 0 0 0.75rem 0;
  transition: border-color 0.2s;
}

.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-actions {
  margin-top: 2rem;
}

.create-button {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.button-icon {
  width: 20px;
  height: 20px;
}

.quest-result {
  margin-top: 2rem;
  animation: questAppear 0.8s ease-out;
}

.quest-card {
  background: linear-gradient(135deg, var(--card-background), var(--background-color));
  border: 3px solid var(--primary-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  position: relative;
}

.quest-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(
    90deg,
    var(--primary-color),
    var(--secondary-color),
    var(--accent-color)
  );
}

.quest-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
}

.quest-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgba(255, 255, 255, 0.9);
  color: var(--primary-dark);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
}

.badge-icon {
  width: 16px;
  height: 16px;
}

.rarity-stars {
  display: flex;
  gap: 0.25rem;
}

.star {
  width: 20px;
  height: 20px;
  color: var(--secondary-color);
  fill: currentColor;
  animation: starTwinkle 2s ease-in-out infinite;
}

.star:nth-child(2) {
  animation-delay: 0.3s;
}

.star:nth-child(3) {
  animation-delay: 0.6s;
}

.quest-card-body {
  padding: 1.5rem;
}

.quest-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-dark);
  margin-bottom: 0.75rem;
  text-align: center;
}

.quest-description {
  color: var(--text-light);
  line-height: 1.6;
  margin-bottom: 1.5rem;
  text-align: center;
  font-style: italic;
}

.quest-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: var(--background-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.meta-item.xp-reward {
  background: linear-gradient(135deg, var(--secondary-color), #ffe066);
  color: var(--text-color);
  font-weight: 600;
}

.meta-icon {
  width: 16px;
  height: 16px;
  color: var(--primary-color);
}

.quest-card-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background-color: var(--card-background);
  border-top: 1px solid var(--border-color);
}

.accept-button {
  flex: 2;
}

.regenerate-button {
  flex: 1;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #fee2e2;
  color: var(--error-color);
  border-radius: 8px;
  border: 1px solid #fecaca;
  margin-top: 1rem;
}

.error-icon {
  width: 20px;
  height: 20px;
}

.quest-objectives {
  margin-top: 1rem;
}
.objectives-title {
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.objectives-list {
  padding-left: 1rem;
  list-style-type: disc;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes questAppear {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes starTwinkle {
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

@media (max-width: 640px) {
  .modal-content {
    margin: 0.5rem;
    max-height: 95vh;
  }

  .modal-body {
    padding: 1rem;
  }

  .quest-meta {
    grid-template-columns: 1fr;
  }

  .quest-card-footer {
    flex-direction: column;
  }
}
</style>
