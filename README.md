# 远景能源 ESG 前端汇报系统

纯前端结项汇报系统，用于展示远景能源 ESG 披露差距、实质性议题竞对分析和 Claw 舆情监测结果。

当前版本不连接真实后端，前端运行时读取两类本地静态数据：`public/data/demo-dataset.json` 提供基础演示数据，`public/generated/full-standard-disclosure.json` 提供 ESRS / GRI 全量标准库及披露差距分析，并在加载后覆盖基础数据中的标准库和披露分析字段。架构保留数据读取层，后续接 FastAPI 后端时优先替换 repository，不重构页面。

## 核心模块

### 1. 首页总览

- 汇总披露缺口、强制披露缺口、竞对议题得分、高风险舆情。
- 展示数据链路：GPT 结构化数据、披露差距分析、竞对议题分析、Claw 舆情监测。
- 展示标准匹配进度、优先披露补强项和 Claw 热点议题。

### 2. 政策与 ESG 报告披露分析

- 对比远景能源 ESG 报告与 ESRS / GRI 条款。
- 区分强制披露、自愿披露。
- 展示披露状态、差距等级、证据片段和补充建议。
- 支持按标准、ESG 维度、披露属性、披露状态和差距等级筛选。

### 3. 实质性议题竞对分析

固定竞对范围：

- 远景能源
- 西门子能源
- VESTAS
- 明阳智能
- 金风科技

页面展示：

- 五家公司实质性议题雷达图。
- 远景相对竞对均值的差距项。
- 议题覆盖热力图。
- 每家公司在选中议题下的证据详情。

### 4. Claw 舆情监测

- 展示 Claw 工具抓取后同步到前端的公司级舆情结果看板。
- 当前不做真实在线抓取。
- 当前页面不展示 Claw 批次文件中的行业级信号；这些信号保留在 `data/claw_public_opinion_*.json` 的 `excludedIndustryRecords` 中，用于审计回溯。
- 展示舆情条数、触达声量、高风险事件、负面声量。
- 支持按公司、情绪、风险等级筛选。
- 将舆情事件关联到实质性议题，用于说明外部声量对议题重要性判断的影响。

## 技术栈

- Vite
- React
- TypeScript
- Tailwind CSS
- Zustand
- ECharts
- React Router
- Zod
- Lucide React

## 运行方式

进入项目目录：

```powershell
cd C:\Users\43480\Desktop\esg-dashboard
```

安装依赖：

```powershell
npm.cmd install
```

启动开发服务：

```powershell
npm.cmd run dev
```

访问：

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

访问：

```text
http://127.0.0.1:4173/
```

如果 `npm` 在 PowerShell 下被执行策略拦截，使用 `npm.cmd`。

## 数据契约

前端数据文件：

```text
public/data/demo-dataset.json
public/generated/full-standard-disclosure.json
```

前端启动时会先读取并校验 `public/data/demo-dataset.json`，再读取 `public/generated/full-standard-disclosure.json`。全量标准库文件用于覆盖 `standards` 与 `policyDisclosureAnalysis`，是政策披露模块的关键依赖；如果该文件缺失、加载失败或结构不符合契约，当前实现会导致整体数据校验失败，页面无法正常展示。

当前版本已将 Claw 前端公司级舆情样本更新为 2026-06-03 批次数据。Claw 批次文件中的行业级信号未进入当前前端页面展示，仅保留在本地数据文件中用于审计回溯。

当前竞对报告样本仍为 2024 年报告，不代表截至 2026-06-04 的最新公开报告全量覆盖。需要更新到 2025 年或更晚报告时，应重新抽取报告、重建实质性议题竞对分析和相关证据。

核心结构：

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

类型定义位于：

```text
src/types/dataset.ts
```

数据读取与校验位于：

```text
src/repositories/demoDataRepository.ts
```

## 后端对接方式

当前页面不直接读取后端接口。页面最终只依赖合并后的 `DemoDataset` 标准模型，但本地静态模式下由 repository 同时读取基础数据和全量标准库数据。

后续对接 `C:\Alvin\SUFE\整合实践\envision` 一类 FastAPI 后端时，推荐新增聚合接口：

```text
GET /api/v1/frontend/demo-dataset
```

接口直接返回完整 `DemoDataset` 数据结构，包含标准库、披露差距分析、实质性议题、舆情和审计记录。

前端建议把当前两个静态数据读取点：

```ts
fetch('/data/demo-dataset.json')
fetch('/generated/full-standard-disclosure.json')
```

替换为单一聚合接口：

```ts
fetch('/api/v1/frontend/demo-dataset')
```

这样页面组件、筛选逻辑、图表逻辑都不需要重构。若后端仍拆分基础数据和全量标准库，也需要保持二者的加载顺序、字段覆盖关系和失败处理口径一致。

## 目录结构

```text
public/
  brand/                 自制 Logo 与新能源背景素材
  data/demo-dataset.json 基础演示数据
  generated/             全量标准库与披露差距分析数据
data/                    本地原始资料与中间数据；Claw 行业级信号保留在批次文件中，不参与当前页面展示
src/
  components/            通用 UI 与图表组件
  lib/                   统计、格式化、聚合函数
  pages/                 四个汇报页面
  repositories/          数据读取与校验
  store/                 Zustand 全局状态
  types/                 数据契约
```

## 验证

已验证：

- `npm.cmd run build` 构建通过。
- 四个页面均可访问。
- 控制台无运行错误。
- 1586 x 992 桌面视口无横向溢出。
- 390 x 844 移动视口无横向溢出。

构建时可能出现 ECharts 包体积提示。这是图表库体积导致的提示，不影响内部汇报演示。
