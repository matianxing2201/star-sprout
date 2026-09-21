<script setup lang="ts">
import { computed } from 'vue'

import { toneVars } from '@/domain'
import { MascotAvatar } from '@/features/mascot'
import { KIcon } from '@/ui'
import { useHomePrototypeData } from '../useHomePrototypeData'

/**
 * 变体 B —— 立体书
 * ================
 *
 * 分歧轴：**材质与层叠**
 *
 * 做法：**整页没有一条实心描边**。厚度全靠层叠的半透明阴影讲：
 * 一张纸压在另一张纸上，边缘投出两三层深浅不一的影子。
 * 元素之间**相互叠压、各自轻微旋转**，像一本摊开的立体书；
 * 地图是一张有折痕的纸。
 *
 * 为什么这可能治好「AI 感」：现状是「描边 + 一层硬投影」这一套配方复制了 46 遍。
 * 描边是「画上去的线」，阴影是「纸与纸之间的关系」—— 后者有物理，前者没有。
 */
const {
  profile,
  grade,
  mascot,
  todayTopics,
  today,
  growth,
  gradeTopics,
  completedTopics,
  mapNodes,
  mapTitle,
  topicTone,
  topicIcon,
  countLessons,
  enterTopic,
  recent,
  openLesson,
  openWorld,
} = useHomePrototypeData()

const lead = computed(() => todayTopics.value[0])
const rest = computed(() => todayTopics.value.slice(1))

/** 每张任务纸片给一点不同的旋转，堆起来才像手工叠的 */
const TILTS = [-1.4, 1.1, -0.7] as const

function tiltOf(index: number): string {
  return `${TILTS[index % TILTS.length]}deg`
}

const progressPercent = computed(() =>
  gradeTopics.value.length === 0
    ? 0
    : Math.round((completedTopics.value / gradeTopics.value.length) * 100),
)
</script>

<template>
  <div class="pop">
    <!-- 标题纸与角色纸故意叠在一起：角色压在标题上，像从书里探出来 -->
    <header class="pop__stage">
      <div class="pop__titleSheet" :style="toneVars(grade?.tone ?? 'language')">
        <p class="pop__eyebrow">
          {{ grade?.name }} · 今天想去哪里？
        </p>
        <h1 class="pop__title">
          {{ profile.nickname }} 的学习世界
        </h1>
        <p class="pop__lede">
          {{ grade?.tagline }}
        </p>
      </div>

      <div class="pop__mascotSheet">
        <MascotAvatar :id="mascot.id" size="xl" mood="happy" />
        <p class="pop__mascotLine">
          {{ grade?.nextHint }}
        </p>
      </div>
    </header>

    <!-- 数据作为三张压在一起的小纸条 -->
    <dl class="pop__slips">
      <div class="pop__slip" style="--tilt: -1.8deg">
        <dt>今天学了</dt>
        <dd>{{ today.minutes }} 分钟</dd>
      </div>
      <div class="pop__slip" style="--tilt: 0.9deg">
        <dt>完成</dt>
        <dd>{{ today.lessons }} 个</dd>
      </div>
      <div class="pop__slip" style="--tilt: -0.6deg">
        <dt>星星</dt>
        <dd>{{ growth.stars }} 颗</dd>
      </div>
      <div class="pop__slip" style="--tilt: 1.4deg">
        <dt>连续</dt>
        <dd>{{ growth.streakDays }} 天</dd>
      </div>
    </dl>

    <!-- 任务：一叠相互压着的纸片，越往下越靠后、越歪 -->
    <section class="pop__stack">
      <p class="pop__sectionLabel">
        今天要探索
      </p>

      <button
        v-if="lead"
        type="button"
        class="pop__sheet pop__sheet--lead"
        :style="{ ...toneVars(topicTone(lead)), '--tilt': '-0.8deg' }"
        @click="enterTopic(lead)"
      >
        <span class="pop__sheetTop">
          <KIcon :name="topicIcon(lead)" size="md" class="pop__sheetIcon" />
          <span class="pop__sheetTitle">{{ lead.title }}</span>
        </span>
        <span class="pop__sheetMeta">{{ countLessons(lead) }} 节 · {{ lead.objectives[0] }}</span>
      </button>

      <button
        v-for="(topic, index) in rest"
        :key="topic.id"
        type="button"
        class="pop__sheet pop__sheet--under"
        :style="{ ...toneVars(topicTone(topic)), '--tilt': tiltOf(index + 1) }"
        @click="enterTopic(topic)"
      >
        <span class="pop__sheetTop">
          <span class="pop__sheetTitle">{{ topic.title }}</span>
          <span class="pop__sheetMeta">{{ countLessons(topic) }} 节</span>
        </span>
      </button>
    </section>

    <!-- 地图：一张有折痕的纸。折痕用一条渐变缝表达，不是画一条线 -->
    <section class="pop__page" :style="toneVars(grade?.tone ?? 'language')">
      <p class="pop__sectionLabel">
        {{ mapTitle }}
      </p>
      <p class="pop__pageMeta">
        走过了 {{ completedTopics }} 个主题 · 还有 {{ gradeTopics.length - completedTopics }} 个在等你（{{ progressPercent }}%）
      </p>

      <ul class="pop__worlds">
        <li v-for="node in mapNodes" :key="node.worldId">
          <button
            type="button"
            class="pop__world"
            :style="toneVars(node.tone)"
            :disabled="node.lockedInFog"
            @click="openWorld(node.worldId)"
          >
            <span class="pop__worldName">{{ node.name }}</span>
            <span class="pop__worldTally">
              {{ node.lockedInFog ? '还没解锁' : node.total === 0 ? '内容准备中' : `${node.done}/${node.total}` }}
            </span>
          </button>
        </li>
      </ul>
    </section>

    <!-- 最近玩过的：需求要求首页有「最近课程」，三个方向都带上，比较才公平 -->
    <section v-if="recent.length > 0" class="pop__recent">
      <p class="pop__sectionLabel">
        最近玩过
      </p>
      <ul class="pop__recentList">
        <li v-for="(item, index) in recent" :key="item.completion.lessonId">
          <button
            type="button"
            class="pop__sheet pop__sheet--slim"
            :style="{ '--tilt': tiltOf(index) }"
            @click="openLesson(item.completion.lessonId)"
          >
            <span class="pop__sheetTop">
              <span class="pop__sheetTitle pop__sheetTitle--slim">{{ item.lesson?.title ?? '一节课' }}</span>
              <span class="pop__sheetMeta">{{ item.completion.stars }} 星</span>
            </span>
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
/*
  这个变体的核心：**没有 border**。
  厚度用三层半透明阴影讲：贴纸边缘的 1px、抬起后的 4px、以及最外层的柔光。
*/
.pop {
  --sheet-shadow:
    0 1px 1px rgb(46 42 37 / 6%), 0 4px 10px -2px rgb(46 42 37 / 10%), 0 14px 30px -12px rgb(46 42 37 / 22%);
  --sheet-shadow-lift:
    0 2px 2px rgb(46 42 37 / 7%), 0 8px 18px -4px rgb(46 42 37 / 13%), 0 26px 50px -18px rgb(46 42 37 / 26%);

  max-width: 54rem;
  margin: 0 auto;
  padding: 2.5rem 0 5rem;
  color: var(--color-ink);
}

