# [PRD] kiword Listen (v1.1)

---

## 一、 产品概述与定位

* **功能命名**：**kiword Listen**
* **母体产品**：kiword
* **平台顺序**：**Windows 首发**（Windows 10 Build 20348+ / Windows 11），macOS 后续跟进。
* **一句话价值主张**：
  > *“The on-device auditory intelligence for your AI agents. 100% private, zero-cloud.”*  
  > （运行在本地的 AI 听觉智能中枢：为 Claude 提供实时会议参谋、课堂提炼与声纹执行闭环，零音频上传云端）
* **核心场景覆盖**：
  1. **跨国/商业会议（Meetings）**：进程级内录对方声音、声纹识别与联系人绑定、Claude 实时反击支招、一键 Follow-up 邮件与日历闭环。
  2. **大学/专业讲座（Lectures）**：长时间单人讲授录音、实时翻译理解难懂术语、Claude 结合讲义实时答疑与考点梳理。
  3. **专业听写助手（Dictation Assistant）**：不限时自由语音长录音与结构化转录。

---

## 二、 商业化模型与权益边界

* **试用机制**：**14 天全功能免费试用（无需绑定信用卡）**。
* **分级定价**：
  * **kiword 基础版 ($9/year)**：系统级光标短语音听写 + 本地 LLM 清洗去语气词。
  * **kiword Listen 专业版 ($99/year)**：解锁进程级内录、声纹识别、Google 生态联动、Local MCP Server、实时翻译字幕与不限时会议/讲座模式。
* **Founders Club（上线前 90 天专属策略）**：
  * **权益**：**“3-Year Founder Pass for $99”**（付 1 年享 3 年更新权限）。
  * **特权**：永久专属 Founder 软件内徽章、内测 Discord 频道权限、永久锁定续费不涨价特权。

---

## 三、 功能详细需求说明 (Functional Specifications)

---

### 【P0】核心基石：捕获、声纹与本地管理

#### 1. 进程级音频监听与录音 (Process-level Audio Capture)
* **技术方案 (Windows Native)**：
  * 采用 Windows 10 (Build 20348+) / Windows 11 原生的 **WASAPI Process Loopback** (`AUDIOCLIENT_ACTIVATION_PARAMS` 搭配 `PROCESS_LOOPBACK_MODE`)。
  * **硬性要求**：**严禁强迫用户安装第三方虚拟声卡驱动（如 Virtual Audio Cable）**，实现即装即用。
* **交互流程**：
  * 录制前弹出极简模式选择：
    * **[Meeting 模式]**：默认勾选【系统麦克风 (我)】+【指定会议应用 (对方)】。
    * **[Lecture 模式]**：可单独勾选【浏览器/播放器声音】或【系统全局扬声器】。
  * 软件自动探测正在运行的音频进程，支持下拉单选：`Zoom.exe`, `Teams.exe`, `Chrome.exe`, `Edge.exe`, `Spotify.exe` 等。只捕获目标程序声音，自动隔离系统杂音（如邮件提示音、微信响铃）。

#### 2. 声纹分离与识别 (Voice ID / Speaker Recognition)
* **本地声纹引擎**：本地运行轻量级声纹 Embedding 提取算法。
* **未命名识别**：多说话人场景自动区分 `Speaker 1`, `Speaker 2`...
* **声纹本地库（Voiceprint DB）**：
  * 用户可点击发言人名称进行重命名（例如输入 “Alex”）。
  * 软件将提取该声音的声纹特征向量，持久化存储在本地 SQLite 数据库中。
  * **永久记忆**：未来无论在哪个会议中，只要检测到该特征向量（余弦相似度达到阈值），**系统自动将其标记为“Alex”**。

#### 3. 听写文档生成与导出 (Format & Export)
* **结构化转写流**：
  * 区分发言人、带时间戳的段落展示。
  * **Lecture 模式下**：自动弱化说话人标签，按静音间隔与语义自动进行 **Markdown 标题分段（Chaptering）**。
* **一键复制栏（顶部常驻）**：
  * **Copy Clean Text**：过滤一切时间戳与符号，仅保留语义文本。
  * **Copy Markdown**：标准 Markdown（`**Alex**: text`），便于无缝粘进 Notion / Obsidian。
  * **Copy HTML**：带轻量样式的富文本，可直接粘贴进 Gmail / Outlook / Word。

#### 4. 本地历史记录管理 (Local History Manager)
* **界面结构**：
  * **左侧列表**：按时间倒序排列会议/讲座条目。展示元数据：录音类型（Meeting/Lecture）、日期、时长、识别出的参会人员头像/缩写。
  * **右侧详情**：完整的对话/讲座全文时间轴。
* **本地搜索**：支持对转录文本的全局关键词秒级高亮检索（基于 SQLite FTS5 本地全文索引）。
* **数据清理**：支持单条删除或批量清理本地音频缓存，释放硬盘空间。

---

### 【P1】智能互联：Google 生态与 Local MCP Server

