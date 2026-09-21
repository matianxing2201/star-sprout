<script setup lang="ts">
import { computed } from 'vue'

import { toneVars } from '@/domain'
import { MascotAvatar } from '@/features/mascot'
import { KIcon } from '@/ui'
import { useHomePrototypeData } from '../useHomePrototypeData'

/**
 * 变体 C —— 游戏地图
 * ==================
 *
 * 分歧轴：**信息结构**
 *
 * 做法：**地图就是首页**。没有「今日任务」区块，没有卡片网格 ——
 * 今日任务变成插在地图节点上的一面小旗子，孩子的位置由角色头像标出来。
 * 数字降级成贴在边角的 HUD 小片。
 *
 * 为什么这可能治好「AI 感」：现状把地图压在第 4 屏，上面盖着「问候卡 + 4 个等大
 * 统计块 + 3 个等大主题卡」—— 那些等大网格正是 AI 生成最典型的形状。
 * 这个方向把它们全删了，因为产品最独特的想法本来就是「一张可以逛的地图」
 * （需求文档第三十一节原话）。
 */
const {
  grade,
  mascot,
  todayTopics,
  today,
  growth,
  gradeTopics,
  completedTopics,
  mapNodes,
  mapPaths,
  mapTitle,
  recent,
  countLessons,
  enterTopic,
  openWorld,
  openLesson,
  worldIdOfCategory,
} = useHomePrototypeData()

const lead = computed(() => todayTopics.value[0])

/** 主任务落在哪个地图节点上：任务 → 领域 → 学习世界 */
const leadNodeId = computed(() => {
  const topic = lead.value
  if (!topic)
    return undefined
  return worldIdOfCategory(topic.categoryId)
})

/** 孩子现在站在哪：第一个没被锁住、且还没走完的地方 */
const hereNodeId = computed(() => {
  const candidate = mapNodes.value.find(node => !node.lockedInFog && (node.total === 0 || node.done < node.total))
  return candidate?.worldId ?? mapNodes.value[0]?.worldId
})

function tallyOf(node: { lockedInFog: boolean, done: number, total: number }): string {
  if (node.lockedInFog)
    return '还没解锁'
  if (node.total === 0)
    return '内容准备中'
  if (node.done === node.total)
    return '已经完成'
  return `${node.done}/${node.total}`
}

const openNodes = computed(() => mapNodes.value.filter(node => !node.lockedInFog).length)
</script>

