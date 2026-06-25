# Pawodoro — 宠物番茄钟 Chrome 扩展

## 项目交接文档

**最后更新：** 2026-06-25
**项目路径：** `/Users/awen/.qclaw/workspace-agent-5876a32a/pomodoro-extension/`
**GitHub：** `git@github.com:awenstudio/pomodoro-github.git` (main 分支)

---

## 快速开始

```bash
cd /Users/awen/.qclaw/workspace-agent-5876a32a/pomodoro-extension
npm install
npm run build          # 构建到 dist/
npx vitest run         # 运行测试（54个）
```

加载到 Chrome：`chrome://extensions/` → 开发者模式 → 加载已解压 → 选 `dist/`

---

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | React 19 + TypeScript |
| 构建 | Vite |
| 样式 | Tailwind CSS 4 |
| 测试 | Vitest (54/54) |
| 计时 | chrome.alarms API（非 setInterval） |
| 存储 | chrome.storage.local |
| 图标 | CSS 渐变 emoji 系统（src/lib/icons/index.tsx） |

---

## 目录结构

```
pomodoro-extension/
├── src/
│   ├── background/          # Service Worker (chrome.alarms)
│   │   └── index.ts
│   ├── popup/               # 弹窗 UI
│   │   ├── main.tsx         # 入口
│   │   ├── App.tsx          # 根组件
│   │   ├── hooks/
│   │   │   └── useTimer.ts  # 核心计时逻辑 hook
│   │   └── components/
│   │       ├── Timer.tsx        # 主界面（QQ宠物房间+计时器）
│   │       ├── PetRoom.tsx      # QQ宠物房间场景
│   │       ├── Controls.tsx     # 播放/暂停/跳过按钮
│   │       ├── PetCreator.tsx   # 宠物创建向导
│   │       ├── PetSprite.tsx    # 宠物精灵渲染
│   │       ├── Stats.tsx        # 统计面板
│   │       ├── Achievements.tsx # 成就系统
│   │       ├── Heatmap.tsx      # GitHub风格热力图
│   │       ├── Settings.tsx     # 设置面板
│   │       ├── Onboarding.tsx   # 首次使用引导
│   │       ├── Confetti.tsx     # 庆祝粒子效果
│   │       └── CompletionRewardCard.tsx # 完成奖励卡片
│   ├── lib/                 # 核心逻辑
│   │   ├── pet-system.ts    # 宠物系统（7阶段/4物种/7性格）
│   │   ├── gamification.ts  # 成长系统（20级/XP/赦免卡）
│   │   ├── pet-interaction.ts # 交互引擎（喂食/玩耍/抚摸）
│   │   ├── timer-engine.ts  # 计时引擎
│   │   ├── storage.ts       # Chrome存储抽象
│   │   ├── sounds.ts        # Web Audio 音效
│   │   └── icons/index.tsx  # CSS渐变图标库
│   └── types.ts             # TypeScript类型定义
├── public/
│   ├── pets/                # 宠物PNG素材（4物种×多状态）
│   ├── animations/          # 宠物动画帧
│   └── ui/                  # UI素材（房间背景等）
├── dist/                    # 构建输出（直接加载到Chrome）
├── tailwind.config.js       # Tailwind配置
├── vite.config.ts           # Vite配置
└── vitest.config.ts         # 测试配置
```

---

## 核心设计系统

### 色彩（暖色调）

```css
cream:   #FFF8E6, #F5EDDA, #E8DCC8, #D4C8A8, #B8A88C, #8A7860
moss:    #5AAF5E, #4D8B3E, #6FA85C, #8BC47A
tea:     #FF9E4A, #E8833A, #FFD97A, #E89B52
mist:    #7BA8D1, #5B8AB8, #B8D4E8
blush:   #FF8A8A, #E86868, #FF5C8A
honey:   #FFD97A, #FFB830
```

### 字体

```css
font-display: 'Quicksand', sans-serif   /* 标题 */
font-body: 'DM Sans', sans-serif        /* 正文 */
font-mono: 'DM Mono', monospace         /* 数字/时间 */
```

### CSS图标系统

