# Listen 项目规则（AI 开发指南）

## 核心定位

- 基于 Handy 的离线转写应用，扩展家长任务管理业务
- 三层架构：handy_core（上游核心）/ adapters（桥接，规划中）/ Listen（业务）

目录结构

- `handy_core/`：上游 Handy 完整项目（独立 git 仓库），前端 `handy_core/src/`，后端 `handy_core/src-tauri/`；上游代码默认不改
- `src/listen/ui/`：Listen 业务 UI，新增业务代码都在这里
  - `components/`：规范组件（KiwordButton、KiwordCard、Modal、KiwordDropdownMenu、CloseButton 等）
  - `theme/`：`kw-*` 设计令牌（variables.css）与字体
- `src/types/`：业务类型（如 subscription.ts）
- 绑定：`handy_core/src/bindings.ts`（自动生成）

## 开发原则

- 依赖方向：Listen → adapters → handy_core（adapters 尚未建立，业务层暂直接依赖上游）
- 业务能力只放 Listen（根 `src/listen`、`src/types` 等），桥接只放 adapters，不在 handy_core 加业务
- UI 相关业务代码放在 `src/listen/ui`，避免修改 handy_core 里的旧 UI 实现
- 文案必须走 i18next，不写 JSX 硬编码
- 使用 @/ 路径别名，避免深层相对路径
- TypeScript 严格模式，避免 any
- 所有 `bun` / `cargo` 命令默认在 `handy_core/` 目录内执行
- 修改 `handy_core/src-tauri` 中带 `#[specta::specta]` 的命令、事件或相关类型后，必须在 `handy_core/` 内执行 `bun run bindings:generate`，确保 `handy_core/src/bindings.ts` 与后端同步

## 数据流

- 语音 → handy_core 录音与转写 → adapters 转换（规划中） → Listen 任务提取与存储

## 编码简洁性原则（借鉴 Ponytail，"懒人资深开发者"模式）

写任何代码前，先按顺序过一遍决策阶梯，停在第一个成立的层级：

1. 这个功能真的需要吗？（YAGNI，不需要就跳过）
2. 代码库里已有同样能力？→ 复用，不要重写
3. Rust 标准库 / 浏览器原生 API 能做？→ 用现成的
4. 已安装的依赖（如 lucide-react、已有的 utils）能解决？→ 用它，不引新依赖
5. 能一行搞定？→ 就写一行
6. 都不行，才写能工作的最小代码

硬性约束：

- 不添加未被要求的抽象、配置项、兜底逻辑和样板代码
- 删除优于新增，朴素方案优于巧妙方案，文件数越少越好
- 按改动规模分级验证，不做全量自动检查：
  - 琐碎改动（文案、注释、纯样式类名、单行修改）：不跑命令，依赖 IDE 诊断即可
  - 前端逻辑改动：只跑 `bunx tsc --noEmit`；新增/修改业务组件时再加 `bun run lint`
  - Rust 改动：只跑 `cargo check`；改了带 `#[specta::specta]` 的命令/类型才加 `bun run bindings:generate`
  - 核心逻辑（算法、状态转换、数据流）：只跑相关的 `cargo test`（指定模块，不全量）
  - 全量组合（lint + tsc + cargo check）只在提交前或跨层大改动后各跑一次
- 永不省略：信任边界的输入校验、防数据丢失的错误处理、安全、无障碍、明确要求的功能

优先级：**Listen 项目规范 > 本节通用规则**。例如"能用原生就用原生"不适用于 UI——组件仍必须用 `KiwordButton` / `KiwordCard` / `Modal`，颜色圆角仍必须用 `kw-*` 令牌，文案仍必须走 i18next。

## UI 组件规范

- 详见 [ui_components.md](./ui_components.md)
- 核心约束：新 UI 必须优先使用 `KiwordButton` / `KiwordCard` / `Modal` 等规范组件（位于 `src/listen/ui/components/`）
- 颜色/圆角必须使用 `kw-*` 设计令牌，禁止 Tailwind 原生值（如 `gray-*`、`rounded-lg`）