/* ---- 标题纸 + 角色纸：叠压 ---- */
.pop__stage {
  position: relative;
  padding-bottom: 4.5rem;
}

.pop__titleSheet {
  padding: 2.25rem 2.5rem 3rem;
  border-radius: 28px;
  background: var(--color-surface);
  box-shadow: var(--sheet-shadow);
  transform: rotate(-0.5deg);
}

.pop__eyebrow {
  margin: 0 0 0.75rem;
  font-family: var(--font-body);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  color: var(--color-ink-faint);
  text-transform: uppercase;
}

.pop__title {
  margin: 0;
  max-width: 20ch;
  font-family: var(--font-display);
  font-size: clamp(2.25rem, 6vw, 3.5rem);
  font-weight: 400;
  line-height: 1.05;
}

.pop__lede {
  margin: 0.875rem 0 0;
  font-family: var(--font-body);
  color: var(--color-ink-soft);
}

/* 角色纸压在标题纸右下角，两者有重叠 */
.pop__mascotSheet {
  position: absolute;
  right: 1rem;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  max-width: 24rem;
  padding: 1rem 1.25rem;
  border-radius: 22px;
  background: var(--color-paper-deep);
  box-shadow: var(--sheet-shadow-lift);
  transform: rotate(1.6deg);
}

.pop__mascotLine {
  margin: 0;
  font-family: var(--font-body);
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--color-ink-soft);
}

/* ---- 数据纸条 ---- */
.pop__slips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.875rem;
  margin: 2.5rem 0 0;
}

.pop__slip {
  flex: 0 0 auto;
  padding: 0.75rem 1.125rem;
  border-radius: 16px;
  background: var(--color-surface);
  box-shadow: var(--sheet-shadow);
  transform: rotate(var(--tilt, 0deg));
}

.pop__slip dt {
  font-family: var(--font-body);
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  color: var(--color-ink-faint);
  text-transform: uppercase;
}

.pop__slip dd {
  margin: 0.2rem 0 0;
  font-family: var(--font-numeric);
  font-size: 1.25rem;
  font-weight: 800;
}

