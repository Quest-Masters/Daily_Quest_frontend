import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import axios from 'axios'

export const useQuestStore = defineStore('quest', () => {
  const quests = ref([])
  const currentQuest = ref(null)
  const loading = ref(false)
  const error = ref('')

  // 퀘스트 목록 조회
  const fetchQuests = async () => {
    loading.value = true
    error.value = ''
    try {
      const response = await axios.get('/api/quests')
      if (response.data.success) {
        quests.value = response.data.quests
      } else {
        error.value = response.data.message || '퀘스트 조회 실패'
      }
    } catch (err) {
      error.value = err.response?.data?.message || '서버 오류'
    } finally {
      loading.value = false
    }
  }

  // 퀘스트 생성
  const createQuest = async (questData) => {
    loading.value = true
    error.value = ''
    try {
      const response = await axios.post('/api/quests', questData)
      if (response.data.success) {
        quests.value.push(response.data.quest)
        return true
      } else {
        error.value = response.data.message || '퀘스트 생성 실패'
        return false
      }
    } catch (err) {
      error.value = err.response?.data?.message || '서버 오류'
      return false
    } finally {
      loading.value = false
    }
  }

  // 퀘스트 업데이트
  const updateQuest = async (questId, questData) => {
    loading.value = true
    error.value = ''
    try {
      const response = await axios.put(`/api/quests/${questId}`, questData)
      if (response.data.success) {
        const index = quests.value.findIndex(q => q.id === questId)
        if (index !== -1) {
          quests.value[index] = response.data.quest
        }
        return true
      } else {
        error.value = response.data.message || '퀘스트 업데이트 실패'
        return false
      }
    } catch (err) {
      error.value = err.response?.data?.message || '서버 오류'
      return false
    } finally {
      loading.value = false
    }
  }

  // 퀘스트 삭제
  const deleteQuest = async (questId) => {
    loading.value = true
    error.value = ''
    try {
      const response = await axios.delete(`/api/quests/${questId}`)
      if (response.data.success) {
        quests.value = quests.value.filter(q => q.id !== questId)
        return true
      } else {
        error.value = response.data.message || '퀘스트 삭제 실패'
        return false
      }
    } catch (err) {
      error.value = err.response?.data?.message || '서버 오류'
      return false
    } finally {
      loading.value = false
    }
  }

  // 퀘스트 완료/미완료 토글
  const toggleQuestComplete = async (questId) => {
    const quest = quests.value.find(q => q.id === questId)
    if (!quest) return false
    
    return await updateQuest(questId, { 
      ...quest, 
      completed: !quest.completed 
    })
  }

  return {
    quests,
    currentQuest,
    loading,
    error,
    fetchQuests,
    createQuest,
    updateQuest,
    deleteQuest,
    toggleQuestComplete
  }
})