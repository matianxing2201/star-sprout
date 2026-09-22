# 前端规范 · TS / Vue / 样式 / 注释

> 对应 `docs/standards.md` §6。写任何 `.ts` / `.vue` / `.css` 前必读。

## 1. TypeScript

- `strict: true` + `noUnusedLocals` + `noUnusedParameters` + `verbatimModuleSyntax`
- 类型导入必须 `import type`（`verbatimModuleSyntax` 强制）
- `interface` 优先于 `type`（`ts/consistent-type-definitions: interface`）
- **禁止 `any`**；穷尽性检查用 `shared/utils/exhaustive.ts`
- 路径别名 `@/*` → `src/*`；**禁止深层相对路径** `../../../`

## 2. Vue

- **block 顺序固定**：`<script>` → `<template>` → `<style>`（`vue/block-order`）
- 模板中组件名 **PascalCase**
- 统一 Composition API + `<script setup lang="ts">`
- props / emits 用**类型声明**，不用运行时对象
- 组件**不直接持仓储**、**不直接读 `localStorage`**（走 `src/data/index.ts` 暴露的仓储）

## 3. 样式

### 层序（最容易踩的坑）

- **全局样式必须分层**：`base.css` 包 `@layer base`，`animations.css` 包 `@layer components`。
  **未分层样式会优先于任何 `@layer`**，从而盖掉 Tailwind 原子类 —— 详见 `base.css` 顶部注释。
- 层名只允许 `{base, components, utilities, theme}`。
- 引入顺序固定（`styles/index.css`）：
  `tailwindcss` → `tokens.css` → `base.css` → `animations.css`。
  **新增样式文件要同步更新 `layers.spec.ts` 的该顺序断言。**
- `!important` 全站**仅允许两处**：`prefers-reduced-motion` 与 `.fx-drop-active`。

### 颜色

- 一律走令牌，**禁止十六进制硬编码**。
- 领域相关元素一律 `toneVars(tone)`，**禁止写死某个领域的颜色**。

## 4. 注释与 lint

- 注释、提交信息、文档**统一中文**；注释写「为什么」，不写「做了什么」。
- `eslint.config.js`：`@antfu/eslint-config`（app / vue / ts / jsonc / yaml），
  markdown 规则关闭、css / html 走 formatter。`src/content/grades/**` 在忽略名单里。

## 5. 写完前自查

- [ ] 没有 `any`？没有深层相对路径？类型导入用了 `import type`？
- [ ] `<script>` 在 `<template>` 前？组件名 PascalCase？
- [ ] 新样式落在正确 `@layer` 里？没有新增 `!important`？
- [ ] 没有十六进制硬编码颜色？
- [ ] 组件没直连 `localStorage` / 没自己 `new` 仓储？
