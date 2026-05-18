# 远景能源 ESG 前端汇报系统

纯前端结项汇报系统，用于展示远景能源 ESG 披露差距、实质性议题竞对分析和 Claw 舆情监测结果。

当前版本不连接真实后端，所有展示数据来自 `public/data/demo-dataset.json`。架构保留数据读取层，后续接 FastAPI 后端时优先替换 repository，不重构页面。

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

- 展示 Claw 工具抓取后的舆情结果看板。
- 当前不做真实在线抓取。
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

主数据文件：

```text
public/data/demo-dataset.json
```

前端启动时会读取并校验该文件。核心结构：

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

当前页面不直接读取后端接口。页面只依赖 `DemoDataset` 标准模型。

后续对接 `C:\Alvin\SUFE\整合实践\envision` 一类 FastAPI 后端时，推荐新增聚合接口：

```text
GET /api/v1/frontend/demo-dataset
```

接口直接返回与 `demo-dataset.json` 一致的数据结构。

前端只需要把：

```ts
fetch('/data/demo-dataset.json')
```

替换为：

```ts
fetch('/api/v1/frontend/demo-dataset')
```

这样页面组件、筛选逻辑、图表逻辑都不需要重构。

## 目录结构

```text
public/
  brand/                 自制 Logo 与新能源背景素材
  data/demo-dataset.json 纯前端演示数据
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