所有图标使用 `src/lib/icons/index.tsx` 中的 `cssIcon` 函数：
- emoji + 渐变背景 + 发光阴影 + 内高光 + 白色边框
- 分类：家具(暖棕)、状态(鲜艳)、操作(活泼)、模式(清晰)

---

## 核心功能

### 1. 宠物系统 (`pet-system.ts`)

- **4 物种：** shiba(柴犬), cat(猫), rabbit(兔), fox(狐)
- **7 成长阶段：** egg → baby → child → teen → young → adult → elder
- **7 性格：** brave, shy, lazy, playful, calm, curious, sassy
- **属性：** mood(心情), hunger(饥饿), affinity(亲密度), level, xp, food(食物库存)
- **衰退机制：** mood/hunger 每30秒衰减，影响XP倍率

### 2. 成长系统 (`gamification.ts`)

- **20 级：** Seedling(1) → Universe(20)
- **XP 计算：** baseXP × streakMultiplier × petMoodMultiplier
- **赦免卡：** 每日1-3张（根据等级），可原谅未完成的番茄钟
- **连击加成：** 连续完成越多，XP倍率越高

### 3. 交互引擎 (`pet-interaction.ts`)

- **喂食：** 减少hunger，增加mood，有冷却(30s)
- **玩耍：** 增加mood和affinity，有冷却(20s)
- **抚摸：** 增加affinity，有冷却(10s)
- **性格影响：** 不同性格对同一交互有不同反应
- **物种特性：** 柴犬更亲人，猫更独立，兔更温柔，狐更机灵

### 4. QQ宠物房间 (`PetRoom.tsx`)

- **8个家具：** 书桌、床、食盆、玩具箱、书架、植物、窗户、地毯
- **宠物自主移动：** 根据计时状态走到对应家具
  - Focus → 书桌旁
  - Rest → 床上
  - Relax → 书架旁
  - Idle → 地毯中央
- **点击交互：** 点击家具触发动作（喂食/玩耍/切换模式）
- **视觉效果：** AI生成背景、环境光、粒子、悬停发光

### 5. 计时器 (`useTimer.ts` + `timer-engine.ts`)

- **周期：** 25分钟Focus → 5分钟Rest → 重复 → 15分钟Relax
- **持久化：** chrome.storage.local，重启后恢复
- **通知：** chrome.notifications API
- **声音：** Web Audio API（8种音效，无外部文件）

---

## 蓝图进度（15层系统）

| 层 | 功能 | 状态 |
|---|---|---|
| 1 | 基础番茄钟 | ✅ 完成 |
| 2 | 宠物基础 | ✅ 完成 |
| 3 | 交互引擎 | ✅ 完成 |
| 4 | 成长系统 | ✅ 完成 |
| 5 | QQ宠物房间 | ✅ 完成 |
| 6 | 商店系统 | ❌ 未实现 |
| 7 | 食物/道具 | ❌ 未实现 |
| 8 | 家具升级 | ❌ 未实现 |
| 9 | 换装系统 | ❌ 未实现 |
| 10 | 社交系统 | ❌ 未实现 |
| 11 | 季节活动 | ❌ 未实现 |
| 12 | 多房间 | ❌ 未实现 |
| 13 | 迷你游戏 | ❌ 未实现 |
| 14 | 成就扩展 | ❌ 未实现 |
| 15 | 数据分析 | ❌ 未实现 |

---

## 用户偏好

- **风格：** chibi 2D 扁平卡通、粗描边、暖棕色系
- **参考：** 腾讯QQ宠物
- **不要：** 阴郁、简单的线条图标（要生动活泼有色彩）
- **动画：** 参考高级App交互和动效，不要太初级
- **并行：** 鼓励多agent并行开发加速

---

## 常用命令

```bash
# 开发
npm run dev              # Vite dev server（但Chrome扩展需要build后加载）

# 构建
npm run build            # 输出到 dist/

# 测试
npx vitest run           # 运行全部测试
npx vitest run --watch   # 监听模式

# Git
git status
git log --oneline -10
git push
```

---

## 已知限制

- Pollinations AI 频繁 429 限流（生成图片需要间隔重试）
- Chrome 扩展 popup 窗口固定 380×520px
- 不支持 HMR（需 build 后重新加载扩展）
- 宠物PNG素材在 `public/pets/` 和 `public/animations/`（chibi风格）
