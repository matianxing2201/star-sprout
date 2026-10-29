<script setup lang="ts">
import { computed, ref } from 'vue'

import { ROUTE_NAMES } from '@/app/router/route-names'
import { READINESS_DOMAINS, READINESS_STAGES } from '@/content/readiness-curriculum'
import { KButton, KIcon } from '@/ui'

const selectedDomainId = ref('language')
const selectedStageId = ref('A')
const selectedDomain = computed(() => READINESS_DOMAINS.find(domain => domain.id === selectedDomainId.value) ?? READINESS_DOMAINS[0]!)
</script>

<template>
  <div class="readiness-page flex flex-col gap-7">
    <section class="trail-hero relative overflow-hidden rounded-blob border-2 border-line bg-language-soft shadow-sticker">
      <div class="trail-land trail-land-back" aria-hidden="true" />
      <div class="trail-land trail-land-front" aria-hidden="true" />
      <div class="relative z-10 grid gap-7 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-10 lg:py-9">
        <div>
          <div class="flex items-center gap-2 font-body text-xs font-bold tracking-[0.18em] text-language-deep">
            <KIcon name="ladder" size="sm" />
            成长准备路线图
          </div>
          <h1 class="mt-3 max-w-xl font-display text-4xl leading-tight text-ink sm:text-5xl">
            一起走过<br><span class="text-language-deep">上小学前的每一步</span>
          </h1>
          <p class="mt-4 max-w-lg font-body text-sm leading-7 text-ink-soft sm:text-base">
            先浏览完整的学习分类目录。中班语文启蒙已经准备了三节互动样例课。
          </p>
          <div class="mt-5 flex flex-wrap gap-2">
            <span class="hero-mark"><KIcon name="book-open" size="sm" /> {{ READINESS_DOMAINS.length }} 大领域</span>
            <span class="hero-mark"><KIcon name="puzzle" size="sm" /> {{ READINESS_DOMAINS.reduce((total, domain) => total + domain.modules.length, 0) }} 个分类模块</span>
            <span class="hero-mark"><KIcon name="calendar" size="sm" /> 3 节可玩语文课</span>
          </div>
        </div>

        <div class="stage-route" aria-label="幼小衔接三个学习阶段">
          <div class="route-line" aria-hidden="true" />
          <button
            v-for="(stage, index) in READINESS_STAGES"
            :key="stage.id"
            type="button"
            class="stage-stop fx-pressable"
            :class="[`stage-stop-${stage.id.toLowerCase()}`, { 'stage-stop-active': selectedStageId === stage.id }]"
            :aria-pressed="selectedStageId === stage.id"
            @click="selectedStageId = stage.id"
          >
            <span class="stage-stamp">{{ index + 1 }}</span>
            <span class="stage-copy">
              <strong>{{ stage.label }}</strong>
              <small>{{ stage.description }}</small>
            </span>
            <KIcon name="arrow-right" size="sm" />
          </button>
        </div>
      </div>
      <span class="hero-sun" aria-hidden="true">☀️</span>
      <span class="hero-cloud hero-cloud-one" aria-hidden="true">☁️</span>
      <span class="hero-cloud hero-cloud-two" aria-hidden="true">☁️</span>
    </section>

    <section class="domain-section">
      <div class="section-heading">
        <div>
          <p class="section-kicker">
            THE BIG PICTURE · 八个方向
          </p>
          <h2>学习分类目录</h2>
        </div>
        <p class="section-aside">
          选择一个领域，查看下面的分类模块。
        </p>
      </div>

      <div class="domain-ribbon" role="tablist" aria-label="幼小衔接领域">
        <button
          v-for="(domain, index) in READINESS_DOMAINS"
          :key="domain.id"
          type="button"
          role="tab"
          :aria-selected="selectedDomainId === domain.id"
          class="domain-stop fx-pressable"
          :class="{ 'domain-stop-active': selectedDomainId === domain.id }"
          @click="selectedDomainId = domain.id"
        >
          <span class="domain-number">0{{ index + 1 }}</span>
          <span class="domain-glyph"><KIcon :name="domain.icon" size="md" /></span>
          <span class="domain-label">{{ domain.title }}</span>
          <span class="domain-count">{{ domain.modules.length }} 个模块</span>
        </button>
      </div>
    </section>

    <section class="map-workbench" :style="{ '--map-tone': `var(--color-${selectedDomain.tone})`, '--map-tone-soft': `var(--color-${selectedDomain.tone}-soft)`, '--map-tone-deep': `var(--color-${selectedDomain.tone}-deep)` }">
      <div class="workbench-head">
        <div class="workbench-title">
          <span class="workbench-icon"><KIcon :name="selectedDomain.icon" size="lg" /></span>
          <div>
            <p class="section-kicker">
              {{ READINESS_STAGES.find(stage => stage.id === selectedStageId)?.label }} · 分类目录
            </p>
            <h2>{{ selectedDomain.title }}</h2>
            <p>{{ selectedDomain.summary }}</p>
          </div>
        </div>
        <KButton
          v-if="selectedDomain.id === 'language' && selectedStageId === 'A'"
          variant="primary"
          size="sm"
          :to="{ name: ROUTE_NAMES.courseMap, params: { gradeId: 'nursery', categoryId: 'nursery-language' } }"
        >
          进入中班语文启蒙 <KIcon name="arrow-right" size="sm" />
        </KButton>
        <span v-else class="directory-badge"><KIcon name="list-checks" size="sm" /> {{ selectedDomain.id === 'language' ? '该阶段课程待补充' : '目录结构已保留' }}</span>
      </div>

      <div class="module-overview">
        <div class="overview-copy">
          <span class="overview-illustration" aria-hidden="true">🌱</span>
          <strong>{{ selectedDomain.id === 'language' && selectedStageId === 'A' ? '今天想玩哪一节？' : '课程内容待逐步补充' }}</strong>
          <p>{{ selectedDomain.id === 'language' && selectedStageId === 'A' ? '进入语文启蒙，和小伙伴一起听、找、配对、表达。' : '这里先保留分类，之后可以按每天的学习安排继续添加内容。' }}</p>
        </div>
        <ol class="module-list">
          <li v-for="(module, index) in selectedDomain.modules" :key="module">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>{{ module }}
          </li>
        </ol>
      </div>
    </section>

    <footer class="map-footer">
      <KIcon name="plant" size="md" />
      <p>每天一小步，沿着孩子的兴趣逐步补充。<strong>准备好时，再去下一站。</strong></p>
      <KButton variant="ghost" size="sm" :to="{ name: ROUTE_NAMES.home }">
        回到学习世界
      </KButton>
    </footer>
  </div>
