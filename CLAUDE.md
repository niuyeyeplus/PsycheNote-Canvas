# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**PsycheNote Canvas（情绪气象站）** — 面向备考学生（18-22岁）的情绪记录便签墙应用。用户发布便签，系统基于内容提供情绪识别反馈，动态背景与陪伴猫咪动画提供沉浸式体验。

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript（strict 模式） |
| UI 组件库 | shadcn/ui (new-york style) |
| 样式 | Tailwind CSS + CSS Variables |
| 动画 | CSS Keyframes (globals.css) |
| 后端 | Express (Node.js) |
| 持久化 | JSON 文件存储 |
| LLM | MiniMax API (MiniMax-M2 模型, SSE 流式输出) |
| 代码规范 | Airbnb React/TypeScript + ESLint + Prettier |

## 常用命令

```bash
# 前端开发
npm run dev          # 启动开发服务器 http://localhost:3000
npm run build        # 生产构建
npm run start        # 启动生产服务器
npm run lint         # ESLint 检查
npm run lint:fix     # ESLint 自动修复
npm run format       # Prettier 格式化
npm run format:check # Prettier 检查格式
npm run type-check   # TypeScript 类型检查

# 后端开发
cd backend && node server.js   # 启动后端服务 http://localhost:3001
```

## 目录结构

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 首页（心情切换测试页）
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局样式 + CSS 动画
├── components/
│   ├── ui/                # shadcn/ui 官方组件（禁止修改源码）
│   ├── MoodBackground.tsx  # 情绪背景 + 粒子动画
│   ├── CatCompanion.tsx    # 陪伴猫咪组件
│   ├── FloatingDecorations.tsx  # 浮动装饰（从底部上升旋转）
│   └── Greeting.tsx       # 问候组件
├── config/
│   ├── moodConfig.ts      # 情绪配置（渐变、标签）
│   └── catConfig.ts       # 猫咪动画配置
├── hooks/
│   └── useMood.ts         # 情绪状态 Hook（localStorage 持久化）
├── types/
│   └── mood.ts            # 情绪类型定义
└── lib/
    └── utils.ts           # cn() 工具函数

backend/
├── server.js              # Express 入口（端口 3001）
├── routes/
│   └── note.js            # POST /api/note — SSE 流式 LLM 回复
└── services/
    └── llm.js             # MiniMax API 调用封装
```

## 代码规范

### TypeScript 要求
- **严格模式**：所有类型必须显式声明，禁止使用 `any`（`@typescript-eslint/no-explicit-any` 为 warn）
- **类型导入**：使用 `import type` 语法（`@typescript-eslint/consistent-type-imports` 规则）
- **类型定义文件**：`src/types/` 目录下集中管理

### 组件规范
- **shadcn/ui 组件**：只读 `src/components/ui/`，禁止修改源码
- **业务组件**：放置于 `src/components/` 根目录或子目录（如 `src/components/notes/`）
- **样式规范**：所有样式通过 Tailwind 类名实现，不修改 shadcn/ui 组件源码

### ESLint 规则（重点）
```json
"prettier/prettier": "error",          // Prettier 冲突直接报错
"react-hooks/rules-of-hooks": "error", // Hooks 规则强制
"@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }], // 未使用变量报错
"@typescript-eslint/no-explicit-any": "warn",  // any 警告
"no-console": ["warn", { "allow": ["warn", "error"] }],  // 仅 warn/error 允许
"import/order": ["error", { "alphabetize": { "order": "asc" } }]  // 导入排序
```

### 路径别名
- `@/*` → `src/*`（已在 `tsconfig.json` 配置）

## UI 配色方案

### 情绪渐变配色
| 情绪 | 渐变（Tailwind） | 背景色 |
|------|------------------|--------|
| 平静 calm | `from-purple-400 via-purple-200 to-pink-200` | `#a855f7` → `#c084fc` → `#f9a8d4` |
| 开心 happy | `from-blue-100 via-white to-green-100` | `#dbeafe` → `#ffffff` → `#bbf7d0` |
| 不开心 unhappy | `from-gray-300 via-gray-200 to-gray-100` | `#cdd6e0` → `#bcc8d8` |
| 焦虑 anxious | `from-gray-400 via-gray-300 to-gray-200` | `#d9d2e2` → `#c9c1d6` |
| 兴奋 excited | `from-orange-100 via-pink-100 to-pink-200` | `#f9d8b8` → `#f8c8d0` |

### shadcn/ui CSS 变量（globals.css）
```css
--primary: 262.1 83.2% 57.3%     /* 紫色 — 主色调 */
--psyche-purple: 262.1 83.2% 57.3%
--psyche-pink: 340 75% 70%
--psyche-mint: 122 39% 50%
--psyche-yellow: 55 100% 88%
--psyche-blue: 210 100% 94%
--psyche-green: 122 50% 90%
--psyche-peach: 340 80% 90%
```

### 动画粒子
| 情绪 | 粒子效果 |
|------|---------|
| calm | 白色圆点闪烁 (`calm-dot`) |
| happy | 云朵摇摆 + 右上角太阳脉动 (`happy-cloud`, `happy-sun`) |
| excited | 火焰摇摆 (`excited-flame`) |
| unhappy | 乌云摇摆 (`unhappy-cloud`) |
| anxious | 标语文字摇摆 (`anxious-phrase`) |

## 后端 LLM 规则

### API 端点
- `POST /api/note` — 接收便签内容，返回 SSE 流式响应
  - Event `mood`：推送情绪标签（`{ "mood": "calm" }`）
  - Event `reply`：推送回复文本片段（`{ "text": "..." }`）

### LLM 系统提示词（backend/services/llm.js）
```
你是一名温柔治愈、共情力很强的情绪陪伴助手。
用户会输入一段日常便签文字，你需要完成下面三件事：
1. 精准识别用户当前情绪，只能从五种里面选：开心、兴奋、平静、不开心、焦虑
2. 根据识别出的情绪，生成一段简短、温暖、治愈、口语化的回复，不要太长，不要鸡汤说教，语气温柔亲切
3. 额外输出情绪标签，方便前端切换对应背景色

输出格式严格按照JSON，不要多余解释、不要 Markdown：
{"mood":"情绪标签","reply":"你的治愈回复"}
```

### LLM 输出规范
- 仅支持 `开心`、`兴奋`、`平静`、`不开心`、`焦虑` 五种情绪标签
- 回复须为 JSON 格式，严格包含 `mood` 和 `reply` 字段
- reply 内容：简短（50字以内）、口语化、温暖治愈、不说教

## 检查与验证流程

每次代码修改完成后**必须**执行以下检查：

```bash
# 1. ESLint 检查
npm run lint

# 2. TypeScript 类型检查
npm run type-check   # 等价于 npx tsc --noEmit

# 3. 格式检查（如需要自动修复）
npm run lint:fix
npm run format
```

发现错误必须**全部修复**后再提交。

## 重要注意事项

- **API 密钥**：`backend/services/llm.js` 中硬编码了 MiniMax API 密钥，勿提交到公共仓库
- **前后端通信**：前端开发时后端需运行在 `http://localhost:3001`
- **shadcn/ui 组件**：通过 CLI 管理（`npx shadcn-ui@latest add [component]`），组件源码在 `components/ui/`，禁止手动修改
- **Tailwind 类名覆盖**：所有样式覆盖通过 Tailwind 类名实现，不修改组件内部样式
- **CSS 动画**：自定义动画定义在 `src/app/globals.css` 的 `@layer components` 中