<template>
  <div class="mp">
    <!-- 地图整块占满第一屏，它就是这一页 -->
    <section class="mp__world" :aria-label="mapTitle">
      <!-- 边角 HUD：数字小片，不抢地图 -->
      <div class="mp__hud mp__hud--left">
        <span class="mp__hudItem"><b>{{ grade?.name }}</b></span>
        <span class="mp__hudItem">{{ today.minutes }} 分钟</span>
        <span class="mp__hudItem">{{ today.lessons }} 个探索</span>
      </div>
      <div class="mp__hud mp__hud--right">
        <span class="mp__hudItem mp__hudItem--star">
          <KIcon name="star" size="xs" weight="fill" />{{ growth.stars }}
        </span>
        <span class="mp__hudItem">连续 {{ growth.streakDays }} 天</span>
      </div>

      <!-- 地图本体 -->
      <div class="mp__canvas">
        <svg class="mp__paths" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path
            v-for="(path, index) in mapPaths"
            :key="index"
            :d="path.d"
            fill="none"
            stroke="var(--color-line-strong)"
            stroke-width="0.5"
            stroke-dasharray="2.2 2.4"
            stroke-linecap="round"
            vector-effect="non-scaling-stroke"
          />
        </svg>

        <template v-for="node in mapNodes" :key="node.worldId">
          <button
            type="button"
            class="mp__node"
            :class="[
              `mp__node--${node.size}`,
              node.lockedInFog && 'mp__node--fog',
              node.worldId === leadNodeId && 'mp__node--target',
            ]"
            :style="{ left: `${node.x}%`, top: `${node.y}%`, ...toneVars(node.tone) }"
            :disabled="node.lockedInFog"
            :aria-label="`${node.name}，${tallyOf(node)}`"
            @click="openWorld(node.worldId)"
          >
            <span class="mp__nodeDisc">
              <KIcon :name="node.lockedInFog ? 'lock' : node.icon" size="md" weight="duotone" />
            </span>
            <span class="mp__nodeName">{{ node.name }}</span>
            <span class="mp__nodeTally">{{ tallyOf(node) }}</span>

            <!-- 今天要探索的地方：插一面小旗 -->
            <span v-if="node.worldId === leadNodeId" class="mp__flag">
              <span class="mp__flagLabel">今天</span>
              <span class="mp__flagText">{{ lead?.title }}</span>
            </span>

            <!-- 孩子在这里 -->
            <span v-if="node.worldId === hereNodeId" class="mp__you">
              <MascotAvatar :id="mascot.id" size="sm" :animate="false" />
              <span class="mp__youLabel">你在这里</span>
            </span>
          </button>
        </template>
      </div>

      <!-- 只有一个按钮：走向今天的地方 -->
      <button v-if="lead" type="button" class="mp__go" @click="enterTopic(lead)">
        <span class="mp__goMain">去 {{ lead.title }}</span>
        <span class="mp__goMeta">{{ countLessons(lead) }} 节 · {{ lead.objectives[0] }}</span>
      </button>
    </section>

    <!-- 折线下面的东西一律压扁：一行地图概况 + 一条最近记录 -->
    <footer class="mp__below">
      <p class="mp__tally">
        {{ mapTitle }} · 走过 {{ completedTopics }}/{{ gradeTopics.length }} 个主题 · 已解锁 {{ openNodes }}/{{ mapNodes.length }} 个地方
      </p>

      <ul v-if="recent.length > 0" class="mp__recent">
        <li v-for="item in recent" :key="item.completion.lessonId">
          <button type="button" class="mp__recentItem" @click="openLesson(item.completion.lessonId)">
            <KIcon :name="item.lesson?.icon ?? 'book'" size="sm" />
            <span>{{ item.lesson?.title ?? '一节课' }}</span>
            <span class="mp__recentStars">{{ item.completion.stars }} 星</span>
          </button>
        </li>
      </ul>
      <p v-else class="mp__tally">
        还没有走过的路 —— 从地图上任意一个地方开始都行。
      </p>
    </footer>
  </div>
</template>

<style scoped>
.mp {
  max-width: 68rem;
  margin: 0 auto;
  color: var(--color-ink);
}

/* 地图占满第一屏的大部分：先给一个可以逛的地方，再谈别的 */
.mp__world {
  position: relative;
  min-height: min(72vh, 40rem);
  margin-top: 0.5rem;
  padding: 3.25rem 1rem 5.5rem;
  border-radius: 32px;
  background: radial-gradient(120% 90% at 50% 0%, rgb(255 255 255 / 70%), transparent 60%), var(--color-paper-deep);
}

/* ---- 边角 HUD ---- */
.mp__hud {
  position: absolute;
  top: 0.875rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-family: var(--font-body);
  font-size: 0.6875rem;
  color: var(--color-ink-faint);
}

.mp__hud--left {
  left: 1.25rem;
}

.mp__hud--right {
  right: 1.25rem;
}

.mp__hudItem {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.3125rem 0.625rem;
  border-radius: 999px;
  background: rgb(255 255 255 / 72%);
  letter-spacing: 0.04em;
}

.mp__hudItem b {
  color: var(--color-ink-soft);
}

.mp__hudItem--star {
  font-family: var(--font-numeric);
  font-weight: 700;
  color: var(--color-star-deep);
}

/* ---- 地图本体 ---- */
.mp__canvas {
  position: relative;
  height: min(52vh, 30rem);
}

