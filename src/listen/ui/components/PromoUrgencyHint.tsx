import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, Zap } from "lucide-react";
import { toast } from "sonner";
import { useHomeStore } from "@/stores/homeStore";
import { openWebHandoff } from "@/kiword/services/webHandoff";
import { usePromoWindow } from "@/kiword/hooks/usePromoWindow";
import {
  formatPromoLocalDate,
  PROMO_WINDOW_START_MS,
} from "@/kiword/lib/promoWindow";
import { cn } from "@/kiword/ui/utils/cn";

interface PromoUrgencyHintProps {
  className?: string;
}

/**
 * 限时活动紧迫感提示（纯展示入口，不涉及任何订阅逻辑）
 *
 * - 活动前：显示开窗日预告（按用户当地时间的日期）
 * - 活动中：显示剩余天数倒计时，制造订阅紧迫感
 * - 已结束 / 已有 Pro 权益（远程订阅、创始人）：不渲染
 *
 * 本地试用中用户同样可见（试用用户是重要转化目标）。
 * 点击整条提示跳转官网定价页（openWebHandoff("pricing")，支持匿名打开）。
 * 窗口判定基于后端约定的 ET 绝对时刻（见 promoWindow.ts），
 * 到期后由 usePromoWindow 的定时重算自动隐藏。
 */
export const PromoUrgencyHint: React.FC<PromoUrgencyHintProps> = ({
  className,
}) => {
  const { t } = useTranslation();
  const { phase, daysRemaining } = usePromoWindow();
  const subscription = useHomeStore((state) => state.subscription);

  // 已有 Pro 权益的用户不展示活动提示（与 HomeView 的 hasRemoteSubscription 判定口径一致）
  const isSubscribed =
    subscription?.subscription_status === "active" ||
    subscription?.subscription_status === "trialing";
  const isFounder = subscription?.rewards?.founder_active === true;
  if (isSubscribed || isFounder) {
    return null;
  }

  if (phase === "ended") {
    return null;
  }

  // 点击跳转官网定价页；失败时用现有 webHandoff 文案提示（pricing 允许匿名打开，不会 AUTH_REQUIRED）
  const handleOpenPricing = () => {
    openWebHandoff("pricing").catch((error: unknown) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t("desktopHome.webHandoff.failed"),
      );
    });
  };

  return (
    <button
      type="button"
      onClick={handleOpenPricing}
      className={cn(
        "flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-kw-md bg-kw-secondary-50 px-2 py-1.5 text-[11px] font-semibold text-kw-secondary-700 transition-colors hover:bg-kw-secondary-100 dark:bg-kw-secondary-500/10 dark:text-kw-secondary-300 dark:hover:bg-kw-secondary-500/20",
        className,
      )}
    >
      <Zap className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>
        {phase === "before"
          ? t("subscription.promo.startsOn", {
              date: formatPromoLocalDate(PROMO_WINDOW_START_MS),
            })
          : t("subscription.promo.endsIn", { count: daysRemaining })}
      </span>
      <ArrowRight className="h-3 w-3 shrink-0" aria-hidden="true" />
    </button>
  );
};
