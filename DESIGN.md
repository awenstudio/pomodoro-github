# Pawodoro 设计圣经 v1.0

> **核心理念**：宠物状态是用户工作习惯的情感化倒影。用户因为「不想让宠物难过」而坚持使用番茄工作法——而不是被积分或排行榜驱动。

---

## 目录

1. [设计哲学](#1-设计哲学)
2. [视觉设计系统](#2-视觉设计系统)
3. [宠物房间设计](#3-宠物房间设计)
4. [状态系统](#4-状态系统)
5. [情绪表达系统](#5-情绪表达系统)
6. [上瘾机制](#6-上瘾机制)
7. [休息时间交互](#7-休息时间交互)
8. [时间感知氛围](#8-时间感知氛围)
9. [成长弧度](#9-成长弧度)
10. [实施路线图](#10-实施路线图)

---

## 1. 设计哲学

### 核心参考游戏

| 游戏 | 关键设计原则 | 应用到 Pawodoro |
|------|------------|----------------|
| **Tamagotchi** | 损失厌恶驱动回来，宠物悄悄蔫在角落比弹窗有效 10 倍 | 宠物低状态时不弹窗，而是姿态变化 |
| **QQ宠物** | 房间即舞台，状态条紧凑嵌入，场景占主体 | PetRoom 是 UI，不是 UI 里的一个组件 |
| **Nintendogs** | 输入质量 = 情感输出质量，行为叙事取代传统 HUD | 点击宠物立刻有反应，0 延迟 |
| **Animal Crossing** | 轻量日常仪式 > 偶发高强度；无失败状态 | 休息交互是建议，不是强制 |
| **Pou** | 里程碑密集——下一个解锁总在眼前 | 5 阶段成长而非 7 阶段，每阶段解锁家具 |
| **Hatch** | 宠物是行为的情感镜子 | 工作习惯直接改变宠物外观和性格 |

### Hook 模型（Nir Eyal）× 番茄工作法

```
触发 Trigger → 行动 Action → 可变奖励 Reward → 投入 Investment
     ↑                                                    |
     └────────────────────────────────────────────────────┘
```

- **外部触发**：插件角标红点「宠物饿了 🍖」
- **内部触发**（目标状态）：打开电脑工作时，条件反射想起宠物
- **行动**：一键启动番茄 → 工作变成喂宠物的过程
- **可变奖励**：固定 XP + 随机神秘事件（5% 概率）
- **投入**：命名、装扮房间、养成连续天数

---

## 2. 视觉设计系统

### 颜色系统

```css
/* 房间 - 暖色调，像真实点亮的房间 */
--wall-top:     #FDE8A4;   /* 奶油黄上墙 */
--wall-bottom:  #EDD480;   /* 暖黄下墙 */
--floor-top:    #C07840;   /* 木地板浅色 */
--floor-bottom: #8A5020;   /* 木地板深色 */
--baseboard:    #5A2E08;   /* 踢脚线 */

/* 家具 - 每件独立色格，参考 QQ 宠物 */
--furniture-desk:      linear-gradient(145deg, #B08060, #8A5C30, #6A4018);
--furniture-bed:       linear-gradient(145deg, #EAB0CE, #CC88B0, #AA6898);
--furniture-food:      linear-gradient(145deg, #EC9858, #CC7030, #AC5010);
--furniture-toy:       linear-gradient(145deg, #F2D458, #D8B020, #B89000);
--furniture-bookshelf: linear-gradient(145deg, #905A38, #6A3E20, #4A2808);
--furniture-plant:     linear-gradient(160deg, #80CC60, #5CAA3C, #3C8A20);
--furniture-window:    linear-gradient(180deg, #C8EAFF, #98CCEE, #68AADD);

/* 应用 UI - 深色 premium */
--surface-1: #1F1C18;
--surface-2: #28251F;
--cream-100: #FFF8E6;
--moss-400:  #6FA85C;
--tea-400:   #E89B52;
--mist-400:  #6B8FA6;
```

### 字体层级

| 用途 | 字体 | 尺寸 | 备注 |
|------|------|------|------|
| 计时数字 | JetBrains Mono | 30px（text-3xl） | 最关键信息，最大显示 |
| 模式标签 | DM Sans | 11px | 全大写字母间距 |
| 状态文字 | DM Sans | 11–12px | 不低于 11px |
| 角标小字 | DM Sans | 10px | 仅用于次要信息 |

> **规则**：380px 弹窗中，任何文字不低于 10px，关键信息不低于 14px。

### 动效原则

- **弹性动画（bounce）**：所有宠物动作，cubic-bezier(0.34, 1.56, 0.64, 1)
- **平滑过渡**：状态栏数值变化，cubic-bezier(0.25, 0.46, 0.45, 0.94)
- **即时响应**：点击宠物/家具，0ms 延迟触发反应（不等 300ms）
- **环境动画**：光粒子、窗帘飘动，不超过 4 个同时存在

---

## 3. 宠物房间设计

### 空间构成

```
┌─────────────────────────────────────┐
│  ☁ 奶油黄墙壁（顶部 54%）            │
│  [书架]        [窗户]      [床]      │
│                  🐕                  │
├─────────────────────────────────────┤  ← 踢脚线（#5A2E08）
│  木地板（底部 46%）                   │
│  [食盆]     [地毯]     [玩具]         │
└─────────────────────────────────────┘
```

### 家具交互规范

每件家具都有：
- **独立渐变背景**（区分视觉，避免"一片黑"）
- **hover 时发光**（对应家具主色的 box-shadow glow）
- **点击后宠物奔跑过来**（Nintendogs 原则：即时反馈）

```typescript
const FURNITURE_STYLE: Record<FurnitureType, FurnitureStyle> = {
  desk:       { gradient: 'linear-gradient(145deg, #B08060, #6A4018)', hoverGlow: 'rgba(180,120,80,0.4)' },
  bed:        { gradient: 'linear-gradient(145deg, #EAB0CE, #AA6898)', hoverGlow: 'rgba(200,140,180,0.4)' },
  food:       { gradient: 'linear-gradient(145deg, #EC9858, #AC5010)', hoverGlow: 'rgba(230,140,60,0.4)' },
  toy:        { gradient: 'linear-gradient(145deg, #F2D458, #B89000)', hoverGlow: 'rgba(220,180,0,0.4)'  },
  bookshelf:  { gradient: 'linear-gradient(145deg, #905A38, #4A2808)', hoverGlow: 'rgba(140,80,40,0.4)'  },
  plant:      { gradient: 'linear-gradient(160deg, #80CC60, #3C8A20)', hoverGlow: 'rgba(80,180,50,0.4)'  },
};
```

---

## 4. 状态系统

### 三栏状态条（参考 Pou 四色系统简化版）

```
😊 心情 [████████░░] 72    完成番茄 +20 · 每 30 分钟 −5
🍖 饥饿 [███░░░░░░░] 32    喂食 +30    · 每 60 分钟 −10
💖 亲密 [█████████░] 88    抚摸/玩耍 +10 · 每天 −3
```

**显示位置**：PetRoom 顶部，名字标签旁，3 条细状态条。高度 4px，不占用太多视觉空间。

### 衰减三级响应

| 阈值 | 触发 | 实现方式 |
|------|------|---------|
| ≤ 40% | 宠物姿态变懒散（静默响应） | 切换 idle → tired 动画 |
| ≤ 20% | 插件图标角标出现红点 | `chrome.action.setBadgeText('!')` |
| ≤ 10% | 思维泡泡：「好饿…」 | ThoughtBubble 组件渐入 |

### 行为→状态映射表

| 用户行为 | 状态变化 |
|---------|---------|
| 完成一个番茄 | 饥饿 +20，心情 +20，Bond XP +10 |
| 休息时喂食 | 饥饿 +30，心情 +5 |
| 休息时玩耍 | 心情 +25，亲密 +15 |
| 休息时抚摸 | 亲密 +20，心情 +10 |
| 中途暂停 | 心情 −5（宠物歪头困惑） |
| 连续 4 个番茄 | 心情 +20 bonus（专注奖励） |
| 超过 2 小时未开 | 所有状态每 30 分钟 −5 |

---

## 5. 情绪表达系统

### 5 档情绪（参考 Nintendogs 行为叙事）

宠物**通过行为表演需求**，不通过文字提示。

| 档位 | 触发条件 | 视觉表现 |
|------|---------|---------|
| 😄 精神饱满 | 所有状态 ≥ 80% | 原地跳跃 + 星星粒子 + 主动蹭向家具 |
| 🙂 心情不错 | 60–79% | 正常散步 + 偶尔打哈欠 + 坐下看窗外 |
| 😐 有点无聊 | 40–59% | 趴在地毯 + 尾巴无力 + 眼神游离 |
| 😢 情绪低落 | 20–39% | 缩在角落 + 思维泡泡出现 + 插件角标红点 |
| 😭 极度难过 | 0–19% | 趴倒不动 + 系统通知 + 房间色调变灰 |

### 特殊场景动画清单

```
🍅 番茄完成      → 蹦跳 2 秒 → 奔向食盆 → 吃东西动画 → 满足表情
⏸  暂停计时      → 停下 → 歪头看你 → 困惑问号思维泡
🌙 休息开始      → 走向床 → 打哈欠 → 蜷缩睡觉 → Zzz 气泡
⬆️ 升级瞬间      → 金色爆光 → 旋转 → 变大 10% → 全屏彩纸
✋ 被点击/抚摸   → 凑近光标 → 眯眼 → 心形粒子 → 满足叹气
🎾 扔球          → 球飞向角落 → 宠物全速跑去 → 叼回来 → 骄傲抬头
😴 长时间未开    → 宠物睡着，鼾声气泡，角落有蜘蛛网
```

### 思维泡泡文案库（按状态随机）

**饥饿低（≤20%）**
- 「肚子好饿……」
- 「你是不是忘了我的饭……」
- 「闻到香味了，但是……没有」

**心情低（≤20%）**
- 「好无聊……」
- 「今天你没有陪我玩」
- 「只是想让你知道，我在这里」

**精神饱满（≥80%）**
- 「今天超棒！」
- 「再来一个！」
- 「我感觉我能飞起来！」

---

## 6. 上瘾机制

> 目标：让用户因为「喜欢」和「习惯」而回来，建立在真实价值（好的工作习惯）上。

### 机制一：可变奖励（最强，Skinner 变比例强化）

每个番茄完成时，在固定奖励基础上叠加随机事件：

| 概率 | 事件类型 | 示例 |
|------|---------|------|
| 100% | 固定 XP + 状态恢复 | 始终发生 |
| 30% | 稀有零食掉落 | 猫薄荷、骨头饼干 |
| 10% | 宠物新动作解锁 | 「侧翻」「手倒立」 |
| 5% | 神秘事件触发 | 蝴蝶飞进窗、神秘快递、宠物做梦 |
| 1% | 隐藏彩蛋 | 宠物突然变成像素风格，坚持 10 秒后恢复 |

**实现**：`Math.random()` 分段判断，在 `onPomodoroComplete` 回调中触发。

```typescript
function rollReward(): RewardEvent | null {
  const r = Math.random();
  if (r < 0.01) return { type: 'secret_easter_egg' };
  if (r < 0.06) return { type: 'mystery_event', variant: pickRandom(MYSTERY_EVENTS) };
  if (r < 0.16) return { type: 'new_action', action: pickRandom(UNLOCKABLE_ACTIONS) };
  if (r < 0.46) return { type: 'rare_food', food: pickRandom(RARE_FOODS) };
  return null;
}
```

### 机制二：损失厌恶级联

不是「来了有奖励」，而是「不来会失去」——心理研究显示损失感是奖励感强度的 2 倍。

```
今天  ████████░ 85%  → 状态满格，尾巴摇摇
明天  ██████░░░ 60%  → 开始懒散，坐在角落
第3天 ███░░░░░░ 30%  → 心情极低，蜷缩不动
第5天 █░░░░░░░░ 10%  → 生病状态，需要特殊护理
第7天 ░░░░░░░░░  3%  → 「离家出走」动画（最强情绪冲击）
```

**宠物「给你发消息」**：超过 2 小时未工作，插件角标出现未读数，打开后宠物说「你还在吗…我等你」（宠物的声音，不是系统弹窗）。

**连续保护盾**：连续 7 天获得一个保护盾，可抵消一次中断不归零（参考 Duolingo Streak Freeze）。让机制有张力但不绝望。

### 机制三：接近效应（再做一个！）

番茄完成后，XP 进度条显示距离升级差多少。

**关键设计**：把 XP 曲线设计为——完成第 N 个番茄后，进度条永远在 **85–95%**，让用户感到「再做一个就够了」。

```typescript
// XP 曲线设计（每级所需 XP 比上一级多 15%，但单个番茄 XP 也随等级微增）
// 结果：在任何等级，当前番茄数完成后，进度条约在 88%
const LEVEL_XP = Array.from({length: 100}, (_, i) => Math.floor(100 * Math.pow(1.15, i)));
```

### 机制四：完成强迫症（蔡加尼克效应）

每天番茄进度条永远显示「今日目标：X/8」，永远不满格的感觉让大脑无法放松。

**关键**：把进度放在插件图标徽章上，不用打开也能看到「4/8」。

```typescript
chrome.action.setBadgeText({ text: `${completed}/${dailyGoal}` });
chrome.action.setBadgeBackgroundColor({ color: completed >= dailyGoal ? '#5AAF5E' : '#E89B52' });
```

### 机制五：沉没成本投入加深

越用越放不下——因为用户在这里「建了东西」。

| 时间节点 | 投入内容 | 心理效应 |
|---------|---------|---------|
| 第 1 天 | 命名宠物 + 选 3 个性格标签 | 认同感投入 |
| 第 1 周 | 宠物学会你的工作时间规律 | 行为镜像——「它了解我」 |
| 第 2 周 | 解锁第一件家具，房间有了「你的风格」 | 空间所有权 |
| 第 1 月 | 宠物生成「成长相册」，可导出分享 | 历史叙事 |
| 第 3 月 | 宠物有专属记忆：「你上周连续工作了 5 天，我很骄傲」 | 情感历史 |

### 机制六：个性进化（你的宠物只有你有）

宠物外貌和台词随工作习惯演化——独特性让用户无法复制，也无法放弃。

| 工作习惯 | 宠物变化 |
|---------|---------|
| 夜间工作多（21:00 后 > 50% 番茄） | 眼睛变成猫眼，台词变「夜猫子」风格 |
| 长番茄多（50min 以上 > 30%） | 宠物戴上「学者眼镜」 |
| 频繁中断（平均暂停 > 3次/番茄） | 宠物偶尔发呆看窗外（「容易分心」性格） |
| 每天固定时间工作（差异 < 30min） | 宠物准时在桌边等你（「守时」性格） |

```typescript
function updatePersonality(stats: WorkStats, pet: Pet): Pet {
  const traits: PersonalityTrait[] = [];
  if (stats.nightRatio > 0.5)  traits.push('night_owl');
  if (stats.avgDuration > 45)  traits.push('deep_focus');
  if (stats.interruptRate > 3) traits.push('distracted');
  if (stats.timeVariance < 30) traits.push('punctual');
  return { ...pet, personality: traits };
}
```

### 机制七：限时季节事件（制造稀缺感）

```typescript
const SEASONAL_EVENTS = [
  { name: '除夕',   month: 1, day: 29, theme: 'lunar_new_year', petCostume: 'red_outfit', roomDeco: 'lanterns' },
  { name: '考试季', month: 6, day: 1,  theme: 'exam_season',    petCostume: 'glasses',    roomDeco: 'book_pile' },
  { name: '冬至',   month: 12,day: 21, theme: 'winter_solstice', petCostume: 'scarf',     roomDeco: 'snow' },
  { name: '生日',   special: 'user_anniversary',                  petCostume: 'party_hat', roomDeco: 'balloons' },
];
```

### 机制八：社交货币（把宠物变成可以炫耀的东西）

每天番茄完成后，生成一张「今日专属卡片」：
- 宠物当前外观 + 今日工作时长 + 宠物今日台词
- 一键复制为 PNG
- 高等级宠物卡片有专属背景和边框

```typescript
async function generateDailyCard(pet: Pet, stats: DailyStats): Promise<Blob> {
  // html2canvas 截取卡片区域
  const canvas = await html2canvas(document.getElementById('share-card')!);
  return new Promise(resolve => canvas.toBlob(blob => resolve(blob!)));
}

// 复制到剪贴板
navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
```

---

## 7. 休息时间交互

### 设计原则

1. **非强制**：交互卡可以滑走关闭，不惩罚不参与（Animal Crossing 原则）
2. **即时反馈**：点击后宠物立刻奔向对应家具，0 延迟（Nintendogs 原则）
3. **智能高亮**：饥饿低 → 喂食高亮；心情低 → 扔球高亮；亲密低 → 抚摸高亮

### 交互卡 UI

```
┌───────────────────────────────┐
│ 🎮 休息 5:00 · 选一个互动       │
│  ┌──────┐  ┌──────┐  ┌──────┐│
│  │  🍗  │  │  🎾  │  │  ✋  ││
│  │ 喂食 │  │ 扔球 │  │ 抚摸 ││
│  └──────┘  └──────┘  └──────┘│
└───────────────────────────────┘
```

### 扔球 Mini Game

1. 用户点击「扔球 🎾」
2. 球以抛物线飞向房间随机角落
3. 宠物全速奔跑追球（walk 动画）
4. 叼回球，放到用户脚边，骄傲抬头
5. 共 3 次后 30 秒 Cooldown
6. 奖励：心情 +25，亲密 +10

---

## 8. 时间感知氛围

用 `new Date().getHours()` 实时切换房间环境，让用户每个时段打开都有不同感受。

| 时间段 | 窗外 | 房间氛围 | 宠物状态 |
|-------|------|---------|---------|
| 清晨 6–9 | 朝阳 + 鸟 | 暖黄光从窗射入 | 伸懒腰，刚睡醒 |
| 上午 9–12 | 晴天 + 云 | 明亮充足 | 精力充沛 |
| 下午 12–17 | 正午蓝天 | 最亮，对比最高 | 正常状态 |
| 傍晚 17–20 | 橙色夕阳 | 暖橙色调，台灯亮起 | 稍显疲惫 |
| 夜晚 20–24 | 月亮 + 星星 | 台灯为主光源，蓝紫色窗外 | 可能打瞌睡 |
| 深夜 0–6 | 深夜月亮 | 昏暗，台灯柔光 | 睡觉 |

```typescript
function getRoomTheme(): RoomTheme {
  const hour = new Date().getHours();
  if (hour >= 6  && hour < 9)  return 'dawn';
  if (hour >= 9  && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'evening';
  if (hour >= 20 && hour < 24) return 'night';
  return 'latenight';
}
```

---

## 9. 成长弧度

### 5 阶段成长（原 7 阶段压缩，里程碑更密集）

```
🥚 蛋       →  🐣 幼崽     →  🐕 少年     →  🐕‍🦺 成年    →  🦮 长老
Level 0–5       6–15          16–30          31–50          51+
```

每个阶段解锁：
- **蛋→幼崽**：解锁喂食互动
- **幼崽→少年**：解锁扔球 mini game
- **少年→成年**：解锁房间家具定制
- **成年→长老**：解锁专属台词包和稀有外观

### XP 获取方式

| 行为 | XP |
|------|-----|
| 完成一个标准番茄（25min） | 100 |
| 完成长番茄（50min） | 250 |
| 休息时互动 | 30 |
| 完成每日目标（8个番茄） | 200 bonus |
| 连续 7 天 | 500 bonus |
| 神秘事件触发 | 50–200 随机 |

### 每日进度感

- **番茄进度**：角标显示 `已完成/目标`（如 `5/8`）
- **连续天数**：主屏显眼位置，火焰图标
- **连续加成**：7天+1.2x · 14天+1.5x · 30天+2x XP

---

## 10. 实施路线图

### 优先级矩阵

```
高成瘾 │ 季节事件    │ ★ 可变奖励  ★ 损失厌恶
       │ 社交卡片    │ ★ 接近效应  ★ 宠物消息
       ├─────────────┼─────────────────────────
低成瘾 │ 个性进化    │   状态条     XP条
       └─────────────┴─────────────────────────
         高成本           低成本
```

`★` = 优先实现（低成本高成瘾）

### 分阶段实施

#### P1 — 基础状态系统（1–2 天）
- [ ] 三栏状态条 UI（心情/饥饿/亲密）
- [ ] 状态衰减逻辑（`chrome.alarms` 定时触发）
- [ ] 思维泡泡组件（饥饿/心情 ≤ 10% 时出现）
- [ ] 插件角标实时更新

#### P2 — 可变奖励 + 接近效应（2–3 天）
- [ ] `rollReward()` 函数 + 神秘事件库
- [ ] XP 曲线调整（保证每次完成在 85–95% 附近）
- [ ] 神秘事件 UI（动画 + 文案展示）

#### P3 — 时间感知房间（1 天）
- [ ] `getRoomTheme()` 函数
- [ ] PetRoom 根据 theme 切换背景/窗户/灯光 CSS 变量

#### P4 — 番茄完成动画升级（2 天）
- [ ] 宠物奔向食盆动画序列
- [ ] 吃东西动画（新增 eating 帧或 CSS 动画）
- [ ] 完成庆祝序列（优于当前 Confetti）

#### P5 — 休息交互卡（3–4 天）
- [ ] 休息开始时叠加层 UI
- [ ] 喂食/扔球/抚摸三个动作响应
- [ ] 扔球 mini game（抛物线 + 宠物追球逻辑）

#### P6 — 损失厌恶 + 宠物消息（2 天）
- [ ] 多日未开状态级联衰减
- [ ] 「宠物给你发消息」通知系统
- [ ] 连续保护盾机制

#### P7 — 社交卡片（2 天）
- [ ] 卡片 UI 组件
- [ ] html2canvas 截图
- [ ] 复制到剪贴板

#### P8 — 季节事件 + 个性进化（1 周+）
- [ ] 节日判断 + 主题注入
- [ ] 工作习惯分析 → 性格标签
- [ ] 性格驱动外观/台词变化

---

## 参考资料

- [Nir Eyal — Hooked: How to Build Habit-Forming Products](https://www.nirandfar.com/hooked/)
- [Tamagotchi UX Design Lessons](https://www.ux-republic.com/en/emotional-design-what-the-tamagotchi-taught-us-without-saying-it/)
- [B.F. Skinner 可变比例强化研究](https://en.wikipedia.org/wiki/Reinforcement#Variable_ratio)
- [Duolingo Streak Design Case Study](https://www.nngroup.com/articles/streak-design/)
- [Animal Crossing: Sustainable Game Design](https://dl.acm.org/doi/10.1145/3474711)
- [QQ宠物设计历史](https://zh.wikipedia.org/zh-hans/QQ%E5%AE%A0%E7%89%A9)

---

*文档版本：v1.0 | 更新日期：2026-06-25 | 作者：Claude + 杨文航*
