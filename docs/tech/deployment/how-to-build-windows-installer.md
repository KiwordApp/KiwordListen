# Windows 环境下编译和打包 Listen (Tauri) 安装包指南

本文档记录了在 Windows 系统下编译和打包 Listen（基于 Tauri 和 Rust，包含 Whisper/Vulkan C++ 原生依赖）时可能遇到的常见问题及其标准解决方案。

## 0. 相关文档索引

- 构建与打包指南：本文档
- 桌面登录与 Deeplink 测试说明：[desktop-login-deeplink-test-guide.md](./desktop-login-deeplink-test-guide.md)
- Windows 商用签名指南：[windows-commercial-release-signing-guide.md](./windows-commercial-release-signing-guide.md)
- 内存分析报告：[Listen-memory-analysis-report.md](./Listen-memory-analysis-report.md)

## 1. 准备环境

在开始之前，请确保你的 Windows 开发环境安装了以下工具：

- **Rust**: 推荐使用 `rustup` 安装最新稳定版。
- **Bun**: 用于前端依赖管理和执行脚本。
- **CMake**: 用于编译 C++ 依赖（如 `whisper.cpp`）。
- **LLVM / Clang**: C++ 编译工具链（需要设置 `LIBCLANG_PATH` 环境变量）。
- **Visual Studio 2022 Build Tools**: 必须包含 "使用 C++ 的桌面开发" (Desktop development with C++) 工作负载，否则会报缺少 `cl.exe` 或 MSVC 相关的错误。

## 2. 常见问题及排查过程

在编译这个包含深度 C++ 依赖（特别是涉及 Whisper 和 Vulkan Shaders）的 Tauri 项目时，你可能会遇到以下几个典型错误：

### 🚨 错误一：`program not found` (找不到 cmake 或 cl.exe)

- **现象**：终端报错 `failed to execute command: program not found` 或 CMake 配置时直接返回 `exit code: 1`。
- **原因**：系统未安装 CMake，或者未安装 Visual Studio 2022 C++ 构建工具，亦或是 MSVC 编译器的路径未加入到环境变量中。
- **解决**：
  1. 安装所需工具：可以使用 `winget install Kitware.CMake` 来快速安装 CMake。确保 Visual Studio 2022 Build Tools 中包含了 "使用 C++ 的桌面开发" 工作负载。
  2. **手动配置环境变量（针对 `cl.exe` 找不到的问题）**：如果安装后依然报错找不到 `cl.exe`，你需要手动将 MSVC 的 bin 目录添加到系统的 `PATH` 环境变量中。例如，将类似以下路径加入系统 `PATH`：
     `C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\14.44.35207\bin\Hostx64\x64`
     _(注意：版本号 `14.44.35207` 可能会随你安装的 VS 版本有所不同，请根据实际情况查找)_

### 🚨 错误二：CMake 生成器缓存冲突

- **现象**：`CMake Error: Error: generator : Visual Studio 17 2022 Does not match the generator used previously: Visual Studio 18 2026`
- **原因**：在排查环境问题时，使用了不同的终端（或更新了 VS 工具），导致 `src-tauri/target` 下残留了不同版本的 CMake Cache。
- **解决**：彻底删除所有 `target` 相关的编译缓存目录（包括你可能自定义的 `target-local` 等目录），让 CMake 重新生成配置。

### 🚨 错误三：Windows 路径长度超限 (260字符限制) —— **最隐蔽的坑**

- **现象**：编译 `whisper-rs-sys` 时，在 MSBuild 阶段抛出 `System.InvalidOperationException`、`error MSB4018` 或 `error MSB8066`。日志中可能夹杂乱码，但会包含数字 `260`。
- **原因**：Windows 默认的 `MAX_PATH` 限制是 260 个字符。Tauri 默认将构建产物放在 `src-tauri/target/release/build/whisper-rs-sys-.../out/build/...` 目录下，层级极深。当 MSBuild 生成 `.tlog` 临时文件时，完整路径轻松突破了 260 个字符的限制，导致编译器直接崩溃退出。
- **解决**：在编译前，通过环境变量 `$env:CARGO_TARGET_DIR` 将 Rust 的输出目录重定向到一个**极短的路径**（例如 `C:\t`）。

### 🚨 错误四：打包时签名工具报错 `program not found`

