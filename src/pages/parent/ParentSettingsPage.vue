<script setup lang="ts">
import { computed, ref } from 'vue'

import { MASCOTS } from '@/domain'
import { MascotAvatar } from '@/features/mascot'
import { useCatalogStore, useProfileStore, useProgressStore } from '@/stores'
import { KButton, KCard, KModal, KSectionTitle, KStatTile, STAT_ICONS } from '@/ui'

/**
 * 家长中心 · 设置
 * ==============
 *
 * 孩子档案、内容规模、数据清理与方案说明。
 * 任何清空操作都必须经过弹层二次确认，避免误触丢失学习记录。
 */
const profile = useProfileStore()
const catalog = useCatalogStore()
const progress = useProgressStore()

const nickname = ref(profile.profile.nickname)
const nicknameSaved = ref(false)
const mascotChoices = Object.values(MASCOTS)
const stats = catalog.contentStats

const isNicknameDirty = computed(() => nickname.value.trim() !== profile.profile.nickname)
const canSaveNickname = computed(() => nickname.value.trim().length > 0 && isNicknameDirty.value)

const resetProgressOpen = ref(false)
const resetProfileOpen = ref(false)

const resetProgressSummary = computed(() =>
  `当前共有 ${progress.completions.length} 条完成记录、${progress.attempts.length} 次作答记录。`,
)

function saveNickname(): void {
  if (!canSaveNickname.value)
    return
  profile.rename(nickname.value)
  nickname.value = profile.profile.nickname
  nicknameSaved.value = true
}

function switchGradeFromSelect(event: Event): void {
  const select = event.target
  if (!(select instanceof HTMLSelectElement))
    return
  const next = catalog.grades.find(item => item.id === select.value)
  if (next)
    profile.switchGrade(next.id)
}

function confirmResetProgress(): void {
  progress.reset()
  resetProgressOpen.value = false
}

