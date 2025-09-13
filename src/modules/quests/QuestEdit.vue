<template>
  <div class="quest-edit-page">
    <div class="quest-header">
      <button @click="goBack" class="back-button">
        <ArrowLeft />
        <span>뒤로가기</span>
      </button>

      <div class="header-actions">
        <base-button variant="danger" size="small" @click="showDeleteModal = true">
          <Trash2 class="button-icon" />
          삭제
        </base-button>
      </div>
    </div>

    <div class="edit-container">
      <div class="edit-card">
        <div class="card-header">
          <div class="header-icon">
            <Edit3 class="icon" />
          </div>
          <h1>퀘스트 수정</h1>
        </div>

        <form @submit.prevent="saveQuest" class="quest-form">
          <div class="form-section">
            <h2>기본 정보</h2>

            <div class="form-group">
              <label class="form-label">
                <Scroll class="label-icon" />
                퀘스트 제목
              </label>
              <base-input
                v-model="questForm.title"
                type="text"
                placeholder="퀘스트 제목을 입력하세요"
                required
                :error="errors.title"
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                <FileText class="label-icon" />
                퀘스트 설명
              </label>
              <textarea
                v-model="questForm.description"
                class="form-textarea"
                placeholder="퀘스트에 대한 자세한 설명을 입력하세요"
                rows="4"
                required
              ></textarea>
              <p v-if="errors.description" class="error-message">{{ errors.description }}</p>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <Tag class="label-icon" />
                  카테고리
                </label>
                <select v-model="questForm.category" class="form-select" required>
                  <option value="">카테고리 선택</option>
                  <option value="health">건강</option>
                  <option value="learning">학습</option>
                  <option value="skill">스킬</option>
                  <option value="social">소셜</option>
                  <option value="creative">창작</option>
                  <option value="life">생활</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <Zap class="label-icon" />
                  난이도
                </label>
                <select v-model="questForm.difficulty" class="form-select" required>
                  <option value="easy">쉬움</option>
                  <option value="medium">보통</option>
                  <option value="hard">어려움</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2>일정 및 보상</h2>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <Calendar class="label-icon" />
                  시작일
                </label>
                <base-input
                  v-model="questForm.startDate"
                  type="date"
                  required
                  :error="errors.startDate"
                />
              </div>

              <div class="form-group">
                <label class="form-label">
                  <CalendarX class="label-icon" />
                  마감일
                </label>
                <base-input
                  v-model="questForm.dueDate"
                  type="date"
                  required
                  :error="errors.dueDate"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <Star class="label-icon" />
                  보상 XP
                </label>
                <base-input
                  v-model.number="questForm.xpReward"
                  type="number"
                  min="10"
                  max="1000"
                  placeholder="10-1000"
                  required
                  :error="errors.xpReward"
                />
              </div>

              <div class="form-group">
                <label class="form-label">
                  <Clock class="label-icon" />
                  예상 소요시간
                </label>
                <base-input
                  v-model="questForm.estimatedTime"
                  type="text"
                  placeholder="예: 30분, 1시간"
                />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2>퀘스트 목표</h2>

            <div class="objectives-list">
              <div
                v-for="(objective, index) in questForm.objectives"
                :key="index"
                class="objective-item"
              >
                <base-input
                  v-model="objective.text"
                  type="text"
                  :placeholder="`목표 ${index + 1}`"
                  required
                />
                <button
                  type="button"
                  @click="removeObjective(index)"
                  class="remove-objective"
                  :disabled="questForm.objectives.length <= 1"
                >
                  <X />
                </button>
              </div>
            </div>

            <base-button
              type="button"
              variant="secondary"
              @click="addObjective"
              class="add-objective-btn"
            >
              <Plus class="button-icon" />
              목표 추가
            </base-button>
          </div>

          <div class="form-actions">
            <base-button type="button" variant="secondary" @click="goBack"> 취소 </base-button>

            <base-button type="submit" variant="primary" :disabled="loading">
              <div v-if="loading" class="loading-content">
                <div class="spinner"></div>
                <span>저장 중...</span>
              </div>
              <div v-else class="button-content">
                <Save class="button-icon" />
                <span>저장하기</span>
              </div>
            </base-button>
          </div>
        </form>
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>퀘스트 삭제</h2>
          <button @click="showDeleteModal = false" class="close-button">
            <X />
          </button>
        </div>
        <div class="modal-body">
          <div class="warning-icon">
            <AlertTriangle />
          </div>
          <p>정말로 이 퀘스트를 삭제하시겠습니까?</p>
          <p class="warning-text">삭제된 퀘스트는 복구할 수 없습니다.</p>
        </div>
        <div class="modal-actions">
          <base-button variant="secondary" @click="showDeleteModal = false"> 취소 </base-button>
          <base-button variant="danger" @click="deleteQuest"> 삭제 </base-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Edit3,
  Scroll,
  FileText,
  Tag,
  Zap,
  Calendar,
  CalendarX,
  Star,
  Clock,
  Plus,
  X,
  Save,
  Trash2,
  AlertTriangle,
} from 'lucide-vue-next'
import BaseInput from '@/components/BaseSetting/BaseInput.vue'
import BaseButton from '@/components/BaseSetting/BaseButton.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const showDeleteModal = ref(false)

