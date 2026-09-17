# Listen UI 组件规范

## 设计令牌 (Design Tokens)

所有 Listen 业务 UI 必须使用 `--kw-*` CSS 变量体系，定义在 `src/listen/ui/theme/variables.css`。

### 颜色

**原色 (Primary)**：蓝色系

- `kw-primary-50` ~ `kw-primary-900`（Tailwind: `bg-kw-primary-500`, `text-kw-primary-600` 等）

**次要色 (Secondary)**：黄色系

- `kw-secondary-50` ~ `kw-secondary-900`

**中性色 (Neutral)**

- `kw-white` / `kw-black`
- `kw-gray-50` ~ `kw-gray-900`

**语义色 (Semantic)**

| Token                   | 用途       | Tailwind 简写                       |
| ----------------------- | ---------- | ----------------------------------- |
| `--kw-bg-page`        | 页面背景   | `bg-kw-bg-page`                   |
| `--kw-bg-card`        | 卡片背景   | `bg-kw-bg-card`                   |
| `--kw-text-primary`   | 主文字色   | `text-kw-text-primary`            |
| `--kw-text-secondary` | 次要文字色 | `text-kw-text-secondary`          |
| `--kw-text-muted`     | 弱化文字色 | `text-kw-text-muted`              |
| `--kw-border`         | 边框色     | `border-kw-border`                |
| `--kw-color-success`  | 成功       | `text-kw-success`                 |
| `--kw-color-warning`  | 警告       | `text-kw-warning`                 |
| `--kw-color-error`    | 错误/危险  | `text-kw-error` / `bg-kw-error` |
| `--kw-color-info`     | 信息       | `text-kw-info`                    |

**规则**：禁止使用 Tailwind 原生颜色（如 `bg-gray-50`, `text-gray-900`），必须用 `kw-` 前缀令牌，确保所有主题（亮/暗）下一致。

### 边框

| Token                  | 浅色值               | 暗色值                               | 用途                 |
| ---------------------- | -------------------- | ------------------------------------ | -------------------- |
| `--kw-border`        | 暖灰实色`#e6e3dd`  | 玻璃微边框`rgba(255,255,255,0.08)` | 卡片、输入框主边框   |
| `--kw-border-subtle` | `rgba(0,0,0,0.06)` | `rgba(255,255,255,0.06)`           | 内部分隔线           |
| `--kw-border-strong` | `rgba(0,0,0,0.12)` | `rgba(255,255,255,0.14)`           | 强调边框（焦点态等） |

### 输入控件背景

| Token             | 浅色值      | 暗色值      | 用途                         |
| ----------------- | ----------- | ----------- | ---------------------------- |
| `--kw-bg-input` | `#ffffff` | `#27272a` | 输入框、下拉框、KBD 按键背景 |

### 圆角 (Radius)

| Token               | 值     | 用途           |
| ------------------- | ------ | -------------- |
| `rounded-kw-sm`   | 2px    | 紧凑元素       |
| `rounded-kw-md`   | 6px    | 输入框、小按钮 |
| `rounded-kw-lg`   | 8px    | 标准按钮       |
| `rounded-kw-xl`   | 12px   | 卡片、弹窗     |
| `rounded-kw-2xl`  | 16px   | 大型容器       |
| `rounded-kw-3xl`  | 24px   | 全屏面板       |
| `rounded-kw-full` | 9999px | 圆形元素       |

**规则**：卡片用 `rounded-kw-xl`，按钮用 `rounded-kw-lg`，禁止用原生 `rounded-xl` 等。

---

## 主题机制

### 激活主题

在需要 Listen 主题的容器上加 `.kiword-theme` 类：

```tsx
<div className="kiword-theme">{/* 内部所有 kw-* 令牌自动生效 */}</div>
```

### 暗色模式

- `.dark .kiword-theme` 或 `.kiword-theme.dark` 自动切换暗色变量
- 支持 `prefers-color-scheme: dark` 媒体查询自动跟随系统