function confirmResetProfile(): void {
  profile.reset()
  nickname.value = profile.profile.nickname
  nicknameSaved.value = false
  resetProfileOpen.value = false
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- 孩子档案 -->
    <section>
      <KSectionTitle
        eyebrow="档案"
        title="孩子档案"
        description="昵称与年级会显示在儿童端首页，年级同时决定可学习的内容范围。"
      />

      <KCard>
        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-2">
            <label for="parent-child-nickname" class="font-body text-sm font-medium text-ink">
              孩子昵称
            </label>
            <div class="flex flex-wrap items-center gap-3">
              <input
                id="parent-child-nickname"
                v-model="nickname"
                type="text"
                maxlength="12"
                class="h-11 w-full max-w-xs rounded-tile border-2 border-line bg-surface px-4 font-body text-sm text-ink outline-none transition-colors focus:border-line-strong"
              >
              <KButton
                variant="soft"
                size="sm"
                :disabled="!canSaveNickname"
                @click="saveNickname"
              >
                保存昵称
              </KButton>
              <span v-if="nicknameSaved && !isNicknameDirty" class="font-body text-xs text-ink-faint">
                已保存
              </span>
            </div>
            <p class="font-body text-xs text-ink-faint">
              留空不会被保存，昵称最长 12 个字符。
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <label for="parent-child-grade" class="font-body text-sm font-medium text-ink">
              当前年级
            </label>
            <select
              id="parent-child-grade"
              class="h-11 w-full max-w-xs rounded-tile border-2 border-line bg-surface px-3 font-body text-sm text-ink outline-none transition-colors focus:border-line-strong"
              :value="profile.gradeId"
              @change="switchGradeFromSelect"
            >
              <option v-for="item in catalog.grades" :key="item.id" :value="item.id">
                {{ item.name }}（{{ item.ageRange }}）
              </option>
            </select>
            <p class="font-body text-xs text-ink-faint">
              切换年级只改变当前展示的内容，学习记录会按年级分别保留。
            </p>
          </div>

          <fieldset class="flex flex-col gap-3">
            <legend class="font-body text-sm font-medium text-ink">
              陪伴角色
            </legend>
            <div class="flex flex-wrap gap-3">
              <button
                v-for="mascot in mascotChoices"
                :key="mascot.id"
                type="button"
                :aria-pressed="mascot.id === profile.profile.mascot"
                class="flex w-40 items-center gap-3 rounded-tile border-2 px-4 py-3 text-left transition-colors"
                :class="mascot.id === profile.profile.mascot
                  ? 'border-ink bg-paper-deep'
                  : 'border-line bg-surface hover:border-line-strong'"
                @click="profile.chooseMascot(mascot.id)"
              >
                <MascotAvatar :id="mascot.id" size="sm" :animate="false" />
                <span class="flex min-w-0 flex-col">
                  <span class="font-body text-sm text-ink">{{ mascot.name }}</span>
                  <span class="truncate font-body text-xs text-ink-faint">{{ mascot.role }}</span>
                </span>
              </button>
            </div>
            <p class="font-body text-xs text-ink-faint">
              当前角色：{{ profile.mascot.name }}。
            </p>
          </fieldset>
        </div>
      </KCard>
    </section>

    <!-- 内容规模 -->
    <section>
      <KSectionTitle
        eyebrow="内容"
        title="内容规模"
        description="当前内容包中已就绪的年级、领域、主题、课程与知识方向数量。"
      />
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KStatTile icon="graduation-cap" :value="stats.grades" label="年级" />
        <KStatTile icon="grid" :value="stats.categories" label="学习领域" />
        <KStatTile icon="map" :value="stats.topics" label="学习主题" />
        <KStatTile :icon="STAT_ICONS.lessons" :value="stats.lessons" label="课程" />
        <KStatTile icon="brain" :value="stats.skills" label="知识方向" />
      </div>
    </section>

    <!-- 数据 -->
    <section>
      <KSectionTitle
        eyebrow="数据"
        title="数据管理"
        description="学习记录与孩子档案只保存在本机浏览器，不会上传到任何服务器。清除后无法恢复。"
      />

      <KCard>
        <div class="flex flex-col gap-6">
          <p class="font-body text-sm leading-relaxed text-ink-soft">
            本应用是纯前端方案：学习记录保存在本机浏览器（localStorage），不会上传。
            更换浏览器或清理浏览器数据会导致记录丢失；如需长期留存，请勿清理本站数据。
          </p>

          <div class="flex flex-wrap items-start justify-between gap-4 border-t border-line pt-6">
            <div class="max-w-xl">
              <p class="font-body text-sm font-medium text-ink">
                清除学习记录
              </p>
              <p class="mt-1 font-body text-xs text-ink-soft">
                {{ resetProgressSummary }}清除后，学习时间、正确率、掌握度与推荐都会重新开始计算。
              </p>
            </div>
            <KButton variant="soft" size="sm" tone="alert" @click="resetProgressOpen = true">
              清除学习记录
            </KButton>
          </div>

          <div class="flex flex-wrap items-start justify-between gap-4 border-t border-line pt-6">
            <div class="max-w-xl">
              <p class="font-body text-sm font-medium text-ink">
                重置孩子档案
              </p>
              <p class="mt-1 font-body text-xs text-ink-soft">
                昵称、年级与陪伴角色会恢复到默认值，已经产生的学习记录不会被删除。
              </p>
            </div>
            <KButton variant="soft" size="sm" tone="alert" @click="resetProfileOpen = true">
              重置孩子档案
            </KButton>
          </div>
        </div>
      </KCard>
    </section>

    <!-- 关于 -->
    <section>
      <KSectionTitle eyebrow="关于" title="关于星芽" />
      <KCard>
        <p class="font-display text-lg text-ink">
          星芽 <span class="font-numeric text-xs tracking-[0.12em] text-ink-faint">StarSprout</span>
        </p>
        <p class="mt-1 font-body text-xs text-ink-faint">
          4–12 岁自主探索学习空间
        </p>
        <p class="mt-4 font-body text-sm leading-relaxed text-ink-soft">
          课程内容采用数据驱动的方式组织：年级、领域、主题、课程与知识点都由内容包中的数据描述，
          界面完全按照数据渲染。因此新增教案只需要往内容包里加数据，不需要改动任何页面代码；
          内容有缺失或断链时，可以在「学习报告」页面的内容完整性自检中看到具体条目。
        </p>
      </KCard>
    </section>

    <!-- 清除学习记录确认 -->
    <KModal
      :open="resetProgressOpen"
      title="确认清除学习记录"
      size="sm"
      @close="resetProgressOpen = false"
    >
      <p class="font-body text-sm leading-relaxed text-ink-soft">
        将删除本机保存的全部学习记录，包括 {{ progress.completions.length }} 条完成记录与
        {{ progress.attempts.length }} 次作答记录。此操作不可撤销。
      </p>
      <template #footer>
        <KButton variant="ghost" size="sm" @click="resetProgressOpen = false">
          取消
        </KButton>
        <KButton variant="primary" size="sm" tone="alert" @click="confirmResetProgress">
          确认清除
        </KButton>
      </template>
    </KModal>

    <!-- 重置档案确认 -->
    <KModal
      :open="resetProfileOpen"
      title="确认重置孩子档案"
      size="sm"
      @close="resetProfileOpen = false"
    >
      <p class="font-body text-sm leading-relaxed text-ink-soft">
        将把昵称、年级与陪伴角色恢复为默认值。此操作不可撤销，学习记录不受影响。
      </p>
      <template #footer>
        <KButton variant="ghost" size="sm" @click="resetProfileOpen = false">
          取消
        </KButton>
        <KButton variant="primary" size="sm" tone="alert" @click="confirmResetProfile">
          确认重置
        </KButton>
      </template>
    </KModal>
  </div>
</template>
