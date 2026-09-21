<script setup lang="ts">
import type { AppIconName, ToneKey } from '@/domain'

import { ref } from 'vue'
import { APP_ICON_NAMES, TONE_KEYS } from '@/domain'
import { KIcon, KIconTile, KSectionTitle, STAT_ICONS, TASK_KIND_ICONS, TONE_ICONS, TOPIC_KIND_ICONS } from '@/ui'

/**
 * 图标总览（仅开发环境）
 * ====================
 *
 * 图标词汇表是**封闭**的：内容作者必须从 `APP_ICON_NAMES` 里挑一个名字写进 `icon:`，
 * 写错会编译失败。因此需要一个地方能「看着图挑名字」—— 就是这一页。
 *
 * 它只在 `import.meta.env.DEV` 时注册进路由，生产构建里不存在。
 * 访问地址：/dev/icons
 */
const weights = ['bold', 'duotone', 'fill', 'regular'] as const
const activeWeight = ref<(typeof weights)[number]>('duotone')

function copy(name: AppIconName): void {
  void navigator.clipboard?.writeText(name)
}
</script>

<template>
  <div class="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-10 px-6 py-10">
    <KSectionTitle
      eyebrow="内部工具 · 仅开发环境"
      title="图标总览"
      description="点任意图标可复制它的语义名。内容里写 icon: '名字' 即可使用；这个名字必须在词汇表内，否则编译失败。"
      tone="explore"
    />

    <section>
      <p class="mb-3 font-body text-xs font-bold tracking-[0.2em] text-ink-faint uppercase">
        显示字重
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="weight in weights"
          :key="weight"
          type="button"
          class="rounded-chip border-2 px-4 py-1.5 font-body text-sm transition-colors"
          :class="activeWeight === weight ? 'border-ink bg-ink text-paper' : 'border-line bg-surface text-ink-soft hover:bg-paper-deep'"
          @click="activeWeight = weight"
        >
          {{ weight }}
        </button>
      </div>
      <p class="mt-2 font-body text-xs text-ink-faint">
        bold 用于界面控件 · duotone 用于领域/世界这类身份标识 · fill 表示「已经发生」的状态
      </p>
    </section>

    <section>
      <h2 class="mb-4 font-display text-xl text-ink">
        全部词汇（{{ APP_ICON_NAMES.length }} 个）
      </h2>
      <ul class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <li v-for="name in APP_ICON_NAMES" :key="name">
          <button
            type="button"
            class="fx-tap flex w-full items-center gap-3 rounded-tile border-2 border-line bg-surface px-3 py-2.5 text-left shadow-press"
            :title="`点击复制 ${name}`"
            @click="copy(name)"
          >
            <KIcon :name="name" size="lg" :weight="activeWeight" class="text-ink" />
            <span class="truncate font-numeric text-xs text-ink-soft">{{ name }}</span>
          </button>
        </li>
      </ul>
    </section>

    <section>
      <h2 class="mb-2 font-display text-xl text-ink">
        领域色调与默认图标
      </h2>
      <p class="mb-4 font-body text-sm text-ink-soft">
        <code class="rounded bg-paper-deep px-1.5 py-0.5 font-numeric text-xs">Category.icon</code>
        是可选的；省略时按 <code class="rounded bg-paper-deep px-1.5 py-0.5 font-numeric text-xs">tone</code> 取这里的默认值。
      </p>
      <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <li
          v-for="tone in TONE_KEYS"
          :key="tone"
          class="flex flex-col items-center gap-2 rounded-tile border-2 border-line bg-surface p-4 shadow-press"
        >
          <KIconTile :icon="TONE_ICONS[tone as ToneKey]" :tone="tone" size="lg" />
          <span class="font-body text-xs text-ink-soft">{{ tone }}</span>
          <span class="font-numeric text-[11px] text-ink-faint">{{ TONE_ICONS[tone as ToneKey] }}</span>
        </li>
      </ul>
    </section>

    <section class="grid gap-8 lg:grid-cols-3">
      <div>
        <h2 class="mb-4 font-display text-xl text-ink">
          教学步骤
        </h2>
        <ul class="flex flex-col gap-2">
          <li
            v-for="(icon, kind) in TASK_KIND_ICONS"
            :key="kind"
            class="flex items-center gap-3 rounded-tile border-2 border-line bg-surface px-4 py-3 shadow-press"
          >
            <KIcon :name="icon" size="lg" weight="duotone" class="text-ink" />
            <span class="font-body text-sm text-ink-soft">{{ kind }}</span>
          </li>
        </ul>
      </div>

      <div>
        <h2 class="mb-4 font-display text-xl text-ink">
          主题类型
        </h2>
        <ul class="flex flex-col gap-2">
          <li
            v-for="(icon, kind) in TOPIC_KIND_ICONS"
            :key="kind"
            class="flex items-center gap-3 rounded-tile border-2 border-line bg-surface px-4 py-3 shadow-press"
          >
            <KIcon :name="icon" size="lg" weight="duotone" class="text-ink" />
            <span class="font-body text-sm text-ink-soft">{{ kind }}</span>
          </li>
        </ul>
      </div>

      <div>
        <h2 class="mb-4 font-display text-xl text-ink">
          统计口径
        </h2>
        <ul class="flex flex-col gap-2">
          <li
            v-for="(icon, key) in STAT_ICONS"
            :key="key"
            class="flex items-center gap-3 rounded-tile border-2 border-line bg-surface px-4 py-3 shadow-press"
          >
            <KIcon :name="icon" size="lg" weight="duotone" class="text-ink" />
            <span class="font-body text-sm text-ink-soft">{{ key }}</span>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>