.mp__paths {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* 节点：不要卡片，要「一个地方」。圆盘 + 名字，悬停时抬起来。
   居中位移写在基类的 transform 里，hover/active 必须把它带上，否则会跳位。 */
.mp__node {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
  cursor: pointer;
  transform: translate(-50%, -50%);
  transition: transform 220ms var(--ease-soft);
  animation: mp-appear 220ms var(--ease-soft) both;
}

.mp__node:hover:not(:disabled) {
  transform: translate(-50%, -50%) translateY(-5px) scale(1.04);
}

.mp__node:active:not(:disabled) {
  transform: translate(-50%, -50%) scale(0.97);
}

.mp__node--sm .mp__nodeDisc {
  width: 3.25rem;
  height: 3.25rem;
}
.mp__node--md .mp__nodeDisc {
  width: 4rem;
  height: 4rem;
}
.mp__node--lg .mp__nodeDisc {
  width: 4.75rem;
  height: 4.75rem;
}

.mp__nodeDisc {
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: var(--color-surface);
  color: var(--tone-deep);
  box-shadow:
    0 1px 1px rgb(46 42 37 / 8%),
    0 10px 22px -10px rgb(46 42 37 / 30%);
}

.mp__nodeName {
  padding: 0.1875rem 0.5rem;
  border-radius: 999px;
  background: rgb(255 255 255 / 88%);
  font-family: var(--font-display);
  font-size: 0.8125rem;
  white-space: nowrap;
}

.mp__nodeTally {
  font-family: var(--font-numeric);
  font-size: 0.625rem;
  color: var(--color-ink-faint);
}

.mp__node--fog {
  cursor: default;
  opacity: 0.42;
}

.mp__node--fog .mp__nodeDisc {
  border: 1px dashed var(--color-line-strong);
  background: rgb(255 255 255 / 60%);
  box-shadow: none;
}

/* 今天要去的地方：圆盘外一圈呼吸感的环（一次性，不是常驻动画） */
.mp__node--target .mp__nodeDisc {
  box-shadow:
    0 0 0 4px var(--tone-glow),
    0 1px 1px rgb(46 42 37 / 8%),
    0 12px 26px -10px rgb(46 42 37 / 34%);
}

.mp__flag {
  position: absolute;
  bottom: calc(100% + 0.5rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  padding: 0.4375rem 0.75rem;
  border-radius: 12px;
  background: var(--tone);
  color: var(--color-paper);
  white-space: nowrap;
  animation: mp-plant 240ms var(--ease-soft) both;
}

/* 旗杆 */
.mp__flag::after {
  position: absolute;
  top: 100%;
  left: 50%;
  width: 1px;
  height: 0.5rem;
  content: '';
  background: var(--tone);
}

.mp__flagLabel {
  font-family: var(--font-body);
  font-size: 0.5625rem;
  letter-spacing: 0.2em;
  opacity: 0.85;
}

.mp__flagText {
  font-family: var(--font-display);
  font-size: 0.875rem;
}

.mp__you {
  position: absolute;
  top: calc(100% + 0.25rem);
  left: 50%;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transform: translateX(-50%);
  white-space: nowrap;
}

.mp__youLabel {
  padding: 0.125rem 0.4375rem;
  border-radius: 999px;
  background: var(--color-ink);
  color: var(--color-paper);
  font-family: var(--font-body);
  font-size: 0.5625rem;
  letter-spacing: 0.1em;
}

/* 唯一的主按钮 */
.mp__go {
  position: absolute;
  bottom: 1.25rem;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.875rem 2rem;
  border: 0;
  border-radius: 999px;
  background: var(--color-ink);
  color: var(--color-paper);
  font: inherit;
  cursor: pointer;
  transform: translateX(-50%);
  box-shadow: 0 14px 30px -12px rgb(46 42 37 / 45%);
  transition: transform 200ms var(--ease-soft);
}

.mp__go:hover {
  transform: translateX(-50%) translateY(-2px);
  box-shadow: 0 20px 40px -14px rgb(46 42 37 / 50%);
}

.mp__go:active {
  transform: translateX(-50%) scale(0.98);
}

.mp__goMain {
  font-family: var(--font-display);
  font-size: 1.25rem;
}

.mp__goMeta {
  font-family: var(--font-body);
  font-size: 0.6875rem;
  opacity: 0.7;
}

/* ---- 折线以下：压扁 ---- */
.mp__below {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 0.25rem 4rem;
}

.mp__tally {
  margin: 0;
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--color-ink-faint);
}

.mp__recent {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0 0 0 auto;
  padding: 0;
  list-style: none;
}

.mp__recentItem {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border: 0;
  border-radius: 999px;
  background: var(--color-surface);
  font: inherit;
  font-size: 0.75rem;
  color: var(--color-ink-soft);
  cursor: pointer;
  transition: transform 160ms var(--ease-soft);
}

.mp__recentItem:hover {
  transform: translateY(-1px);
}

.mp__recentItem:active {
  transform: scale(0.97);
}

.mp__recentStars {
  font-family: var(--font-numeric);
  color: var(--color-star-deep);
}

@keyframes mp-plant {
  from {
    opacity: 0;
    transform: translateY(-6px) scale(0.94);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes mp-appear {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.92);
  }

  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
</style>
