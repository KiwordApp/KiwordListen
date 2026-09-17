import React from "react";
import { X } from "lucide-react";
import { cn } from "../utils/cn";

interface CloseButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
}

/**
 * 通用关闭按钮：圆形灰色风格，用于 Modal、SettingsView 等需要右上角关闭的容器。
 * 样式与登录弹窗（Modal）内的关闭按钮保持一致。
 */
export const CloseButton: React.FC<CloseButtonProps> = ({
  onClick,
  ariaLabel,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-kw-gray-100 text-kw-text-secondary transition-colors hover:bg-kw-gray-200 hover:text-kw-text-primary dark:bg-kw-gray-800 dark:hover:bg-kw-gray-700",
        className,
      )}
    >
      <X className="h-4 w-4" />
    </button>
  );
};
