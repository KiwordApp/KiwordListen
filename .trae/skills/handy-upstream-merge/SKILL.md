---
name: "handy-upstream-merge"
description: "审计并合并 listen 与 Handy 上游版本差异，保护 listen 业务目录。Invoke when 需要同步 Handy 新版本、分析升级影响或创建合并分支时。"
---

# Handy Upstream Merge

这个 skill 用于把 listen 当前分支与 Handy 上游新版本进行结构化合并，目标是：

- 尽量吸收 Handy 的通用能力更新
- 明确保留 listen 的业务隔离目录和专属配置
- 在每次升级时产出可复核的差异结论、冲突决议和验证结果

## 何时使用

当出现以下情况时调用本 skill：

- 用户要求“合并 Handy 最新代码”
- 用户要求“同步 upstream 到某个版本”，例如 `v0.9.4`
- 用户要求“评估 Handy 新版本会影响哪些文件/模块”
- 用户要求“创建 Handy 升级分支并开始处理冲突”

## 开始前必读

开始执行前，先读取以下文件：

1. `docs/ARCHITECTURE.md`
2. `openspec/changes/upgrade-handy-upstream-0-9-3/tasks.md`
3. `openspec/changes/upgrade-handy-upstream-0-9-3/diff-analysis.md`

如果将来有更新版本对应的新 OpenSpec，优先读取最新版本的升级文档。

## listen 项目事实

### 当前已知基线

- `main` 历史上是基于 Handy `v0.8.1` 合并而来
- 已确认的历史基线提交：`e3cf04696df9e896686ddb8b2ae0aaed107735d2`
- `upstream` 远端指向：`https://github.com/cjpais/Handy.git`

注意：以上信息是已知经验值。真正执行升级前，仍然要先通过 `git` 和当前 OpenSpec 再确认一次，避免基线漂移。

### 必须保护的 listen 目录

这些目录默认不能被上游直接覆盖：

- `src/listen/**`
- `src-tauri/src/listen/**`
- `src-tauri/src/adapters/**`
- `server/**`

### 优先吸收上游的目录

这些目录通常应以 Handy 上游为准：

- `src-tauri/src/handy_core/**`
- `src/components/**`
- `src/hooks/**`
- `src/i18n/**`
- `.github/workflows/**`

### 必须人工融合的文件

这些文件即使要同步，也不能盲目整包覆盖：

