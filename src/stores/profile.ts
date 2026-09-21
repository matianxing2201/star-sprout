import type { ChildProfile, GradeId, MascotId } from '@/domain'
import { defineStore } from 'pinia'

import { computed, ref } from 'vue'
import { profileRepository } from '@/data'
import { DEFAULT_PROFILE, getMascot } from '@/domain'

/**
 * 孩子档案 store
 * =============
 *
 * 当前年级是整个儿童端的“全局上下文”：首页地图、领域列表、课程推荐都跟着它变。
 * 因此它只在这里维护一份，页面不得自己缓存。
 */
export const useProfileStore = defineStore('profile', () => {
  const stored = profileRepository.load()

  const profile = ref<ChildProfile>(
    stored ?? { ...DEFAULT_PROFILE, createdAt: Date.now() },
  )

  if (!stored)
    profileRepository.save(profile.value)

  /** 当前年级 id —— 页面用它的次数最多，单独暴露 */
  const gradeId = computed<GradeId>(() => profile.value.gradeId)

  /** 当前角色（IP 形象） */
  const mascot = computed(() => getMascot(profile.value.mascot))

  const nickname = computed(() => profile.value.nickname)

  function persist(): void {
    profileRepository.save(profile.value)
  }

  function switchGrade(next: GradeId): void {
    if (profile.value.gradeId === next)
      return
    profile.value = { ...profile.value, gradeId: next }
    persist()
  }

  function chooseMascot(next: MascotId): void {
    profile.value = { ...profile.value, mascot: next }
    persist()
  }

  function rename(next: string): void {
    const nicknameValue = next.trim() || DEFAULT_PROFILE.nickname
    profile.value = { ...profile.value, nickname: nicknameValue }
    persist()
  }

  function reset(): void {
    profile.value = { ...DEFAULT_PROFILE, createdAt: Date.now() }
    persist()
  }

  return { profile, gradeId, mascot, nickname, switchGrade, chooseMascot, rename, reset }
})