### 旧组件兼容

在包裹旧 UI 组件时使用 `.kiword-legacy-override`：

```tsx
<div className="kiword-legacy-override">
  <OldComponent />
</div>
```

此 class 会将旧主题令牌映射到 Listen（kw-*）令牌。

---

## 规范组件

所有组件位于 `src/listen/ui/components/`，**新增 UI 必须优先使用这些规范组件**，禁止手写零散 div 替代。

### 1. KiwordButton

文件: `src/listen/ui/components/KiwordButton.tsx`

```tsx
import { KiwordButton } from "@/listen/ui/components/KiwordButton";

// variant: "default" | "secondary" | "ghost" | "danger" | "outline"
// size:    "default" | "sm" | "lg" | "icon"
```

| Variant       | 外观             | 适用场景             |
| ------------- | ---------------- | -------------------- |
| `default`   | 蓝底白字，有阴影 | 主操作（提交、确认） |
| `secondary` | 白底蓝字蓝边框   | 次要操作             |
| `ghost`     | 透明底蓝字       | 文本链接式按钮       |
| `danger`    | 红底白字         | 删除、危险操作       |
| `outline`   | 透明底灰字灰边框 | 低调操作             |

| Size        | 高度  | 适用场景   |
| ----------- | ----- | ---------- |
| `default` | 40px  | 标准按钮   |
| `sm`      | 32px  | 紧凑场景   |
| `lg`      | 48px  | 强调操作   |
| `icon`    | 40x40 | 纯图标按钮 |

### 2. KiwordCard

文件: `src/listen/ui/components/KiwordCard.tsx`

```tsx
import {
  KiwordCard,
  KiwordCardHeader,
  KiwordCardTitle,
  KiwordCardDescription,
  KiwordCardContent,
  KiwordCardFooter,
} from "@/listen/ui/components/KiwordCard";

<KiwordCard>
  <KiwordCardHeader>
    <KiwordCardTitle>标题</KiwordCardTitle>
    <KiwordCardDescription>描述文字</KiwordCardDescription>
  </KiwordCardHeader>
  <KiwordCardContent>内容区</KiwordCardContent>
  <KiwordCardFooter>底部操作区</KiwordCardFooter>
</KiwordCard>;
```

自带 `rounded-kw-xl`, `border-kw-border`, `bg-kw-bg-card`, `shadow-sm`。

### 3. Modal

文件: `src/listen/ui/components/Modal.tsx`

```tsx
import { Modal } from "@/listen/ui/components/Modal";

<Modal isOpen={open} onClose={() => setOpen(false)} className="max-w-md">
  {/* 弹窗内容 */}
</Modal>;
```

- 自带遮罩层 (`bg-black/40 backdrop-blur-sm`)
- 支持 ESC 关闭
- 点击遮罩关闭
- 右上角 X 关闭按钮（内部复用 CloseButton）
- 默认尺寸 `w-[90vw] h-[90vh] max-w-6xl`，可通过 className 覆盖

### 4. KiwordDropdownMenu

文件: `src/listen/ui/components/KiwordDropdownMenu.tsx`

```tsx
import { KiwordDropdownMenu } from "@/listen/ui/components/KiwordDropdownMenu";
import type {
  KiwordDropdownMenuItem,
  KiwordDropdownMenuGroup,
} from "@/listen/ui/components/KiwordDropdownMenu";
import { UserRound, Star, Gift, LogOut } from "lucide-react";

<KiwordDropdownMenu
  isOpen={isMenuOpen}
  onClose={() => setMenuOpen(false)}
  header={
    <div className="flex items-center gap-3 rounded-kw-lg px-3 py-2.5">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-kw-primary-500 text-sm font-bold text-kw-white">
        A
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-kw-text-primary">
          用户名
        </div>
        <div className="truncate text-xs text-kw-text-secondary">
          user@example.com
        </div>
      </div>
    </div>
  }
  groups={[
    {
      items: [
        {
          id: "dashboard",
          icon: UserRound,
          label: "控制台",
          onClick: () => {},
        },
        {
          id: "profile",
          icon: UserRound,
          label: "个人资料",
          onClick: () => {},
        },
      ],
    },
    {
      items: [
        {
          id: "logout",
          icon: LogOut,
          label: "退出登录",
          variant: "danger",
          onClick: () => {},
        },
      ],
    },
  ]}
/>;
```