</template>

<style scoped>
.trail-hero {
  min-height: 330px;
  isolation: isolate;
}
.trail-land {
  position: absolute;
  right: -3%;
  bottom: -90px;
  left: -3%;
  height: 230px;
  pointer-events: none;
  border-radius: 50% 50% 0 0 / 38% 38% 0 0;
}
.trail-land-back {
  right: -12%;
  bottom: -120px;
  background: color-mix(in srgb, var(--color-language) 13%, var(--color-paper));
  transform: rotate(-5deg);
}
.trail-land-front {
  left: 44%;
  bottom: -152px;
  height: 250px;
  background: color-mix(in srgb, var(--color-language) 20%, var(--color-paper));
  transform: rotate(8deg);
}
.hero-sun,
.hero-cloud {
  position: absolute;
  z-index: 0;
  pointer-events: none;
  user-select: none;
}
.hero-sun {
  top: 24px;
  right: 13%;
  font-size: 2.25rem;
}
.hero-cloud {
  font-size: 1.5rem;
  opacity: 0.78;
}
.hero-cloud-one {
  top: 68px;
  right: 29%;
}
.hero-cloud-two {
  top: 34px;
  right: 3%;
  font-size: 1.1rem;
}
.hero-mark {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid color-mix(in srgb, var(--color-language-deep) 18%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-paper) 72%, transparent);
  padding: 0.45rem 0.7rem;
  color: var(--color-language-deep);
  font-size: 0.72rem;
  font-weight: 700;
}
.stage-route {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding-left: 0.8rem;
}
.route-line {
  position: absolute;
  top: 1rem;
  bottom: 1rem;
  left: 1.55rem;
  border-left: 2px dashed color-mix(in srgb, var(--color-language-deep) 34%, transparent);
}
.stage-stop {
  position: relative;
  display: grid;
  grid-template-columns: 2.1rem 1fr auto;
  align-items: center;
  gap: 0.75rem;
  min-height: 67px;
  border: 1px solid color-mix(in srgb, var(--color-language-deep) 13%, transparent);
  border-radius: 1.1rem;
  background: color-mix(in srgb, var(--color-paper) 86%, transparent);
  padding: 0.7rem 0.9rem;
  text-align: left;
  box-shadow: 0 3px 0 color-mix(in srgb, var(--color-language-deep) 9%, transparent);
}
.stage-stop-active {
  outline: 2px solid var(--color-language-deep);
  outline-offset: 2px;
}
.stage-stamp {
  z-index: 1;
  display: grid;
  width: 2rem;
  aspect-ratio: 1;
  place-items: center;
  border: 2px solid var(--color-paper);
  border-radius: 50%;
  background: var(--color-language);
  color: var(--color-paper);
  font-family: var(--font-numeric);
  font-weight: 800;
}
.stage-stop-b .stage-stamp {
  background: var(--color-star);
  color: var(--color-ink);
}
.stage-stop-c .stage-stamp {
  background: var(--color-social);
}
.stage-copy {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.stage-copy strong {
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: 0.98rem;
}
.stage-copy small {
  color: var(--color-ink-soft);
  font-size: 0.7rem;
}
.stage-stop > :last-child {
  color: var(--color-language-deep);
}
.section-heading,
.workbench-head,
.workbench-title,
.map-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.section-heading h2,
.workbench-title h2 {
  margin: 0.25rem 0 0;
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: 1.45rem;
}
.section-kicker {
  margin: 0;
  color: var(--color-ink-faint);
  font-size: 0.67rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}
.section-aside {
  margin: 0;
  color: var(--color-ink-faint);
  font-size: 0.75rem;
}
.domain-ribbon {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
  margin-top: 1rem;
}
.domain-stop {
  position: relative;
  display: grid;
  grid-template-columns: 2.7rem 1fr;
  grid-template-rows: auto auto;
  align-items: center;
  column-gap: 0.7rem;
  min-height: 76px;
  border: 1.5px solid var(--color-line);
  border-radius: 1.2rem;
  background: var(--color-surface);
  padding: 0.7rem;
  text-align: left;
  box-shadow: 0 3px 0 color-mix(in srgb, var(--color-ink) 7%, transparent);
}
.domain-stop-active {
  border-color: var(--color-language-deep);
  background: var(--color-language-soft);
  box-shadow: 0 4px 0 color-mix(in srgb, var(--color-language-deep) 15%, transparent);
}
.domain-number {
  position: absolute;
  top: 0.35rem;
  right: 0.55rem;
  color: var(--color-ink-faint);
  font-family: var(--font-numeric);
  font-size: 0.58rem;
  font-weight: 800;
}
.domain-glyph {
  grid-row: 1 / 3;
  display: grid;
  width: 2.55rem;
  aspect-ratio: 1;
  place-items: center;
  border-radius: 0.9rem;
  background: var(--color-paper);
  color: var(--color-language-deep);
}
.domain-label {
  align-self: end;
  padding-right: 0.6rem;
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: 0.9rem;
  font-weight: 700;
}
.domain-count {
  align-self: start;
  color: var(--color-ink-faint);
  font-size: 0.65rem;
}
.map-workbench {
  border: 2px solid var(--color-line);
  border-radius: 1.7rem;
  background: var(--color-surface);
  padding: 1.1rem;
  box-shadow: 0 7px 0 color-mix(in srgb, var(--color-ink) 6%, transparent);
}
.workbench-title {
  justify-content: flex-start;
}
.workbench-icon {
  display: grid;
  width: 3.15rem;
  aspect-ratio: 1;
  flex: none;
  place-items: center;
  border-radius: 1.1rem;
  background: var(--map-tone-soft);
  color: var(--map-tone-deep);
}
.workbench-title > div > p:last-child {
  margin: 0.35rem 0 0;
  color: var(--color-ink-soft);
  font-size: 0.78rem;
}
.directory-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 999px;
  background: var(--map-tone-soft);
  padding: 0.5rem 0.75rem;
  color: var(--map-tone-deep);
  font-size: 0.7rem;
  font-weight: 800;
  white-space: nowrap;
}
.module-overview {
  display: grid;
  gap: 1rem;
  margin-top: 1.25rem;
}
.overview-copy {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  column-gap: 0.7rem;
  border-radius: 1rem;
  background: var(--map-tone-soft);
  padding: 0.9rem;
}
.overview-illustration {
  grid-row: 1 / 3;
  font-size: 1.5rem;
}
.overview-copy strong {
  color: var(--map-tone-deep);
  font-family: var(--font-display);
  font-size: 0.9rem;
}
.overview-copy p {
  margin: 0.2rem 0 0;
  color: var(--color-ink-soft);
  font-size: 0.72rem;
  line-height: 1.5;
}
.module-list {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.module-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 2.8rem;
  border: 1px solid var(--color-line);
  border-radius: 0.85rem;
  background: var(--color-paper);
  padding: 0.55rem 0.7rem;
  color: var(--color-ink);
  font-size: 0.78rem;
}
.module-list li span {
  display: grid;
  width: 1.65rem;
  aspect-ratio: 1;
  flex: none;
  place-items: center;
  border-radius: 50%;
  background: var(--map-tone-soft);
  color: var(--map-tone-deep);
  font-family: var(--font-numeric);
  font-size: 0.62rem;
  font-weight: 800;
}
.map-footer {
  border-radius: 1rem;
  background: var(--color-paper);
  padding: 0.8rem 1rem;
  color: var(--color-ink-soft);
}
.map-footer > :first-child {
  flex: none;
  color: var(--color-life-deep);
}
.map-footer p {
  flex: 1;
  margin: 0;
  font-size: 0.72rem;
  line-height: 1.5;
}
.map-footer strong {
  color: var(--color-ink);
}
@media (min-width: 640px) {
  .domain-ribbon {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .map-workbench {
    padding: 1.5rem;
  }
  .module-overview {
    grid-template-columns: minmax(220px, 0.75fr) 1.25fr;
    align-items: start;
  }
}
@media (max-width: 639px) {
  .section-heading,
  .workbench-head,
  .map-footer {
    align-items: flex-start;
    flex-direction: column;
  }
  .directory-badge {
    align-self: flex-start;
  }
  .map-footer .k-button {
    align-self: flex-end;
  }
}
</style>
