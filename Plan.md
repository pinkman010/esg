# 远景能源 ESG 智能分析系统 — 实现方案

## 一、设计来源

融合桌面两张参考图：
- **`1.png`** — 产品级骨架（信息密度高、交互完善）
- **`前端.png`** — 视觉与配色参考（清新绿、mini 趋势图、品牌装饰）

---

## 二、技术方案

| 层级 | 选型 | 说明 |
|------|------|------|
| 框架 | React + Vite + TypeScript | 纯前端汇报系统，强调可维护的数据契约和类型约束 |
| 路由 | React Router HashRouter | 支持静态部署和本地预览，刷新不依赖后端路由 |
| 状态 | Zustand | 管理演示数据加载、错误状态和页面共享状态 |
| 样式 | Tailwind CSS | 原子化 CSS |
| 图表 | ECharts | 雷达图、饼图、折线图、柱状图 |
| 图标 | Lucide React | 轻量图标库 |
| 数据 | JSON 主契约 | GPT 生成数据保存为 `public/data/demo-dataset.json`，前端启动自动加载 |
| 校验 | Zod | 对 JSON 数据做运行时校验，避免字段缺失导致空白页 |
| 素材 | 自制 SVG + 公开/重绘 Logo | Logo、风机、光伏、背景线条均适合内部汇报演示 |

---

## 三、关键澄清

### 纯前端演示
当前版本只服务结项汇报，不接真实后端、不做登录、不做在线抓取。

### 数据契约驱动
页面不直接写死 mock 数据，而是统一消费 `DemoDataset` 标准模型。后续 GPT 重新生成数据时，只需要替换同结构 JSON。

### 后端可对接
虽然当前没有后端接口，但架构保留 repository 层。后续 FastAPI 后端可新增聚合接口：

```
GET /api/v1/frontend/demo-dataset
```

只要返回结构与 `demo-dataset.json` 一致，页面组件不需要重构。

### 不再使用 Mock.js + Axios
本项目不是模拟接口联调，而是前端汇报系统。使用 JSON 文件 + repository 更直接，也更贴近结项演示场景。

---

## 四、核心功能

### 1. 首页总览

- 汇总披露缺口、强制披露缺口、竞对议题得分、高风险舆情。
- 展示三模块汇报链路：GPT 结构化数据、披露差距分析、竞对议题分析、Claw 舆情监测。
- 展示标准匹配进度、优先披露补强项、Claw 议题热度。

### 2. 政策与 ESG 报告披露分析模块

- 对比远景能源 2024 年 ESG 报告与 ESRS / GRI 条款。
- 区分强制披露、自愿披露。
- 展示披露状态：已披露、部分披露、未披露。
- 展示差距等级：重大差距、轻微差距、无差距。
- 支持按标准、ESG 维度、披露属性、披露状态、差距等级筛选。
- 展示证据片段、来源页码和补充建议。

### 3. 实质性议题竞对分析模块

固定竞对范围：

- 远景能源
- 西门子能源
- VESTAS
- 明阳智能
- 金风科技

页面能力：

- 五家公司实质性议题雷达图。
- 远景相对竞对均值的差距项。
- 议题覆盖热力图。
- 选中议题下的公司证据详情。

### 4. Claw 舆情监测模块

- 展示 Claw 工具抓取后的舆情结果看板。
- 当前不做真实在线抓取。
- 展示舆情条数、触达声量、高风险事件、负面声量。
- 支持按公司、情绪、风险等级筛选。
- 将舆情事件关联到实质性议题，用于说明外部声量如何影响议题重要性判断。

---

## 五、数据契约

主数据文件：

```
public/data/demo-dataset.json
```

顶层结构：

```ts
{
  meta: {
    projectName: string
    reportYear: number
    generatedAt: string
    dataVersion: string
  }
  companies: Company[]
  reports: Report[]
  standards: {
    esrs: StandardClause[]
    gri: StandardClause[]
  }
  policyDisclosureAnalysis: DisclosureGap[]
  materialityBenchmark: MaterialityBenchmarkItem[]
  publicOpinion: PublicOpinionItem[]
  auditTrail: AuditEvent[]
}
```

关键约束：

- `companies` 固定包含远景能源、西门子能源、VESTAS、明阳智能、金风科技。
- `standards.esrs` / `standards.gri` 必须包含条款编号、议题、维度、强制/自愿属性和披露要求。
- `policyDisclosureAnalysis` 必须包含条款、远景报告证据、披露状态、差距等级和建议。
- `materialityBenchmark` 必须按公司 + 议题组织，支持竞对热力图和雷达图。
- `publicOpinion` 必须包含来源、发布时间、情绪、风险等级、触达量和关联议题。

---

## 六、项目结构

```
esg-dashboard/
├── public/
│   ├── brand/
│   │   ├── envision-logo.svg
│   │   └── renewable-bg.svg
│   └── data/
│       └── demo-dataset.json
├── scripts/
│   └── serve-dist.mjs
├── src/
│   ├── components/
│   │   ├── AppShell.tsx
│   │   ├── Badge.tsx
│   │   ├── EChart.tsx
│   │   ├── MetricCard.tsx
│   │   └── Panel.tsx
│   ├── lib/
│   │   └── analytics.ts
│   ├── pages/
│   │   ├── OverviewPage.tsx
│   │   ├── PolicyDisclosurePage.tsx
│   │   ├── MaterialityBenchmarkPage.tsx
│   │   └── ClawMonitorPage.tsx
│   ├── repositories/
│   │   └── demoDataRepository.ts
│   ├── store/
│   │   └── useDemoStore.ts
│   ├── types/
│   │   └── dataset.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── README.md
├── index.html
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 七、执行步骤

1. 初始化 Vite + React + TypeScript 项目。
2. 安装依赖：React Router、Tailwind、ECharts、Zustand、Zod、Lucide。
3. 定义 `DemoDataset` 数据契约和 Zod 校验规则。
4. 编写 `demoDataRepository`，从 `public/data/demo-dataset.json` 加载数据。
5. 建立四个页面入口：首页总览、政策与披露分析、实质性议题竞对分析、Claw 舆情监测。
6. 用 ECharts 实现雷达图、饼图、折线图、柱状图。
7. 按 1586 × 992 桌面视口和移动端视口验证布局。
8. 运行构建并修复类型、数据契约和渲染问题。

---

## 八、运行方式

```powershell
cd esg-dashboard
npm.cmd install
npm.cmd run dev
```

浏览器访问：

```text
http://127.0.0.1:5173/
```

生产构建：

```powershell
npm.cmd run build
```

预览构建结果：

```powershell
npm.cmd run preview
```

浏览器访问：

```text
http://127.0.0.1:4173/
```

PowerShell 下优先使用 `npm.cmd`，避免 `npm.ps1` 被执行策略拦截。

---

## 九、验证状态

- `npm.cmd run build` 已通过。
- 四个页面均可访问。
- 控制台无运行错误。
- 1586 × 992 桌面视口无横向溢出。
- 390 × 844 移动视口无横向溢出。
- 当前构建存在 ECharts 包体积提示，不影响内部汇报演示。
