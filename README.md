# PsycheNote Canvas（情绪气象站）

> 面向备考学生（18-22岁）的情绪记录便签墙应用
点击右上角UI可以新建便签，之后ai可根据便签展示的心情给出答复，并且切换UI页面，超过六个便签可以查看历史便签，且支持修改便签内容，有周报总结一周的心情怎么样。
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

1.启动方式
## 快速启动

### 一键启动（推荐）

下载项目后，双击运行以下脚本即可：

| 系统      | 脚本              | 说明                         |
| --------- | ----------------- | ---------------------------- |
| Windows   | `start.bat`       | 双击运行，自动安装依赖并启动 |
| Mac/Linux | `start.sh`        | 终端执行 `./start.sh`        |
| 任意系统  | `npm run dev:all` | 需要先有 Node.js 环境        |

### 手动启动

#### 1. 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd backend && npm install
```

#### 2. 配置 API 密钥

**首次使用必须配置**：

1. 注册 MiniMax 账号：https://platform.minimaxi.com/
2. 获取 API Key
3. 创建 `backend/.env` 文件：

```env
MINIMAX_API_KEY=你的API密钥
```

#### 3. 启动服务

```bash
# 终端 1: 启动后端（端口 3001）
npm run start:backend

# 终端 2: 启动前端（端口 3000）
npm run start:frontend
```

#### 4. 访问应用

打开浏览器访问：http://localhost:3000

---




2.我是怎么理解这个模糊需求的
我个人理解这个项目需求主要在于ai可以解读便签表达的感情，并且产生相应的互动，这是与传统便签最大的区别，然后面向群体年级应该在35岁以下，年轻话的群体，并且会常用便签，所以高考生最为合适，但是本项目提示词没有对用户身份做太多约束，所有人都可以用。为了让用户每天都有动力写便签，我还做了周报统计，用户可以查看这一周的心情的大体情况。设计风格整体偏卡通，可爱，会随着不同的当前便签的心情转换我设计的不同的UI界面，右下角的小毛头像也有互动。



3.AI协作记录
我大体列一下我的AI协作流程
1.构建项目骨架：
使用claudecode接入ideabrowser和paper的mcp，前者有很多强大的功能，我主要做了项目的大纲，让claudecode根据项目里面的文件，生成了context.md文件，后者则是可以让claudecode使用一些现成的库的前端页面直接把页面拼在paper上，也可以实时查看前端页面，并且点击页面里的所有UI进行手动调整尺寸大小等，在我的项目里这减少了我的前端修改时间。

2.然后我给claudecode规定了代码规范（Airbnb React + TypeScript），并且给了claudecode相应的角色定位和其他的规范要求。并且生成CLAUDE.md文件，
约束详情如下：
【角色设定】
你是一名拥有 5 年前端开发经验的 React/Next.js 工程师，同时精通 shadcn/ui 组件库与 Tailwind CSS。你做事严谨、代码洁癖，擅长搭建结构清晰、可扩展、易维护的前端项目。
【项目背景】
我们正在开发一个「读心便签墙」项目，技术栈为 Next.js + TypeScript + shadcn/ui，已配置好 Airbnb 代码规范、ESLint 和 Prettier。
【协作规则（必须严格遵守）】
1）.  代码规范：所有代码严格遵循 Airbnb React/TS 规范，类型定义完整，不使用 `any`；文件按「components/ui、components/notes、hooks、utils、types」分层，组件职责单一。
2）.  组件使用：只使用 shadcn 官方组件，绝不修改 `/components/ui` 目录下的源码；样式全部通过 Tailwind 类名覆盖实现。
3）.  开发流程：
    - 每次开发功能前，先向我说明你的实现思路和步骤
    - 代码修改完成后，自动运行 `npm run lint` 和 `npx tsc --noEmit`，修复所有格式和类型错误
    - 主动告诉我修改了哪些文件、新增了什么功能，方便我检查
4）.  交互要求：所有状态变化必须加平滑过渡动画，背景渐变切换使用 `transition-all duration-1000`，便签加轻微 hover 效果，整体风格保持卡通、柔和、不刺眼。

3.前端页面：
然后我开始让claudecode写前端页面，根据对应的心情设计了对应的UI，涉及到多个文件时使用了/plan功能先规划再实施，对于上下文太多的问题我是到差不多就会把claudecode关掉重启，再次进来会让claudecode读取我的github提交代码进度,CLAUDE.md和context，然后在paper看页面合适之后在浏览器测试。前端之后编写了对应的单元测试，然后修复bug。也有f12然后修的bug。

4.后端及整个项目联调：
后端部分我提供了调用LLM的提示词，指定了输出结构和关键字段，指定了工作逻辑，然后进行前后端联调测试，根据测试的结果补充一些修改的点，根据我的想法使整个项目的UI和功能丰满起来，途中正常单元测试和重启claudecode，提交github，中间有一次bug比较难修，模型上下文太长，我让claudecode在.claude里存放项目memory的地方新建了一个当前详细进度的.md文件，然后重启进行修改。
工作逻辑详情如下：
1. 后端收集前端传过来的用户便签文本
2. 把「系统提示词 + 用户便签」一起发给大模型
3. LLM 返回标准 JSON
4. 后端解析：
-  mood  字段 → 传给前端，自动切换 兴奋/不开心/焦虑/平静 背景渐变
-  reply  字段 → 页面展示暖心回复、猫咪弹窗文案

5.项目收尾：
项目收尾我做了如下操作：
1）/review全局检查代码
2）帮我执行项目全部单元测试，输出测试覆盖率、成功用例、失败用例详情，如有基于当前失败的单元测试，帮我定位问题代码并自动修复，保证所有单元测试全部通过
3）自动格式化所有代码（缩进、换行、引号、分号）， 修复 ESLint/Prettier 报错，移除无用导入、无用变量
4）           1. 帮我梳理项目所有功能点清单
	2. 补充缺失的边界测试、异常测试用例
	3. 帮我检查：参数非法、空值、异常捕获、报错提示是否完善
	避免正常流程能跑，异常场景直接崩。
5）	补全关键函数、类、复杂逻辑注释
	生成项目 README：部署步骤、环境依赖、启动命令、接口说明
	整理项目结构说明、技术栈说明
6）扫描删除：
 	临时日志、debug 打印、console.log
	废弃代码、注释掉的旧逻辑
	无用配置、冗余依赖
	减小项目体积，工程更干净。
7）/review帮我对优化、修复、格式化后的项目做一次最终全面代码复盘，确认无bug、无规范问题、可直接交付
8)生成README.md文件

大体就是这样，还有一些具体的操作我没写。
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
下面的内容是ai写的，不是我写的
！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！


## 项目介绍

PsycheNote Canvas 是一款温暖治愈的情绪记录应用。用户发布便签，系统基于 LLM 分析内容识别情绪，提供：

- 动态情绪背景与粒子动画
- 可视化情绪统计报告
- 陪伴猫咪动画

---

## 技术栈

| 层级      | 技术                    | 说明                |
| --------- | ----------------------- | ------------------- |
| 框架      | Next.js 14 (App Router) | React 全栈框架      |
| 语言      | TypeScript (strict)     | 类型安全            |
| UI 组件库 | shadcn/ui               | 基于 Radix 的组件库 |
| 样式      | Tailwind CSS            | 原子化 CSS          |
| 后端      | Express.js              | API 服务            |
| LLM       | MiniMax-M2              | 流式输出情绪识别    |
| 测试      | Jest + Testing Library  | 单元测试            |

---

## 项目结构

```
PsycheNote Canvas/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx             # 主页（情绪记录）
│   │   ├── layout.tsx           # 根布局
│   │   └── globals.css          # 全局样式 + CSS动画
│   │
│   ├── components/
│   │   ├── ui/                  # shadcn/ui 官方组件（禁止修改）
│   │   ├── notes/               # 便签业务组件
│   │   │   ├── NoteCard.tsx     # 便签卡片
│   │   │   ├── NoteGrid.tsx     # 便签网格
│   │   │   ├── HistoryModal.tsx # 历史记录弹窗
│   │   │   ├── MoodBarChart.tsx # 情绪条形图
│   │   │   └── MoodReportView.tsx # 周报告视图
│   │   ├── MoodBackground.tsx   # 情绪背景+粒子动画
│   │   ├── CatCompanion.tsx     # 陪伴猫咪
│   │   ├── FloatingDecorations.tsx # 浮动装饰
│   │   ├── Greeting.tsx         # 问候语
│   │   └── LLMReplyBubble.tsx   # AI回复气泡
│   │
│   ├── config/
│   │   ├── moodConfig.ts        # 情绪配置（渐变、标签、映射）
│   │   └── catConfig.ts         # 猫咪动画配置
│   │
│   ├── hooks/
│   │   ├── useMood.ts          # 情绪状态管理
│   │   └── useNotes.ts          # 便签 CRUD
│   │
│   ├── types/
│   │   ├── mood.ts              # 情绪类型定义
│   │   ├── note.ts             # 便签类型定义
│   │   └── moodReport.ts       # 报告类型定义
│   │
│   └── utils/
│       ├── utils.ts             # cn() 工具函数
│       └── moodReportUtils.ts   # 报告计算工具
│
├── backend/
│   ├── server.js               # Express 入口
│   ├── routes/note.js           # POST /api/note
│   └── services/llm.js         # MiniMax API 调用
│
├── scripts/
│   └── start.js                # 一键启动脚本（跨平台 Node.js 版）
│
├── start.bat                    # Windows 一键启动脚本
├── start.sh                     # Mac/Linux 一键启动脚本
│
├── context.md                   # 产品需求文档
├── CLAUDE.md                    # AI 开发指南
└── README.md                   # 项目说明文档
```

---

## 环境依赖

### 前端

- Node.js >= 18.0.0
- npm >= 9.0.0

### 后端

- Node.js >= 16.0.0
- 无额外依赖（使用 Node.js 内置模块）

---



## 接口说明

### POST /api/note

发送便签内容，获取 LLM 情绪分析结果。

**请求**

```json
POST /api/note
Content-Type: application/json