#### 1. Google 账户资产集成 (Google Workspace Integration)
* **授权机制**：客户端设置页提供 `Connect Google Workspace`，使用系统默认浏览器唤起 OAuth 2.0 登录。
* **联动逻辑**：
  * **Google Contacts 自动映射**：在声纹重命名时，用户只要敲入名字开头的字母，输入框自动弹出 Google 联系人下拉候选单。绑定后，该声纹自动关联对应的电子邮箱。
  * **Google Tasks 待办同步**：允许将提炼出的行动项一键推送到 Google 待办清单。
  * **Google Calendar 日程联动**：自动关联当前时间正在进行的 Google 日历日程，默认用日程名称作为转写文档标题。

#### 2. Local MCP Server 实现 (The Voice Bridge to Claude)
* **服务生命周期**：
  * `kiword.exe` 启动后，在后台静默启动 `kiword-mcp-server.exe`，支持标准 `stdio` 协议。
* **Windows 一键自动配置 (Zero-Config Setup)**：
  * 客户端提供 **"One-Click Connect to Claude Desktop"** 按钮。
  * 点击后，客户端直接检测并自动修改 Windows 下 Claude 的配置文件路径：
    `%APPDATA%\Claude\claude_desktop_config.json`
    ```json
    {
      "mcpServers": {
        "kiword-listen": {
          "command": "C:\\Program Files\\kiword\\resources\\kiword-mcp-server.exe"
        }
      }
    }
    ```
* **向 Claude / Agent 暴露的核心 Tools**：

| Tool 名称 | 参数定义 | 功能描述 |
| :--- | :--- | :--- |
| `get_live_transcript` | `last_n_minutes` (int, 默认 5)<br>`mode` ("meeting" 或 "lecture") | **会中/课中实时调用**。Claude 拉取最近几分钟清洗后的高质量文字，用于实时支招答疑。 |
| `get_active_participants` | 无 | 获取当前会议中由声纹识别绑定的参会者元数据（包含姓名、邮箱、发言时长）。 |
| `send_meeting_email` | `to` (array)<br>`subject` (string)<br>`body_html` (string) | Claude 根据会议内容自动草拟 Follow-up 邮件后，调用此工具直接发出。 |
| `sync_tasks_and_events` | `tasks` (array)<br>`next_event` (object, optional) | 将 Claude 总结的行动项写入 Google Tasks，或在 Google Calendar 建立后续跟踪日程。 |

---

### 【P2】体验跃迁：实时翻译与课堂增强

#### 1. 实时悬浮双语字幕 (Live Subtitle Overlay)
* **HUD 交互**：
  * Windows 顶层常驻（Always-on-Top）无边框悬浮条，可吸附于屏幕底部或会议软件下方。
  * 快捷键全局唤起/隐藏：`Ctrl + Shift + L`。
  * 支持调节背景透明度、字号大小。
* **流式双语展示**：
  * 上排（淡色）：对方外语原文。
  * 下排（高亮）：本地模型翻译出的母语（中/英/日等）。
* **性能指标**：端到端延迟控制在 **< 1.0 秒**，确保视觉与听觉同步。

#### 2. Lecture (讲座/课堂) 专属强化
* **Claude 提示词预设（MCP Prompts）**：
  * 内置 `/lecture-notes`：自动按学术提纲格式重构整堂课笔记。
  * 内置 `/exam-flashcards`：提取讲师强调的核心概念，生成 Q&A 形式的复习卡片。

---

## 四、 非功能性需求与本地架构基准 (NFR)

1. **硬件与推理基准 (DirectML on Windows)**：
   * 本地推理必须优先采用 **ONNX Runtime (DirectML)**，确保通吃 NVIDIA 独显、AMD 显卡、Intel 核显（Iris Xe / Intel Arc / NPU）。
   * 运行时整体 CPU 占用率稳定在 **≤ 20%**，内存占用 **≤ 1.5 GB**，杜绝导致办公轻薄本发热降频。
2. **企业级隐私承诺 (Data Sovereignty)**：
   * 所有录制的临时音频、转写文本、声纹特征向量仅保存在 Windows 本地目录：
     `%LOCALAPPDATA%\kiword\data\`
   * 软件界面常驻标识：*“100% On-Device Processing. No audio leaves this PC.”*

---

## 五、 团队落地开发里程碑规划 (Milestones)

* **Phase 1 (Sprint 1-2) [P0 核心通道打通]**：
  * 完成 Windows WASAPI 进程级内录模块；
  * 本地 Whisper 转写跑通并支持 Markdown/HTML 导出；
  * 简易本地历史管理界面完成。
* **Phase 2 (Sprint 3-4) [P0 声纹 + P1 MCP 协议联动]**：
  * 声纹提取与本地 SQLite 数据库持久化匹配；
  * 实现 Windows 端 Local MCP Server，打通与 Claude Desktop 的实时拉取与协同；
  * 封装 Google Contacts 同步。
* **Phase 3 (Sprint 5) [P1 执行闭环 + P2 实时字幕]**：
  * 打通 Claude 发邮件与同步 Tasks 的 Action 链条；
  * 完成 Windows 顶层透明双语字幕悬浮窗；
  * 灰度邀请第一批 Windows 种子用户开启 Founders Club 测试。