<script setup lang="ts">
import { computed } from 'vue'

import { toneVars } from '@/domain'
import { KIcon } from '@/ui'
import { useHomePrototypeData } from '../useHomePrototypeData'

/**
 * 变体 A —— 展览馆
 * ================
 *
 * 分歧轴：**版式与留白**
 *
 * 做法：整页没有一张卡片 —— 没有描边、没有投影、没有圆角盒子。
 * 分隔靠的是**尺度、空白和发丝线**，像美术馆墙上的展签。
 * 页面只有一个焦点（超大字号的孩子名字 + 一个主任务），其余内容降级成编号目录。
 *
 * 为什么这可能治好「AI 感」：AI 生成最典型的信号就是「所有东西都是等大的卡片」。
 * 这个方向把卡片整个删了，所以没有任何两样东西长得一样。
 */
const {
  profile,
  grade,
  todayTopics,
  today,
  growth,
  gradeTopics,
  completedTopics,
  mapNodes,
  mapTitle,
  topicTone,
  countLessons,
  enterTopic,
  recent,
  openLesson,
} = useHomePrototypeData()

/** 主任务 = 第一个推荐；其余降级成目录 */
const lead = computed(() => todayTopics.value[0])
const rest = computed(() => todayTopics.value.slice(1))

const progressPercent = computed(() =>
  gradeTopics.value.length === 0
    ? 0
    : Math.round((completedTopics.value / gradeTopics.value.length) * 100),
)

/** 编号：01 / 02 / 03 */
function ordinal(index: number): string {
  return String(index + 1).padStart(2, '0')
}
</script>

<template>
  <div class="exh">
    <!-- 报头：年级是一行小字眉标，孩子名字是整页最大的东西 -->
    <header class="exh__masthead">
      <p class="exh__eyebrow">
        {{ grade?.name }} · {{ grade?.ageRange }}
      </p>
      <h1 class="exh__title">
        {{ profile.nickname }}
      </h1>
      <p class="exh__lede">
        {{ grade?.tagline }}
      </p>
    </header>

    <!-- 一行数据，像展签下的一行注脚；数字大、单位小 -->
    <dl class="exh__figures">
      <div class="exh__figure">
        <dt>今天</dt>
        <dd><span class="exh__num">{{ today.minutes }}</span> 分钟</dd>
      </div>
      <div class="exh__figure">
        <dt>完成</dt>
        <dd><span class="exh__num">{{ today.lessons }}</span> 个探索</dd>
      </div>
      <div class="exh__figure">
        <dt>星星</dt>
        <dd><span class="exh__num">{{ growth.stars }}</span> 颗</dd>
      </div>
      <div class="exh__figure">
        <dt>连续</dt>
        <dd><span class="exh__num">{{ growth.streakDays }}</span> 天</dd>
      </div>
    </dl>

    <!-- 主焦点：今天的那一件事，用编号 + 极大标题 + 一条走向它的线 -->
    <section v-if="lead" class="exh__lead" :style="toneVars(topicTone(lead))">
      <p class="exh__index">
        {{ ordinal(0) }} — 今天要探索
      </p>
      <button type="button" class="exh__leadButton" @click="enterTopic(lead)">
        <span class="exh__leadTitle">{{ lead.title }}</span>
        <span class="exh__leadMeta">
          {{ countLessons(lead) }} 节 · {{ lead.objectives[0] }}
        </span>
        <KIcon name="arrow-right" size="md" class="exh__leadArrow" />
      </button>
    </section>

    <!-- 其余任务降级成编号目录：一行一条，发丝线分隔 -->
    <section v-if="rest.length > 0" class="exh__list">
      <p class="exh__index">
        接下来
      </p>
      <ul>
        <li v-for="(topic, index) in rest" :key="topic.id">
          <button type="button" class="exh__row" :style="toneVars(topicTone(topic))" @click="enterTopic(topic)">
            <span class="exh__rowIndex">{{ ordinal(index + 1) }}</span>
            <span class="exh__rowTitle">{{ topic.title }}</span>
            <span class="exh__rowMeta">{{ countLessons(topic) }} 节</span>
          </button>
        </li>
      </ul>
    </section>

    <!-- 地图不画地图，画成目录：像一本书的目次 -->
    <section class="exh__contents">
      <p class="exh__index">
        {{ mapTitle }} · 走过了 {{ completedTopics }}/{{ gradeTopics.length }} 个主题（{{ progressPercent }}%）
      </p>
      <ul>
        <li v-for="node in mapNodes" :key="node.worldId">
          <div class="exh__row exh__row--static" :style="toneVars(node.tone)">
            <span class="exh__rowTitle">{{ node.name }}</span>
            <span class="exh__leader" aria-hidden="true" />
            <span class="exh__rowMeta">
              {{ node.total === 0 ? '内容准备中' : `${node.done}/${node.total}` }}
            </span>
          </div>
        </li>
      </ul>
    </section>

    <!-- 最近玩过的：需求要求首页有「最近课程」，三个方向都带上，比较才公平 -->
    <section v-if="recent.length > 0" class="exh__list">
      <p class="exh__index">
        最近玩过
      </p>
      <ul>
        <li v-for="item in recent" :key="item.completion.lessonId">
          <button
            type="button"
            class="exh__row"
            @click="openLesson(item.completion.lessonId)"
          >
            <span class="exh__rowTitle">{{ item.lesson?.title ?? '一节课' }}</span>
            <span class="exh__rowMeta">{{ item.completion.stars }} 星</span>
          </button>
        </li>
      </ul>
    </section>

    <p class="exh__colophon">
      {{ grade?.nextHint }}
    </p>
  </div>
