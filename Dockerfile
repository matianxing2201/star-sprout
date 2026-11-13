# syntax=docker/dockerfile:1

########## 阶段一：构建 —— 产出 dist/ ##########
FROM node:22-alpine AS build
WORKDIR /app

# pnpm 由 Node 自带的 corepack 分发，锁到与 CI 相同的版本（11.25.0），
# 保证本地 / CI / 服务器三处构建行为一致。
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@11.25.0 --activate

# 只先拷贝依赖清单：只要 package.json / lock 不变，
# `pnpm install` 这层就命中缓存，改代码重建时不用重新装依赖。
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 再拷入源码并构建（pnpm build = vue-tsc --build && vite build）。
# 这里没有设 GITHUB_ACTIONS，vite 的 base 是 "/"，适合服务器根域名托管。
COPY . .
RUN pnpm build

########## 阶段二：托管 —— 镜像里只有 nginx + dist/ ##########
FROM nginx:1.29-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# 站点配置不打进镜像：由 compose.yaml 以只读卷挂入，
# 便于在 http.conf / ssl.conf 两个阶段之间切换（见 docs/deploy-server-manual.md）。
