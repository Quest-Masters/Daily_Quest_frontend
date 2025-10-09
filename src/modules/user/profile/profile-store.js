import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { getAccessToken } from '@/utils/cookie-utils'

export const useProfileStore = defineStore('profile', () => {
  const userProfile = ref({
    id: '',
    name: '',
    email: {
      id: '',
      selectedDomain: '',
      customDomain: '',
    },
    phone: {
      first: '',
      middle: '',
      last: '',
    },
    level: 1,
    xp: 0,
    status: 0,
    totalQuestsCompleted: 0,
    consecutiveDays: 0,
    titles: [],
    currentTitle: '초보 모험가',
    badges: [],
    achievements: []
  })

  const loading = ref(false)
  const error = ref('')

  // 레벨별 필요 경험치 계산 (지수적 증가)
  const getRequiredXpForLevel = (level) => {
    return Math.floor(100 * Math.pow(1.5, level - 1))
  }

  // 현재 레벨에서 다음 레벨까지 필요한 경험치
  const requiredXpForCurrentLevel = computed(() => {
    return getRequiredXpForLevel(userProfile.value.level)
  })

  // 경험치 퍼센테이지 계산
  const xpPercentage = computed(() => {
    return Math.min((userProfile.value.xp / requiredXpForCurrentLevel.value) * 100, 100)
  })

  // 경험치 획득 및 레벨업 처리
  const gainExperience = async (xpAmount, questId = null) => {
    try {
      const response = await axios.post('/api/profile/gain-xp', {
        xpAmount,
        questId
      }, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      })

      if (response.data.success) {
        const { newXp, newLevel, totalXp, leveledUp, earnedTitle } = response.data

        // 프로필 정보 업데이트
        userProfile.value.xp = newXp
        userProfile.value.level = newLevel
        userProfile.value.totalXp = totalXp

        if (leveledUp) {
          // 레벨업 알림
          return {
            leveledUp: true,
            newLevel,
            earnedTitle: earnedTitle || null,
            xpGained: xpAmount
          }
        }

        return { leveledUp: false, xpGained: xpAmount }
      }
    } catch (err) {
      console.error('경험치 획득 실패:', err)
      // 오프라인에서도 작동하도록 로컬 계산
      return gainExperienceOffline(xpAmount)
    }
  }

  // 오프라인 경험치 계산
  const gainExperienceOffline = (xpAmount) => {
    const currentXp = userProfile.value.xp
    const currentLevel = userProfile.value.level
    const requiredXp = getRequiredXpForLevel(currentLevel)

    let newXp = currentXp + xpAmount
    let newLevel = currentLevel
    let leveledUp = false

    // 레벨업 확인
    while (newXp >= getRequiredXpForLevel(newLevel)) {
      newXp -= getRequiredXpForLevel(newLevel)
      newLevel++
      leveledUp = true
    }

    userProfile.value.xp = newXp
    userProfile.value.level = newLevel

    return {
      leveledUp,
      newLevel: leveledUp ? newLevel : null,
      xpGained: xpAmount
    }
  }

  // 칭호 해제
  const unlockTitle = (titleId, titleName) => {
    if (!userProfile.value.titles.includes(titleId)) {
      userProfile.value.titles.push(titleId)

      // 서버에 업데이트
      updateTitleOnServer(titleId, titleName)

      return true
    }
    return false
  }

  // 칭호 설정
  const setCurrentTitle = async (titleName) => {
    try {
      const response = await axios.put('/api/profile/title', {
        title: titleName
      }, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      })

      if (response.data.success) {
        userProfile.value.currentTitle = titleName
        return true
      }
    } catch (err) {
      console.error('칭호 설정 실패:', err)
    }
    return false
  }

  // 서버에 칭호 업데이트
  const updateTitleOnServer = async (titleId, titleName) => {
    try {
      await axios.post('/api/profile/unlock-title', {
        titleId,
        titleName
      }, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      })
    } catch (err) {
      console.error('칭호 서버 업데이트 실패:', err)
    }
  }

  // 프로필 데이터 로드
  const fetchProfile = async () => {
    loading.value = true
    error.value = ''

    try {
      const response = await axios.get('/api/profile', {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      })

      if (response.data) {
        Object.assign(userProfile.value, response.data)
      }
    } catch (err) {
      error.value = err.response?.data?.message || '프로필 로드 실패'
      console.error('프로필 로드 실패:', err)
    } finally {
      loading.value = false
    }
  }

  // 프로필 업데이트
  const updateProfile = async (profileData) => {
    loading.value = true
    error.value = ''

    try {
      const response = await axios.put('/api/profile', profileData, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      })

      if (response.data.success) {
        Object.assign(userProfile.value, response.data.profile)
        return true
      }
    } catch (err) {
      error.value = err.response?.data?.message || '프로필 업데이트 실패'
      console.error('프로필 업데이트 실패:', err)
    } finally {
      loading.value = false
    }

    return false
  }

  // 업적 확인 및 해제
  const checkAchievements = () => {
    const achievements = []

    // 퀘스트 완료 수에 따른 칭호
    if (userProfile.value.totalQuestsCompleted >= 10 && !userProfile.value.titles.includes('dedicated_adventurer')) {
      achievements.push({
        type: 'title',
        id: 'dedicated_adventurer',
        name: '성실한 모험가',
        description: '10개의 퀘스트를 완료했습니다!'
      })
    }

    if (userProfile.value.totalQuestsCompleted >= 50 && !userProfile.value.titles.includes('quest_master')) {
      achievements.push({
        type: 'title',
        id: 'quest_master',
        name: '퀘스트 마스터',
        description: '50개의 퀘스트를 완료했습니다!'
      })
    }

    if (userProfile.value.totalQuestsCompleted >= 100 && !userProfile.value.titles.includes('legendary_hero')) {
      achievements.push({
        type: 'title',
        id: 'legendary_hero',
        name: '전설의 영웅',
        description: '100개의 퀘스트를 완료했습니다!'
      })
    }

    // 레벨에 따른 칭호
    if (userProfile.value.level >= 10 && !userProfile.value.titles.includes('experienced_warrior')) {
      achievements.push({
        type: 'title',
        id: 'experienced_warrior',
        name: '숙련된 전사',
        description: '레벨 10에 도달했습니다!'
      })
    }

    // 연속 일수에 따른 칭호
    if (userProfile.value.consecutiveDays >= 7 && !userProfile.value.titles.includes('dedicated_user')) {
      achievements.push({
        type: 'title',
        id: 'dedicated_user',
        name: '성실한 사용자',
        description: '7일 연속으로 퀘스트를 완료했습니다!'
      })
    }

    // 업적 해제 처리
    achievements.forEach(achievement => {
      if (achievement.type === 'title') {
        unlockTitle(achievement.id, achievement.name)
      }
    })

    return achievements
  }

  return {
    userProfile,
    loading,
    error,
    requiredXpForCurrentLevel,
    xpPercentage,
    gainExperience,
    unlockTitle,
    setCurrentTitle,
    fetchProfile,
    updateProfile,
    checkAchievements
  }
})