/* ---- 任务纸叠 ---- */
.pop__sectionLabel {
  margin: 3rem 0 1.125rem;
  font-family: var(--font-body);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  color: var(--color-ink-faint);
  text-transform: uppercase;
}

.pop__stack {
  display: flex;
  flex-direction: column;
}

/* 负 margin 让纸片相互压住 */
.pop__sheet {
  display: block;
  width: 100%;
  padding: 1.5rem 1.75rem;
  border: 0;
  border-radius: 24px;
  background: var(--color-surface);
  box-shadow: var(--sheet-shadow);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transform: rotate(var(--tilt, 0deg));
  transition: transform 240ms var(--ease-soft);
}

.pop__sheet--lead {
  position: relative;
  z-index: 3;
  background: var(--tone-soft);
  box-shadow: var(--sheet-shadow-lift);
}

.pop__sheet--under {
  z-index: 1;
}

.pop__sheet--under + .pop__sheet--under {
  margin-top: -0.75rem;
}

.pop__sheet:hover {
  transform: rotate(0deg) translateY(-3px);
  box-shadow: var(--sheet-shadow-lift);
}

.pop__sheet:active {
  transform: rotate(0deg) scale(0.975);
}

.pop__sheetTop {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pop__sheetTitle {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--color-ink);
}

.pop__sheet--lead .pop__sheetTitle {
  font-size: clamp(1.75rem, 4.5vw, 2.25rem);
  color: var(--tone-deep);
}

.pop__sheetIcon {
  color: var(--tone);
}

.pop__recent {
  margin-top: 3rem;
}

.pop__recentList {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pop__sheet--slim {
  padding: 0.875rem 1.125rem;
  border-radius: 18px;
}

.pop__sheetTitle--slim {
  font-size: 1.0625rem;
}

.pop__sheet--slim .pop__sheetMeta {
  margin-top: 0;
  font-family: var(--font-numeric);
  font-size: 0.75rem;
  color: var(--color-star-deep);
}

.pop__sheetMeta {
  display: block;
  margin-top: 0.5rem;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--color-ink-soft);
}

/* ---- 地图纸：折痕用渐变缝，不是画一条线 ---- */
.pop__page {
  position: relative;
  margin-top: 3.5rem;
  padding: 2rem 2.25rem 2.5rem;
  border-radius: 26px;
  background: linear-gradient(180deg, rgb(255 255 255 / 55%), rgb(255 255 255 / 0%) 45%), var(--color-paper-deep);
  box-shadow: var(--sheet-shadow);
}

/* 折痕：纸中间一道极淡的暗缝 */
.pop__page::before {
  position: absolute;
  top: 8%;
  bottom: 8%;
  left: 50%;
  width: 1px;
  content: '';
  background: linear-gradient(180deg, transparent, rgb(46 42 37 / 9%) 20%, rgb(46 42 37 / 9%) 80%, transparent);
}

.pop__pageMeta {
  margin: 0 0 1.5rem;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--color-ink-soft);
}

.pop__worlds {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pop__world {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 1rem;
  border: 0;
  border-radius: 16px;
  background: var(--color-surface);
  box-shadow: var(--sheet-shadow);
  font: inherit;
  cursor: pointer;
  transition: transform 200ms var(--ease-soft);
}

.pop__world:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--sheet-shadow-lift);
}

.pop__world:active:not(:disabled) {
  transform: scale(0.975);
}

.pop__world:disabled {
  cursor: default;
  opacity: 0.55;
  box-shadow: none;
}

.pop__worldName {
  font-family: var(--font-display);
  font-size: 1.0625rem;
  color: var(--tone-deep);
}

.pop__worldTally {
  font-family: var(--font-numeric);
  font-size: 0.75rem;
  color: var(--color-ink-faint);
  white-space: nowrap;
}

/* 入场：纸片依次落下，各自从自己的旋转角淡入 */
.pop__titleSheet,
.pop__mascotSheet,
.pop__slip,
.pop__sheet,
.pop__page {
  animation: pop-settle 260ms var(--ease-soft) both;
}

.pop__mascotSheet {
  animation-delay: 60ms;
}

.pop__slip:nth-child(1) {
  animation-delay: 80ms;
}
.pop__slip:nth-child(2) {
  animation-delay: 110ms;
}
.pop__slip:nth-child(3) {
  animation-delay: 140ms;
}
.pop__slip:nth-child(4) {
  animation-delay: 170ms;
}

.pop__page {
  animation-delay: 200ms;
}

@keyframes pop-settle {
  from {
    opacity: 0;
    transform: translateY(10px) rotate(var(--tilt, 0deg)) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) rotate(var(--tilt, 0deg)) scale(1);
  }
}
</style>