</template>

<style scoped>
/*
  这个变体刻意不用任何一张卡片：没有 border、没有 box-shadow、没有圆角盒子。
  唯一的「线」是发丝分隔线，唯一的「色」是主任务上的一个强调色。
*/
.exh {
  max-width: 46rem;
  margin: 0 auto;
  padding: 3rem 0 5rem;
  color: var(--color-ink);
}

.exh__masthead {
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--color-line);
}

.exh__eyebrow {
  margin: 0 0 0.75rem;
  font-family: var(--font-body);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  color: var(--color-ink-faint);
  text-transform: uppercase;
}

/* 整页最大的东西：孩子自己的名字 */
.exh__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(3.5rem, 11vw, 6rem);
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: -0.02em;
}

.exh__lede {
  margin: 1rem 0 0;
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-ink-soft);
}

.exh__figures {
  display: flex;
  flex-wrap: wrap;
  gap: 2.5rem;
  margin: 0;
  padding: 1.75rem 0;
  border-bottom: 1px solid var(--color-line);
}

.exh__figure dt {
  font-family: var(--font-body);
  font-size: 0.6875rem;
  letter-spacing: 0.18em;
  color: var(--color-ink-faint);
  text-transform: uppercase;
}

.exh__figure dd {
  margin: 0.35rem 0 0;
  font-family: var(--font-body);
  font-size: 0.8125rem;
  color: var(--color-ink-soft);
}

/* 数字大、单位小 —— 一行注脚里的层级 */
.exh__num {
  font-family: var(--font-numeric);
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-ink);
}

.exh__index {
  margin: 2.75rem 0 1rem;
  font-family: var(--font-body);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  color: var(--color-ink-faint);
  text-transform: uppercase;
}

/* 主焦点：不要盒子，要一堵墙 */
.exh__leadButton {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition:
    transform 200ms var(--ease-soft),
    opacity 200ms var(--ease-soft);
}

.exh__leadButton:hover {
  transform: translateX(6px);
}

.exh__leadButton:active {
  transform: translateX(2px) scale(0.975);
}

.exh__leadTitle {
  display: block;
  max-width: 24ch;
  font-family: var(--font-display);
  font-size: clamp(2rem, 5.5vw, 3.25rem);
  line-height: 1.08;
  color: var(--tone-deep);
}

.exh__leadMeta {
  display: block;
  margin-top: 0.875rem;
  max-width: 40ch;
  font-family: var(--font-body);
  font-size: 0.9375rem;
  color: var(--color-ink-soft);
}

.exh__leadArrow {
  display: inline-block;
  margin-top: 1.25rem;
  font-size: 1.5rem;
  color: var(--tone);
}

/* 编号目录：一行一条，发丝线分隔，缩进对齐 */
.exh__list ul,
.exh__contents ul {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--color-line);
}

.exh__list li,
.exh__contents li {
  border-bottom: 1px solid var(--color-line);
}

.exh__row {
  display: flex;
  align-items: baseline;
  gap: 1.25rem;
  width: 100%;
  padding: 1.125rem 0.25rem;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: transform 180ms var(--ease-soft);
}

/* hover 用位移表达「指到了这一条」——动 transform，不是 padding（那会触发重排） */
.exh__row:hover {
  transform: translateX(0.5rem);
}

.exh__row:active {
  transform: translateX(0.5rem) scale(0.975);
}

.exh__row--static {
  cursor: default;
}

.exh__row--static:hover,
.exh__row--static:active {
  transform: none;
}

.exh__rowIndex {
  font-family: var(--font-numeric);
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-ink-faint);
}

.exh__rowTitle {
  font-family: var(--font-display);
  font-size: 1.375rem;
  color: var(--color-ink);
}

.exh__rowMeta {
  margin-left: auto;
  font-family: var(--font-body);
  font-size: 0.8125rem;
  color: var(--color-ink-faint);
  white-space: nowrap;
}

/* 目次里的引导点：把名字和数字连起来 */
.exh__leader {
  flex: 1;
  height: 1px;
  margin: 0 0.5rem;
  background-image: radial-gradient(circle, var(--color-line-strong) 1px, transparent 1px);
  background-size: 6px 1px;
}

.exh__colophon {
  margin: 3rem 0 0;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-line);
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--color-ink-faint);
}

/* 入场：一次错峰的浮现，不是逐块弹跳 */
.exh__masthead,
.exh__figures,
.exh__lead,
.exh__list,
.exh__contents {
  animation: exh-rise 240ms var(--ease-soft) both;
}

.exh__figures {
  animation-delay: 40ms;
}

.exh__lead {
  animation-delay: 80ms;
}

.exh__list {
  animation-delay: 120ms;
}

.exh__contents {
  animation-delay: 160ms;
}

@keyframes exh-rise {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
