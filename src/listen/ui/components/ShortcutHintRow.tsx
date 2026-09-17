import { useTranslation } from "react-i18next";
import { Mic } from "lucide-react";
import { formatKeyCombinationParts, type OSType } from "@/lib/utils/keyboard";
import { cn } from "../utils/cn";

/** SENSE_MODES 图标为 24x24 stroke 风格 SVG（overlay 里通过 CSS 统一控制 stroke 规则），
 *  首页复用同一套图标，用后代选择器补上等价的 fill/stroke 样式。 */
export const senseIconClassName =
  "[&_svg]:h-4 [&_svg]:w-4 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:[stroke-width:2] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]";

/** 键帽样式：active 时点亮（主色实底），否则为只读键帽外观（与首页 ShortcutHintRow 键帽一致）。 */
const keycapClassName = (active: boolean) =>
  cn(
    "inline-flex min-w-[24px] items-center justify-center rounded-kw-md border px-1.5 py-1 text-[11px] font-bold transition-all duration-75",
    active
      ? "border-kw-primary-500 bg-kw-primary-500 text-kw-white shadow-[0_1px_0_0_rgba(0,0,0,0.1)] dark:bg-kw-primary-400"
      : "border-kw-primary-300 bg-gradient-to-b from-kw-white to-kw-gray-100 text-kw-primary-700 shadow-[0_2px_0_0_rgba(0,0,0,0.10),0_3px_6px_-2px_rgba(0,0,0,0.18)] dark:border-kw-primary-500/40 dark:from-kw-gray-700 dark:to-kw-gray-800 dark:text-kw-primary-300",
  );

/** 把绑定里的单个键（如 "ctrl"、"option_left"、"command"）归一成规范键名，用于点亮匹配。 */
const normalizeBindingPart = (part: string): string => {
  const p = part
    .trim()
    .toLowerCase()
    .replace(/_(left|right)$/, "");
  if (p === "option") return "alt";
  if (p === "command" || p === "cmd" || p === "super" || p === "win")
    return "meta";
  return p;
};

/** 首页 Hero 快捷键引导卡片：图标 + 标题 + 一句话说明 + 右侧只读快捷键 chip。
 *  样式复用设置页 HandyKeysShortcutInput 的只读展示态（去掉 cursor-pointer/hover/点击录制行为），
 *  卡片化包装 + 主色图标块，提升可扫描性；绑定为空时显示「未设置」占位文案。 */
export function ShortcutHintRow({
  icon: Icon,
  titleKey,
  subtitleKey,
  binding,
  osType,
  bare = false,
  activeKeys,
}: {
  icon: typeof Mic;
  titleKey: string;
  subtitleKey: string;
  binding: string;
  osType: OSType;
  /** bare 模式不渲染外层卡片（边框/背景/阴影），由父容器提供，用于和其他功能块组合成一张卡片 */
  bare?: boolean;
  /** 可选：当前按下的规范键名集合，命中的键帽点亮（功能引导页演示用），首页不传则始终熄灭 */
  activeKeys?: ReadonlySet<string>;
}) {
  const { t } = useTranslation();
  // 拆分组合键为逐键显示名，便于渲染成键盘键帽样式（如 "Right Ctrl" + "L" 两个键）
  const keyParts = binding ? formatKeyCombinationParts(binding, osType) : [];
  // 与 keyParts 一一对应的规范键名，用于 activeKeys 点亮匹配
  const canonicalParts = binding
    ? binding.split("+").map(normalizeBindingPart)
    : [];

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        !bare &&
          "rounded-kw-xl border border-kw-border bg-kw-bg-card/70 p-3 shadow-kw-sm transition-colors hover:border-kw-primary-300 hover:bg-kw-bg-card",
      )}
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-kw-lg bg-kw-primary-500/10 text-kw-primary-600 dark:bg-kw-primary-500/20 dark:text-kw-primary-300">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-bold text-kw-text-primary">
          {t(titleKey)}
        </div>
        <div className="mt-0.5 truncate text-xs leading-4 text-kw-text-secondary">
          {t(subtitleKey)}
        </div>
      </div>
      {keyParts.length > 0 ? (
        <div className="flex shrink-0 items-center gap-1">
          {keyParts.map((part, index) => (
            <span key={index} className="flex items-center gap-1">
              {index > 0 && (
                <span className="mx-0.5 text-[10px] font-bold text-kw-text-muted">
                  +
                </span>
              )}
              <kbd
                className={keycapClassName(
                  activeKeys?.has(canonicalParts[index]) ?? false,
                )}
              >
                {part}
              </kbd>
            </span>
          ))}
        </div>
      ) : (
        <span className="shrink-0 rounded-kw-md border border-kw-primary-500/30 bg-kw-primary-500/10 px-2 py-1 text-xs font-bold text-kw-primary-600 dark:bg-kw-primary-500/20 dark:text-kw-primary-300">
          {t("desktopHome.hero.shortcutUnset")}
        </span>
      )}
    </div>
  );
}