- **现象**：C++ 编译和 Rust 编译均已完成，生成了 `Listen.exe`，但在最后 Bundle 阶段报错 `failed to bundle project program not found`。
- **原因**：原项目 (`tauri.conf.json`) 的 `windows.signCommand` 配置了原作者专属的云签名工具（`trusted-signing-cli`）。你的机器上没有该工具，导致打包中止。
- **解决**：移除 `src-tauri/tauri.conf.json` 中 `bundle.windows.signCommand` 字段。
- **⚠️ 移除签名的影响（没有签名会有什么问题？）**：
  1. **SmartScreen 拦截**：用户下载或运行安装包时，Windows 会弹出蓝色的“Windows 已保护你的电脑”警告，提示“未知发布者”。用户必须点击“更多信息” -> “仍要运行”才能安装。
  2. **杀毒软件误报**：没有数字签名的 `.exe` 和安装包极易被 Windows Defender、360 等杀毒软件拦截、隔离或直接删除（报毒）。
  3. **UAC 提示变黄**：安装时弹出的“用户账户控制”(UAC) 授权窗口中，发布者会显示为黄色的“未知”，而不是蓝色的认证开发者名称。
     _(注：如果是自己本地使用或内部分发，没有签名完全不影响软件的正常功能运行。但如果要正式发布给外部用户，建议后续购买 EV/OV 代码签名证书并配置签名)_

### 🚨 错误五：编译出的 exe 双击无反应 (进程直接退出)

- **现象**：编译成功后，双击 `Listen.exe` 没有任何反应，也没有界面弹出。如果在命令行运行该 exe，可能会看到隐藏的报错：`Failed to setup app: error encountered during setup hook: a webview with label 'main' already exists`。
- **原因**：在 Tauri v2 中，如果在 `tauri.conf.json` 的 `app.windows` 数组中预先静态定义了 `label` 为 `"main"` 的窗口，Tauri 会在启动时自动创建它。但如果后端的 Rust 代码（如 `src-tauri/src/lib.rs` 的 `setup` 钩子）中又通过 `WebviewWindowBuilder::new(app, "main", ...)` 动态创建同名窗口，就会导致命名冲突，程序在启动初期直接崩溃（Panic）退出。
- **解决**：在 `src-tauri/tauri.conf.json` 中移除 `label` 为 `"main"` 的窗口配置对象，将主窗口的创建权完全交由 Rust 后端代码动态接管（这对于需要支持便携模式、自定义数据目录等高级特性是必要的）。

### 🚨 错误六：启动后界面提示 "localhost 拒绝连接"

- **现象**：程序可以启动并显示窗口，但窗口内没有加载出实际的网页 UI，而是显示“无法访问此页面，localhost 拒绝连接”。
- **原因**：使用了原生的 `cargo build --release` 命令去编译应用。这只会编译 Rust 后端代码，**跳过了前端的打包构建流程**。由于最终的 exe 内部没有嵌入前端的静态资源（没有生成和注入 `dist` 目录），Tauri 在 Release 模式下找不到本地网页文件，会错误地尝试去加载开发模式的 URL（`http://localhost:3000`），从而导致拒绝连接。
- **解决**：切勿只用 `cargo build` 构建完整应用包。请务必回到项目最外层根目录，使用完整的 Tauri 构建命令：`bun run tauri build`。这会触发完整的流水线：先使用 Vite 将 React 页面编译到 `dist` 目录，然后再将这些静态资源注入到 Rust 编译出的可执行文件中。

### 🚨 错误七：安装包已经生成，但最后报 updater 私钥缺失

