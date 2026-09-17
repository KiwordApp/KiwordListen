import * as React from "react";
import { type ElementType } from "react";
import { cn } from "../utils/cn";

/** 菜单项定义 */
export interface KiwordDropdownMenuItem {
  id: string;
  icon: ElementType;
  label: string;
  onClick: () => void;
  /** 变体：default 为标准菜单项，danger 用于退出等危险操作 */
  variant?: "default" | "danger";
}

/** 菜单分组：每组之间自动添加分隔线 */
export interface KiwordDropdownMenuGroup {
  items: KiwordDropdownMenuItem[];
}

export interface KiwordDropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  /** 菜单分组列表 */
  groups: KiwordDropdownMenuGroup[];
  /** 菜单头部内容（如用户信息） */
  header?: React.ReactNode;
  /** 展开方向：top 向上展开（默认），bottom 向下展开（适合贴顶的触发元素）；-end 后缀表示右对齐向左展开（适合贴右边缘的触发元素） */
  align?: "top" | "bottom" | "top-end" | "bottom-end";
  className?: string;
}

function KiwordDropdownMenuInner(
  {
    isOpen,
    onClose,
    groups,
    header,
    align = "top",
    className,
  }: KiwordDropdownMenuProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  // 合并外部 ref 和内部 ref
  React.useImperativeHandle(ref, () => menuRef.current!, []);

  // 点击外部关闭
  React.useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className={cn(
        "absolute z-20 min-w-[240px] rounded-kw-xl border border-kw-border bg-kw-bg-card p-1.5 shadow-kw-lg",
        align === "bottom" || align === "bottom-end"
          ? "top-full mt-2"
          : "bottom-10",
        align === "top-end" || align === "bottom-end" ? "right-0" : "left-0",
        className,
      )}
    >
      {header}
      {header && groups.length > 0 && (
        <div className="my-1 border-t border-kw-border" />
      )}
      {groups.map((group, groupIndex) => (
        <React.Fragment key={groupIndex}>
          {groupIndex > 0 && <div className="my-1 border-t border-kw-border" />}
          {group.items.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onClose();
                  item.onClick();
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-kw-lg px-3 py-2 text-left text-sm transition-colors",
                  item.variant === "danger"
                    ? "text-kw-error hover:bg-kw-error/10"
                    : "text-kw-text-primary hover:bg-kw-bg-hover",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

const KiwordDropdownMenu = React.forwardRef(KiwordDropdownMenuInner);
KiwordDropdownMenu.displayName = "KiwordDropdownMenu";

export { KiwordDropdownMenu };