{
  "content": "今天考试考砸了，心情很糟糕"
}
```

**响应**（SSE 流式）

```
event: mood
data: {"mood":"不开心"}

event: reply
data: {"text":"我能感受到你"}
data: {"text":"的失落"}
...
```

**情绪标签对应**

| LLM 返回 | 前端 Key | 中文   |
| -------- | -------- | ------ |
| 开心     | happy    | 开心   |
| 兴奋     | excited  | 兴奋   |
| 平静     | calm     | 平静   |
| 不开心   | unhappy  | 不开心 |
| 焦虑     | anxious  | 焦虑   |

---

## 设计思路

### 需求起源

用户需求最初比较模糊："做一个便签墙应用，AI 能识别情绪"。

### 需求理解

经过 AI 协作分析，将需求明确为：

1. **目标用户**：备考学生（18-22岁）
2. **核心价值**：情绪数据长期积累和洞察
3. **差异化**：动态背景 + 陪伴感 + 温暖治愈的语气

### MVP 优先级

| 优先级 | 功能                   | 原因               |
| ------ | ---------------------- | ------------------ |
| P0     | 便签 CRUD + 本地持久化 | 核心体验           |
| P0     | 情绪标签 + UI 变化     | 差异化体现         |
| P1     | LLM 流式回复           | 产品亮点           |
| P2     | 周报告统计             | 留存机制           |
| P3     | 音乐推荐               | 增值功能（已取消） |

---

## AI 协作记录

### 协作流程

1. **需求讨论**：用户提出模糊需求 → AI 分析并提出问题 → 明确产品定位
2. **方案设计**：AI 提供技术方案 → 用户确认 → 开始实现
3. **代码开发**：AI 编写代码 → 自动 lint/format → 单元测试验证
4. **问题修复**：用户反馈问题 → AI 诊断 → 修复并验证

### 关键决策

| 决策点   | 选项            | 选择     | 原因                 |
| -------- | --------------- | -------- | -------------------- |
| 音乐推荐 | 需要/不需要     | 不需要   | 功能单薄，偏离核心   |
| 数据存储 | 后端/前端       | 前端优先 | 降低复杂度，MVP 先行 |
| 情绪数量 | 5种/10种        | 5种      | 简化 LLM 识别难度    |
| 图表方案 | 第三方库/纯 CSS | 纯 CSS   | 减少依赖，保持轻量   |

### 迭代记录

- **v0.1**: 便签 CRUD + 情绪背景
- **v0.2**: LLM 集成 + 回复气泡
- **v0.3**: 历史记录 + 周报告

---

## 功能清单

### 已完成

- [x] 便签 CRUD（创建、读取、更新、删除）
- [x] 本地持久化（localStorage）
- [x] 5种情绪状态管理
- [x] 动态情绪背景（渐变 + 粒子动画）
- [x] 陪伴猫咪动画
- [x] 浮动装饰动画
- [x] LLM 流式情绪识别
- [x] AI 回复气泡
- [x] 历史便签弹窗
- [x] 周报告统计（情绪分布、周对比、总结文字）
- [x] 完整的单元测试覆盖

### 待开发

- [ ] 情绪趋势折线图（多周历史）
- [ ] 数据导出（JSON/CSV）
- [ ] 国际化支持

---

## 代码规范

### 开发流程

```bash
# 1. 编写代码
# ...

# 2. 运行检查（必须）
npm run lint      # ESLint 检查
npm run type-check # TypeScript 类型检查
npm test          # 单元测试

# 3. 如有错误自动修复
npm run lint:fix
npm run format
```

### Git 提交规范

```bash
git commit -m "type: description"

# type:
# feat: 新功能
# fix: 修复 bug
# docs: 文档更新
# style: 格式调整
# refactor: 重构
# test: 测试相关
```

---

## License

MIT © 2024 PsycheNote Canvas