// 퀘스트 폼 데이터
const questForm = reactive({
  title: '',
  description: '',
  category: '',
  difficulty: 'medium',
  startDate: '',
  dueDate: '',
  xpReward: 100,
  estimatedTime: '',
  objectives: [{ text: '', completed: false }],
})

// 에러 상태
const errors = reactive({
  title: '',
  description: '',
  startDate: '',
  dueDate: '',
  xpReward: '',
})

// 퀘스트 데이터 로드
onMounted(() => {
  loadQuestData()
})

const loadQuestData = () => {
  // 실제 구현에서는 API에서 데이터를 가져옴
  const questId = route.params.id

  // 임시 데이터 (실제로는 API 호출)
  const mockQuest = {
    id: questId,
    title: '아침 운동 퀘스트',
    description: '건강한 하루를 시작하기 위해 매일 아침 30분간 운동을 합니다.',
    category: 'health',
    difficulty: 'medium',
    startDate: '2024-01-01',
    dueDate: '2024-01-07',
    xpReward: 100,
    estimatedTime: '30분',
    objectives: [
      { text: '운동복으로 갈아입기', completed: true },
      { text: '���트레칭 5분 하기', completed: true },
      { text: '유산소 운동 20분 하기', completed: false },
      { text: '마무리 스트레칭 5분 하기', completed: false },
    ],
  }

  // 폼에 데이터 설정
  Object.assign(questForm, mockQuest)
}

const addObjective = () => {
  questForm.objectives.push({ text: '', completed: false })
}

const removeObjective = (index) => {
  if (questForm.objectives.length > 1) {
    questForm.objectives.splice(index, 1)
  }
}

const validateForm = () => {
  // 에러 초기화
  Object.keys(errors).forEach((key) => (errors[key] = ''))

  let isValid = true

  if (!questForm.title.trim()) {
    errors.title = '퀘스트 제목을 입력해주세요.'
    isValid = false
  }

  if (!questForm.description.trim()) {
    errors.description = '퀘스트 설명을 입력해주세요.'
    isValid = false
  }

  if (!questForm.startDate) {
    errors.startDate = '시작일을 선택해주세요.'
    isValid = false
  }

  if (!questForm.dueDate) {
    errors.dueDate = '마감일을 선택해주세요.'
    isValid = false
  }

  if (
    questForm.startDate &&
    questForm.dueDate &&
    new Date(questForm.startDate) >= new Date(questForm.dueDate)
  ) {
    errors.dueDate = '마감일은 시작일보다 늦어야 합니다.'
    isValid = false
  }

  if (!questForm.xpReward || questForm.xpReward < 10 || questForm.xpReward > 1000) {
    errors.xpReward = 'XP는 10-1000 사이의 값이어야 합니다.'
    isValid = false
  }

  return isValid
}

const saveQuest = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    // 실제 구현에서는 API 호출
    await new Promise((resolve) => setTimeout(resolve, 1000))

    alert('퀘스트가 성공적으로 수정되었습니다!')
    router.push('/quests')
  } catch (error) {
    console.error('퀘스트 저장 실패:', error)
    alert('퀘스트 저장에 실패했습니다.')
  } finally {
    loading.value = false
  }
}

const deleteQuest = async () => {
  try {
    // 실제 구현에서는 API 호출
    await new Promise((resolve) => setTimeout(resolve, 500))

    alert('퀘스트가 삭제되었습니다.')
    router.push('/quests')
  } catch (error) {
    console.error('퀘스트 삭제 실패:', error)
    alert('퀘스트 삭제에 실패했습니다.')
  }
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.quest-edit-page {
  max-width: 800px;
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

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.button-icon {
  width: 1rem;
  height: 1rem;
}

.edit-container {
  background-color: var(--card-background);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.header-icon .icon {
  width: 24px;
  height: 24px;
}

.card-header h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
}

.quest-form {
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h2 {
  margin: 0 0 1.5rem 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.label-icon {
  width: 18px;
  height: 18px;
  color: var(--primary-color);
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--background-color);
  color: var(--text-primary);
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--background-color);
  color: var(--text-primary);
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.error-message {
  color: var(--error-color);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.objectives-list {
  margin-bottom: 1rem;
}

.objective-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  align-items: flex-start;
}

.remove-objective {
  background: none;
  border: none;
  color: var(--error-color);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  margin-top: 0.25rem;
}

.remove-objective:hover:not(:disabled) {
  background-color: var(--error-light);
}

.remove-objective:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-objective-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.loading-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

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
}

.modal-content {
  background-color: var(--card-background);
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
}

.close-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
}

.modal-body {
  padding: 1.5rem;
  text-align: center;
}

.warning-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.warning-icon svg {
  width: 48px;
  height: 48px;
  color: var(--error-color);
}

.warning-text {
  color: var(--error-color);
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