- **现象**：终端中已经出现 `Finished 2 bundles at:`，并且 `C:\t\release\bundle\msi\` / `C:\t\release\bundle\nsis\` 下已经生成安装包，但最后又报错：`A public key has been found, but no private key. Make sure to set TAURI_SIGNING_PRIVATE_KEY environment variable.`。
- **原因**：项目的 [tauri.conf.json](file:///c:/Documents/Myproject/Listen/src-tauri/tauri.conf.json#L39-L85) 同时开启了 `bundle.createUpdaterArtifacts = true` 和 `plugins.updater.pubkey`。这意味着 Tauri 在打包完 MSI/NSIS 后，还会继续尝试生成更新清单并对其签名。如果本地机器没有配置 `TAURI_SIGNING_PRIVATE_KEY`，最后一步就会失败。
- **解决**：
  1. **本地开发 / 自测安装包**：直接使用 `bun run build:windows`。我们现在的 [build-windows.ts](file:///c:/Documents/Myproject/Listen/scripts/build-windows.ts) 会在检测到“已配置 updater 公钥但未配置私钥”时，临时关闭 `createUpdaterArtifacts`，保证你仍然能拿到可安装的 MSI / NSIS 包。
  2. **正式发布 / 商用分发**：必须配置 `TAURI_SIGNING_PRIVATE_KEY` 与 `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`，让 Tauri 生成带签名的 updater 产物。
  3. **重要说明**：即使最后因为 updater 私钥缺失而退出，只要日志里已经出现 `Finished 2 bundles at:`，说明安装包本身通常已经生成成功，可以先去 `C:\t\release\bundle\` 目录验证。

### 🚨 错误八：`light.exe` 最后报错，但 MSI 实际已经生成

- **现象**：`bun run build:windows` 在 `WiX light.exe` 阶段最后报错，日志里可见类似：
  - `error LGHT0204 : ICE38`
  - `error LGHT0204 : ICE64`
  - 以及大量 `warning LGHT1076 : ICE91`
- **原因**：
  1. 这次为了让 MSI 支持**当前用户安装**和 **HKCU Deeplink 注册**，项目已经接入了自定义 [main.wxs](file:///c:/Documents/Myproject/Listen/src-tauri/wix/main.wxs#L23-L145)。
  2. `WiX` 在 `LocalAppDataFolder` 这类用户目录下做校验时，会对一些组件继续抛出 `ICE38` / `ICE64`，导致 `tauri build -b msi` 返回非零。
  3. 但在这个项目当前状态下，`light.exe` 报错前往往已经把 `C:\t\release\wix\x64\output.msi` 成功生成出来，因此这更像是**安装器校验阶段的问题**，不是“MSI 完全没生成”。
- **解决**：
  1. 不要只看 `light.exe` 的退出码，要同时检查：
     - `C:\t\release\wix\x64\output.msi`
     - `C:\t\release\bundle\msi\Listen_0.1.0_x64_en-US.msi`
  2. 现在项目里的 [build-windows.ts](file:///c:/Documents/Myproject/Listen/scripts/build-windows.ts#L440-L490) 已经内置了兼容逻辑：
     - 先单独构建 `NSIS`
     - 再单独构建 `MSI`
     - 如果识别到已知的 `ICE38 + ICE64` 组合错误，就自动把 `output.msi` 提升复制到 `bundle\msi\`，并继续完成整次构建
  3. 因此，**本地开发阶段可以忽略这类已知 WiX 校验报错**，以最终产物和实际安装结果为准。

### 🚨 错误九：`build:windows` 看起来卡死在 NSIS 打包阶段

- **现象**：日志停在 `Running makensis` 附近很久，看起来像打包卡死，没有继续输出。
- **原因**：这次排查发现，并不一定是 `makensis` 本身卡死，而可能是打包脚本在使用管道捕获子进程输出时，`NSIS` 输出过多导致缓冲区写满，父进程被阻塞。
- **解决**：
  1. 当前 [build-windows.ts](file:///c:/Documents/Myproject/Listen/scripts/build-windows.ts#L211-L251) 已改为：
     - 将 `tauri build` 的输出先写入 `.dbg/*.log`
     - 子进程结束后再统一回放日志
  2. 这样可以避免 `makensis` 输出撑满缓冲区导致“假卡死”。
  3. 如果后续仍需排查构建问题，可直接查看 `.dbg` 目录下最新日志文件。

### 🚨 错误十：`tauri-winres` / `embed-resource` 在 Windows 资源编译阶段 panic

- **现象**：`bun run build:windows` 或 `bun run tauri build` 在 Rust `build.rs` 阶段失败，日志里常见组合如下：
  - `package.metadata does not exist`
  - `failed to run custom build command for Listen`
  - `called Result::unwrap() on an Err value: Os { code: 0, kind: Uncategorized, message: "The operation completed successfully." }`
- **原因**：
  1. 这次实测确认，`package.metadata does not exist` 只是 `tauri-winres` 读取 `Cargo.toml` 时打印的一条普通提示，**不是根因**。
  2. 真正的问题是当前终端环境里 `rc.exe` 不在 `PATH`，而 `tauri-winres -> embed-resource` 在调用 Windows Resource Compiler 时会直接失败，最终在 `.manifest_required().unwrap()` 处 panic。
  3. 这个错误信息具有很强的迷惑性，看起来像是 `Cargo.toml`、版本信息或资源文件损坏，但实际上更常见的是 `RC` 环境没配好。
- **解决**：
  1. 先确认系统里确实安装了 Windows SDK 的 `rc.exe`，例如：
     `C:\Program Files (x86)\Windows Kits\10\bin\10.0.26100.0\x64\rc.exe`
  2. 在当前终端显式指定 `RC` 环境变量，再执行构建：

```powershell
$env:RC = "C:\Program Files (x86)\Windows Kits\10\bin\10.0.26100.0\x64\rc.exe"
bun run build:windows
```

3. 如果只想快速验证是不是资源编译器问题，可先运行：

```powershell
$env:RC = "C:\Program Files (x86)\Windows Kits\10\bin\10.0.26100.0\x64\rc.exe"
bun run build:windows:diagnostic
```

4. 本轮实测中，显式设置 `RC` 后：
   - `bun run build:windows:diagnostic` 成功
   - `bun run build:windows` 成功
   - 新的 `NSIS/MSI` 和 `C:\t\release\Listen.exe` 均正常产出

### 🚨 错误十一：`light.exe` 内存溢出（包含大模型文件后 MSI 打包失败）

- **现象**：Rust 编译成功，但 `WiX light.exe` 阶段直接退出，无具体 ICE 报错，只显示 `failed to run light.exe`。
- **原因**：项目内嵌了本地 LLM 模型文件（约 378 MB）。`light.exe` 在构建 `.cab` 时需要将所有文件加载到内存，大模型文件导致内存溢出。加密后的随机数据更会加剧此问题。
- **解决**：
  1. 当前 Windows 打包已改为 **NSIS only**（`tauri.conf.json` 中 `bundle.windows.targets = "nsis"`），NSIS 对大文件的内存管理优于 WiX。
  2. 如需恢复 MSI，建议将模型文件拆出安装包，运行时独立下载。
  3. 本地开发阶段直接使用 `bun run build:windows`，它会自动处理 NSIS/MSI 的构建顺序。

### 🚨 错误十二：`Listen_MODEL_KEY` 未设置导致编译失败

- **现象**：如果项目配置了加密模型（`resources/models/Listenai.local` 存在），但编译时未设置 `Listen_MODEL_KEY` 环境变量，`build.rs` 会正常编译，但运行时无法解密模型，LLM 服务将回退到明文模型或无法启动。
- **原因**：模型加密密钥通过 `build.rs` → `option_env!("Listen_MODEL_KEY")` 在**编译时**注入到 Rust 代码中。这不是运行时环境变量。
- **解决**：
  1. **本地开发（无加密模型）**：确保 `resources/models/` 下只有明文 `.gguf`，没有 `Listenai.local`。不设置 `Listen_MODEL_KEY`，应用会自动使用明文模型。
  2. **CI / 正式构建（使用加密模型）**：必须先运行加密脚本生成 `Listenai.local`，再设置 `Listen_MODEL_KEY` 编译：
     ```powershell
     $env:Listen_MODEL_KEY = "你的 64 位十六进制 AES-256 密钥"
     bun run scripts/encrypt_model.ts    # 从 llm-source/ 加密生成 Listenai.local
     bun run build:windows               # 编译时注入密钥
     ```
  3. **密钥格式**：必须是 64 个十六进制字符（32 字节），对应 AES-256 密钥。

### 模型加密方案说明

- **原文件位置**：`src-tauri/llm-source/Qwen3-0.6B-Q4_K_M.gguf`（明文，不参与打包，已加入 `.gitignore`）
- **加密产物**：`src-tauri/resources/models/Listenai.local`（参与 Tauri 打包，加入 `.gitignore`）
- **加密方式**：仅加密文件头 64KB（GGUF 元数据，隐藏模型身份），剩余模型权重保持明文以便 NSIS/LZMA 压缩
- **加密格式**：`[4B MAGIC "KWLE"] [12B nonce] [64KB AES-256-GCM 密文] [16B auth_tag] [剩余明文权重]`
- **加密脚本**：[encrypt_model.ts](file:///c:/Documents/Myproject/Listen/scripts/encrypt_model.ts)
- **解密逻辑**：[llm_server.rs](file:///c:/Documents/Myproject/Listen/src-tauri/src/Listen/llm_server.rs) 的 `decrypt_model_to_temp()` 方法——运行时解密到临时目录，进程退出时自动清理

---

## 3. 标准构建流程 (推荐做法)

为了稳定、顺利地在 Windows 上编译出 Listen 的安装包（MSI/NSIS），推荐使用我们新提供的统一打包脚本。这能帮你自动绕过路径限制，处理 CMake 缓存，以及动态移除签名配置。

### 使用 Node 脚本一键打包

打开终端，在项目根目录运行：

```powershell
# 必需：资源编译器路径
$env:RC = "C:\Program Files (x86)\Windows Kits\10\bin\10.0.26100.0\x64\rc.exe"
# 可选：仅正式构建时需要，用于模型加密和 updater 签名
$env:Listen_MODEL_KEY = "你的 64 位十六进制 AES-256 密钥"
$env:TAURI_SIGNING_PRIVATE_KEY = "你的 Tauri updater 私钥"
bun run build:windows
```

如果你的终端环境已经能直接找到 `rc.exe`，可以省略第一行；如果之前遇到过 `tauri-winres` / `embed-resource` 的资源编译 panic，**建议保留这行**。

**本地开发**：不设置 `Listen_MODEL_KEY` 和 `TAURI_SIGNING_PRIVATE_KEY` 也能正常构建安装包（使用明文模型，跳过 updater 签名）。

**这个命令会自动：**

1. 检查环境变量 `LIBCLANG_PATH` 是否存在。
2. 检查 `cl.exe` 和 `cmake` 是否安装。
3. 检查 `tauri.conf.json` 中是否存在与后端冲突的预定义 `main` 窗口。
4. 临时移除 `tauri.conf.json` 的 `bundle.windows.signCommand` 字段以支持无签打包。
5. 如果本地未配置 `TAURI_SIGNING_PRIVATE_KEY`，则临时关闭 `createUpdaterArtifacts`，避免最后一步因 updater 签名失败而中断本地构建。
6. 将 `CARGO_TARGET_DIR` 设为 `C:\t` 以避免路径长度超限。
7. 先单独构建 `NSIS`，确保至少有一个稳定可安装的安装包产出。
8. 再单独构建 `MSI`，并在识别到已知 `WiX per-user ICE38 / ICE64` 报错时，自动接管 `output.msi` 作为最终 MSI 产物。
9. 将 `tauri build` 输出写到 `.dbg` 日志文件中，避免 `NSIS` 输出过多导致脚本阻塞。
10. 恢复原始的 `tauri.conf.json` 文件。

### 诊断模式 (仅验证后端编译)

如果你只想确认 Rust 代码与 C++ 依赖是否能通过编译，不需要打包完整前端资源：

```powershell
$env:RC = "C:\Program Files (x86)\Windows Kits\10\bin\10.0.26100.0\x64\rc.exe"
bun run build:windows:diagnostic
```

_(注意：这只会生成 `Listen.exe`，不会注入前端 `dist` 资源，直接运行该 exe 界面会报 localhost 拒绝连接错误。)_

### 生成的产物路径

- **完整安装包**: `C:\t\release\bundle\nsis\` 或 `C:\t\release\bundle\msi\`
- **单独的执行文件**: `C:\t\release\Listen.exe`
- **WiX 中间产物**: `C:\t\release\wix\x64\output.msi`
- **本地构建日志**: `c:\Documents\Myproject\Listen\.dbg\`

### 本次实测结论（2026-06）

本轮排查后，Windows 本地打包、安装与 Deeplink 链路已经确认如下：

1. [tauri.conf.json](file:///c:/Documents/Myproject/Listen/src-tauri/tauri.conf.json#L82-L95) 已接入自定义 WiX 模板。
2. [main.wxs](file:///c:/Documents/Myproject/Listen/src-tauri/wix/main.wxs#L23-L145) 已改为：
   - `InstallScope="perUser"`
   - 默认安装目录使用 `LocalAppDataFolder`
   - Deeplink 协议写入 `HKCU\Software\Classes\Listen`
3. 使用新生成的安装包安装后，`Listen://` 协议会自动注册，不再依赖手动补注册表。
4. 冷启动测试 `Listen://auth/callback?access_token=test&refresh_token=test&expires_in=3600` 已验证可以拉起：
   - `C:\Users\sunia\AppData\Local\Listen\Listen.exe`
   - 主窗口标题为 `Listen`
5. 当前对外可执行结论是：
   - **NSIS 包可正常生成**
   - **MSI 包可正常生成并安装**
   - **`build:windows` 已能在本地完整跑通**
   - **WiX 的若干 ICE 报错目前按“已知可忽略校验报错”处理**
6. 本轮新增确认：
   - 当前这台机器上 `rc.exe` 虽已安装，但**不在默认 `PATH`**
   - 显式设置 `RC=C:\Program Files (x86)\Windows Kits\10\bin\10.0.26100.0\x64\rc.exe` 后，`tauri-winres` 资源编译恢复正常
   - 因此后续若再次出现 `package.metadata does not exist` + `The operation completed successfully` 的组合报错，应优先检查 `RC` 环境，而不是先怀疑业务代码或 `Cargo.toml`

## 4. 商用发布签名最佳实践

如果你需要一份单独的商用发布操作文档，请直接查看 [windows-commercial-release-signing-guide.md](./windows-commercial-release-signing-guide.md)。其中还补充了 **GitHub Release / latest.json / updater 发布模板**。

如果你准备正式发布商用版本，建议将“安装包签名”、“updater 签名”和“模型加密密钥”分开理解，它们用途不同：

### 4.1 三类密钥分别是什么

1. **Windows 安装包 / exe 代码签名**
   - 作用：减少 SmartScreen、杀毒软件误报，安装时让发布者显示为可信公司名称。
   - 常见形式：EV / OV Code Signing Certificate。
   - 这类签名通常用于 `.exe`、`.msi`、安装器本身。

2. **Tauri Updater 内容签名**
   - 作用：保护 `latest.json` 和更新包，防止更新源被篡改。
   - 使用的是 Tauri 自己的一套私钥 / 公钥机制。
   - 对应环境变量：
     - `TAURI_SIGNING_PRIVATE_KEY`
     - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
   - 公钥会放在 [tauri.conf.json](file:///c:/Documents/Myproject/Listen/src-tauri/tauri.conf.json#L79-L85) 的 `plugins.updater.pubkey` 中。

3. **模型加密密钥（`Listen_MODEL_KEY`）**
   - 作用：加密内嵌 LLM 模型的 GGUF 文件头，隐藏模型身份（模型名称、架构等元数据）。
   - 使用 AES-256-GCM，通过 `build.rs` → `option_env!()` 在**编译时**注入，非运行时环境变量。
   - 环境变量：`Listen_MODEL_KEY`（64 位十六进制字符串）。
   - 加密脚本：[encrypt_model.ts](file:///c:/Documents/Myproject/Listen/scripts/encrypt_model.ts)
   - 不设置此变量时，应用自动使用明文 `.gguf` 模型（仅限本地开发/测试）。

### 4.2 建议的密钥管理方式

- **不要**把 updater 私钥和模型加密密钥提交进仓库。
- **不要**把各密钥明文写进 `.env` 并长期留在开发机磁盘。
- **推荐**只在 CI/CD 或专用发布机中通过安全变量注入：
  - `TAURI_SIGNING_PRIVATE_KEY`
  - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
  - `Listen_MODEL_KEY`
- **推荐**至少准备两套环境：
  - **开发 / 本地测试**：不配置 TAURI_SIGNING_PRIVATE_KEY 和 Listen_MODEL_KEY，只构建本地安装包（使用明文模型）
  - **正式发布**：在 CI 中注入 `TAURI_SIGNING_PRIVATE_KEY` 和 `Listen_MODEL_KEY`，生成 updater 产物和加密模型
- **推荐**将 updater 私钥、模型加密密钥与 Windows 代码签名证书分别管理，不要混用。

### 4.3 建议的发布流程

1. **本地开发阶段**
   - 使用 `bun run build:windows`
   - 不配置 `TAURI_SIGNING_PRIVATE_KEY`
   - 用于验证 Whisper/Vulkan、安装包、启动行为是否正常

2. **预发布 / 内部测试阶段**
   - 可以先只做 Windows 代码签名
   - updater 产物可按需在 CI 中生成

3. **正式商用发布阶段**
   - 在 CI 中注入 `TAURI_SIGNING_PRIVATE_KEY` 和 `Listen_MODEL_KEY`
   - 启用 updater 产物生成和模型加密
   - 对 `.exe` / `.msi` 做正式代码签名
   - 上传安装包与 `latest.json` 到稳定的发布地址

### 4.4 商用发布前的最小检查清单

- 已购买并配置 Windows 代码签名证书
- 已生成并妥善保管 Tauri updater 私钥和模型加密密钥
- `tauri.conf.json` 中的 `plugins.updater.pubkey` 与私钥匹配
- 本地安装包可正常安装、启动、卸载
- 升级流程可验证 `latest.json`、更新包下载和签名校验
- CI 使用的是密钥注入，不是仓库明文存储
