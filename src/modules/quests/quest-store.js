import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useProfileStore } from '@/modules/user/profile/profile-store.js'
import { getAccessToken } from '@/utils/cookie-utils'

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

    const wasCompleted = quest.status === 'completed'

    try {
      // 퀘스트가 완료되지 않은 상태에서 완료로 변경하는 경우
      if (!wasCompleted) {
        const result = await handleQuestCompletion(quest)

        if (result) {
          // 로컬 상태 업데이트
          quest.status = 'completed'

          // 경험치 획득 알림
          if (result.xpGained > 0) {
            console.log(`${result.xpGained} XP를 획득했습니다!`)
          }

          return true
        }
      } else {
        // 이미 완료된 퀘스트의 경우 서버에 일반 업데이트 요청
        return await updateQuest(questId, {
          ...quest,
          status: 'in-progress'
        })
      }

      return false
    } catch (error) {
      console.error('퀘스트 완료 토글 실패:', error)
      return false
    }
  }

  // 퀘스트 완료 처리 (경험치 획득 및 업적 확인)
  const handleQuestCompletion = async (quest) => {
    const profileStore = useProfileStore()

    try {
      // 서버에서 퀘스트 완료 처리 (경험치 지급 포함)
      const response = await axios.patch(`/api/quests/${quest.id}/completed`, {}, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      })

      if (response.data.success) {
        // 프로필 정보 새로고침
        await profileStore.fetchProfile()

        // 서버에서 받은 경험치 정보
        const xpGained = response.data.xpGained || 0

        // 업적 확인
        const achievements = profileStore.checkAchievements()

        return {
          xpGained,
          leveledUp: false, // 서버에서 처리됨
          newLevel: profileStore.userProfile.level,
          achievements
        }
      }

      return null
    } catch (error) {
      console.error('퀘스트 완료 처리 실패:', error)
      return null
    }
  }

  // 퀘스트 난이도에 따른 경험치 계산
  const getQuestExperience = (quest) => {
    // 기본 경험치
    let baseXp = 50

    // 난이도에 따른 보너스
    switch (quest.difficulty?.toLowerCase()) {
      case 'easy':
      case '쉬움':
        baseXp = 30
        break
      case 'medium':
      case '보통':
        baseXp = 50
        break
      case 'hard':
      case '어려움':
        baseXp = 80
        break
      case 'expert':
      case '전문가':
        baseXp = 120
        break
      default:
        baseXp = 50
    }

    // 카테고리에 따른 보너스
    if (quest.category) {
      switch (quest.category.toLowerCase()) {
        case 'study':
        case '학습':
          baseXp += 10
          break
        case 'exercise':
        case '운동':
          baseXp += 15
          break
        case 'work':
        case '업무':
          baseXp += 5
          break
        case 'hobby':
        case '취미':
          baseXp += 8
          break
      }
    }

    return baseXp
  }

  // 마감일이 지난 퀘스트 체크 및 상태 업데이트
  const checkExpiredQuests = () => {
    const now = new Date()
    let hasExpiredQuests = false

    quests.value.forEach(quest => {
      const dueDate = new Date(quest.dueDate)
      const isExpired = dueDate < now

      // 마감일이 지났고 아직 대기중이거나 진행중인 퀘스트만 마감 처리
      if (isExpired && (quest.status === 'pending' || quest.status === 'in-progress')) {
        quest.status = 'expired'
        hasExpiredQuests = true
      }
    })

    return hasExpiredQuests
  }

  // 만료된 퀘스트를 서버에 업데이트
  const updateExpiredQuests = async () => {
    const expiredQuests = quests.value.filter(q => q.status === 'expired')

    for (const quest of expiredQuests) {
      try {
        await updateQuest(quest.id, { ...quest, status: 'expired' })
      } catch (err) {
        console.error(`퀘스트 ${quest.id} 만료 상태 업데이트 실패:`, err)
      }
    }
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
    toggleQuestComplete,
    handleQuestCompletion,
    getQuestExperience,
    checkExpiredQuests,
    updateExpiredQuests
  }
})