| 属性          | 类型                                                           | 说明                                                                                                                                                             |
| ------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isOpen`    | `boolean`                                                    | 是否显示菜单                                                                                                                                                     |
| `onClose`   | `() => void`                                                 | 关闭回调                                                                                                                                                         |
| `groups`    | `KiwordDropdownMenuGroup[]`                                  | 菜单分组列表，组间自动加分隔线                                                                                                                                   |
| `header`    | `React.ReactNode`                                            | 可选，菜单头部内容（如用户信息）                                                                                                                                 |
| `align`     | `"top"` \| `"bottom"` \| `"top-end"` \| `"bottom-end"` | 展开方向，默认`"top"`（左上对齐向上展开）；贴顶元素用 `"bottom"` 向下展开，贴右边缘元素（如右上角头像）用 `"-end"` 后缀右对齐向左展开，如 `"bottom-end"` |
| `className` | `string`                                                     | 可选，额外样式类名                                                                                                                                               |

**MenuItem 属性：**

| 属性        | 类型                          | 说明                                    |
| ----------- | ----------------------------- | --------------------------------------- |
| `id`      | `string`                    | 唯一标识                                |
| `icon`    | `ElementType`               | lucide-react 图标组件                   |
| `label`   | `string`                    | 菜单项文字                              |
| `onClick` | `() => void`                | 点击回调，组件内部会自动调用`onClose` |
| `variant` | `"default"` \| `"danger"` | 默认样式或危险操作（红色）              |

**特性：**

- 自带外部点击关闭和 ESC 关闭
- 绝对定位，z-index 为 20；默认 `bottom-10 left-0` 向上展开；`"bottom"` 向下展开（`top-full mt-2`）；`"-end"` 后缀右对齐向左展开（`right-0`）
- 默认最小宽度 240px，可通过 className 覆盖
- 菜单项带 `transition-colors` hover 效果
- `variant="danger"` 的项自动使用红色文字 + 红色背景 hover

### 5. KiwordLogo

文件: `src/listen/ui/components/icons/KiwordLogo.tsx`

```tsx
import { KiwordLogo } from "@/listen/ui/components/icons/KiwordLogo";
<KiwordLogo className="text-3xl" />;
```

### 5.1 Switch（自定义开关约定）

项目暂无独立 Switch 规范组件。需要开关时以 `role="switch"` 按钮实现（`button` 而非原生 `<input type="checkbox">`，便于受控与禁用态）：

- 结构：`button[role="switch"]` + 内部 `span` 滑块
- 必备无障碍属性：`aria-checked`、`aria-label`、`aria-describedby`（受限禁用时指向说明文本）
- 关闭态 `bg-kw-gray-300 dark:bg-kw-gray-700`；开启态 `bg-kw-primary-500`；滑块 `bg-kw-white`
- 禁用态：`disabled` + `opacity-50 cursor-not-allowed`，并必须通过旁侧文本解释禁用原因（防暗黑模式）
- 圆角须使用 `rounded-kw-full`

若后续沉淀为通用组件，应提取到 `src/listen/ui/components/KiwordSwitch.tsx` 并同步更新本文档。

### 6. KiwordSettingsGroup

文件: `src/listen/ui/components/KiwordSettingsGroup.tsx`

设置页面专用的分组容器，自带标题、描述和 KiwordCard 包裹。

### 7. KiwordSettingContainer

文件: `src/listen/ui/components/KiwordSettingContainer.tsx`

包装旧版 SettingContainer（`@/components/ui/SettingContainer`），注入 `.kiword-legacy-override` 主题类并强制 kw-* 令牌。

### 8. CloseButton

文件: `src/listen/ui/components/CloseButton.tsx`

通用的右上角关闭按钮，圆形灰色风格，与登录弹窗（Modal）内的关闭按钮一致。Modal 与 SettingsView 等容器右上角的关闭按钮必须复用此组件。

```tsx
import { CloseButton } from "@/listen/ui/components/CloseButton";