- `src/App.tsx`
- `src/main.tsx`
- `src-tauri/src/lib.rs`
- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`
- `src-tauri/tauri.conf.json`
- `package.json`
- `bun.lock`
- `src/bindings.ts`

### 合并时必须保留的 listen 特性

- Deep Link 协议名必须保持为 `listen`
- 应用标识必须保持为 `top.listen.desktop`
- 登录回传使用 `handoff_token` 协议，且 token 一次性消费
- listen 登录成功后要自动回到首页并关闭登录模态框
- 调试入口中要保留“登录与 Deeplink 调试”
- 业务 UI 继续放在 `src/listen/ui` 与 `src-tauri/src/listen/ui`

## 推荐执行流程

### 1. 审计当前仓库状态

先执行：

```powershell
git status --short --branch
git remote -v
git fetch upstream --tags
git tag --list "v0.9.*"
git ls-remote --tags upstream "refs/tags/v0.9.4"
```

规则：

- 如果工作区不干净，先停下来说明有哪些未提交文件
- 不要擅自 `reset --hard`、`checkout --` 或清空用户改动
- 若用户要求继续升级，优先建议先提交或单独分支承接

### 2. 确认升级目标和比较基线

优先确认两件事：

- 当前 listen 基线来自哪个 Handy tag/commit
- 本次目标是哪个上游 tag，例如 `v0.9.4`

建议先做差异审计：

```powershell
git diff --stat e3cf04696df9e896686ddb8b2ae0aaed107735d2..v0.9.4
git log --oneline e3cf04696df9e896686ddb8b2ae0aaed107735d2..v0.9.4
```

然后把文件分成三类：

1. 上游优先同步区
2. listen 保护区
3. 人工融合区

### 3. 创建升级分支和回滚锚点

分支命名建议：

```powershell
git switch -c feat_merge_handy_0.9.4
```

回滚锚点建议：

```powershell
git tag backup/pre-merge-handy-0.9.4
```

如果分支已存在，继续在已有升级分支上工作即可，但要先说明当前分支状态。

### 4. 先同步上游优先目录

推荐优先同步后端核心，再同步前端通用层：

```powershell
git checkout v0.9.4 -- src-tauri/src/handy_core
git checkout v0.9.4 -- src/components src/hooks src/i18n
git checkout v0.9.4 -- .github/workflows
```

规则：

- 不要覆盖 `src/listen/**`、`src-tauri/src/listen/**`、`src-tauri/src/adapters/**`
- 如果上游新增了 listen 也需要消费的公共模块，要先说明再引入

### 5. 人工融合共享入口和配置

下面这些点最容易出问题，必须逐项检查：

- `src-tauri/src/lib.rs` 的模块装配是否仍兼容 listen 自有模块
- `src-tauri/tauri.conf.json` 是否保留了 `top.listen.desktop`、`listen` 协议、自定义 updater 行为
- `package.json`、`bun.lock`、`Cargo.toml`、`Cargo.lock` 是否引入了必要升级，但没有丢失 listen 依赖
- `src/App.tsx`、`src/main.tsx` 是否仍然让 listen UI 作为主入口
- `src/bindings.ts` 是否需要重新生成

### 6. 重点检查已知高风险兼容点

从 `v0.8.1 -> v0.9.x` 的历史经验看，以下点要优先核对：

- 录音接口变化：`with_partial_callback` 迁移为 `with_audio_callback`
- VAD 策略和录音回调契约是否变化
- 转录引擎是否继续沿用 `TranscribeCpp`
- `catalog`、`portable`、`subscription` 等模块路径是否有新增或调整
- GPU 设备枚举、模型能力判断和配置读写是否改动
- 登录、Deep Link、更新检查、本地 LLM 管理是否被共享入口改坏

### 7. 重新生成绑定并验证

按下面顺序执行验证：

```powershell
bun run bindings:generate
bunx tsc --noEmit
bun run lint
cargo check --manifest-path src-tauri/Cargo.toml
```

如有必要再补：

```powershell
cargo test --manifest-path src-tauri/Cargo.toml
bun run format:check
```

### 8. 交付时必须输出的内容

每次执行结束后，必须给出：

1. 本次比较基线和目标版本
2. 已同步的上游目录
3. 被保护未覆盖的 listen 目录
4. 人工融合的文件清单
5. 发现的冲突点与决议
6. 验证命令与结果
7. 尚未完成的遗留问题

## 决策规则

### 可以直接同步的情况

- 纯上游技术实现目录，且 listen 没有业务改造
- 纯国际化、CI、公共组件增强，且不会破坏 listen 入口

### 需要停下来确认的情况

- 目标文件同时承载 Handy 共享逻辑和 listen 业务逻辑
- 上游变更涉及 Deep Link、窗口启动流、Updater、登录流
- 工作区已有未提交改动，且与升级文件交叉

### 禁止行为

- 禁止直接覆盖 listen 业务目录
- 禁止为了“合并成功”而删除 listen 登录、调试、LLM、本地更新能力
- 禁止跳过验证步骤就宣称升级完成

## 输出风格

默认按下面结构汇报：

```markdown
## 升级结论

- 基线：...
- 目标：...

## 已同步

- ...

## 冲突与处理

- ...

## 验证结果

- ...

## 遗留项

- ...
```

## 示例触发语句

- “请把 listen 同步到 Handy v0.9.4”
- “分析一下 Handy v0.9.4 相比我们当前基线会改哪些模块”
- “拉一个合并 Handy 新版本的分支并开始处理冲突”