<CloseButton
  onClick={onClose}
  ariaLabel={t("common.close")}
  className="z-10"
/>;
```

| 属性          | 类型           | 说明                                |
| ------------- | -------------- | ----------------------------------- |
| `onClick`   | `() => void` | 点击关闭的回调                      |
| `ariaLabel` | `string`     | 可选，无障碍标签（文案走 i18next） |
| `className` | `string`     | 可选，额外样式类名（如`z-index`） |

**特性：**

- 自带 `absolute right-4 top-4` 定位与圆形灰底样式
- 深色模式下自动切换 `dark:bg-kw-gray-800 dark:hover:bg-kw-gray-700`
- 通过 className 传入各场景需要的 `z-index`（Modal 用 `z-[110]`，Settings 用 `z-10`）

---

## 工具函数

### cn()

文件: `src/listen/ui/utils/cn.ts`

```tsx
import { cn } from "@/listen/ui/utils/cn";

// 合并 class，自动处理 Tailwind 冲突（clsx + tailwind-merge）
<div
  className={cn("base-class", condition && "conditional-class", className)}
/>;
```

**规则**：所有组件必须用 `cn()` 合并 className，不要手动拼接字符串。规范组件内部以相对路径（`../utils/cn`）引用；依赖 `clsx` + `tailwind-merge`，在业务代码接入构建时需一并安装。

---

## 开发规范

### 必须遵守

1. **新 UI 代码全部放在 `src/listen/ui/` 下**，不修改旧 `src/components/`、`src/ui/` 与 `handy_core/src/`
2. **选用规范组件**：按钮用 `KiwordButton`，卡片用 `KiwordCard`，弹窗用 `Modal`，下拉菜单用 `KiwordDropdownMenu`
3. **使用设计令牌**：颜色用 `kw-` 前缀，圆角用 `rounded-kw-*`，禁止 Tailwind 原生值
4. **文案走 i18next**：不写 JSX 硬编码字符串，用 `useTranslation()` + `t("key")`
5. **使用 `cn()` 合并 class**：不要手写字符串拼接
6. **导入用 `@/` 别名**：避免深层相对路径
7. **无规范组件时**可自定义，但必须：使用 `cn()`、使用 `kw-*` 设计令牌、补充到此规范文件

### 禁止

- 禁止用原生 HTML 元素手写样式替代规范组件（如 `<button className="...">` 代替 `<KiwordButton>`）
- 禁止使用 Tailwind 原生颜色（`gray-*`, `blue-*`, `red-*` 等），只能用 `kw-*`
- 禁止使用 Tailwind 原生圆角（`rounded-lg`, `rounded-xl` 等），只能用 `rounded-kw-*`

### 组件导入路径速查

```tsx
import { KiwordButton } from "@/listen/ui/components/KiwordButton";
import {
  KiwordCard,
  KiwordCardHeader,
  KiwordCardTitle,
  KiwordCardDescription,
  KiwordCardContent,
  KiwordCardFooter,
} from "@/listen/ui/components/KiwordCard";
import { Modal } from "@/listen/ui/components/Modal";
import { KiwordDropdownMenu } from "@/listen/ui/components/KiwordDropdownMenu";
import { KiwordLogo } from "@/listen/ui/components/icons/KiwordLogo";
import { KiwordSettingsGroup } from "@/listen/ui/components/KiwordSettingsGroup";
import { KiwordSettingContainer } from "@/listen/ui/components/KiwordSettingContainer";
import { CloseButton } from "@/listen/ui/components/CloseButton";
import { cn } from "@/listen/ui/utils/cn";
```
