import React, { useState, useCallback, useEffect } from "react";
import { useSubscriptionAccess } from "@/kiword/hooks/useSubscriptionAccess";
import { useWordQuota } from "@/kiword/hooks/useWordQuota";
import { SubscriptionCTAModal } from "./SubscriptionCTAModal";

interface FeatureGateProps {
  children: React.ReactNode;
  /** 触发限制时显示的 fallback（默认弹出 SubscriptionCTAModal） */
  fallback?: React.ReactNode;
  /** 功能门控前的回调，可用于前置检查 */
  onBeforeAction?: () => Promise<boolean> | boolean;
}

/**
 * 功能门控组件
 *
 * 根据订阅状态决定是否放行：
 * - Pro/trial 用户：直接渲染 children
 * - Free 用户：检查字数配额，未超限放行，超限弹出 CTA 弹窗
 */
export const FeatureGate: React.FC<FeatureGateProps> = ({
  children,
  fallback,
  onBeforeAction,
}) => {
  const { hasAccess, isFree } = useSubscriptionAccess();
  const { isExceeded, refresh } = useWordQuota();
  const [showCTA, setShowCTA] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // 初始加载配额
  useEffect(() => {
    if (isFree) {
      refresh();
    }
  }, [isFree, refresh]);

  const handleAction = useCallback(async () => {
    if (hasAccess) return;

    setIsChecking(true);
    await refresh();

    if (onBeforeAction) {
      const allowed = await onBeforeAction();
      if (!allowed) {
        setShowCTA(true);
        setIsChecking(false);
        return;
      }
    }

    // 免费用户超限时弹出 CTA
    if (isFree && isExceeded) {
      setShowCTA(true);
    }

    setIsChecking(false);
  }, [hasAccess, isFree, isExceeded, refresh, onBeforeAction]);

  const handleCloseCTA = useCallback(() => {
    setShowCTA(false);
  }, []);

  const handleSubscribeSuccess = useCallback(() => {
    setShowCTA(false);
    refresh();
  }, [refresh]);

  // Pro 用户直接放行
  if (hasAccess) return <>{children}</>;

  // 免费用户：quota 已加载且未超限，放行
  // 超限时展示 CTA 弹窗
  return (
    <>
      {showCTA
        ? (fallback ?? (
            <SubscriptionCTAModal
              isOpen={showCTA}
              onClose={handleCloseCTA}
              trigger="wordLimit"
            />
          ))
        : null}

      <div onClick={handleAction} style={{ display: "contents" }}>
        {children}
      </div>
    </>
  );
};

/**
 * 简化版 FeatureGate —— 不使用点击拦截，直接作为渲染守卫使用
 * 适用于不需要用户交互的场景
 */
export const FeatureGateGuard: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => {
  const { hasAccess, isFree } = useSubscriptionAccess();
  const { isExceeded, refresh } = useWordQuota();

  useEffect(() => {
    if (isFree) {
      refresh();
    }
  }, [isFree, refresh]);

  if (hasAccess) return <>{children}</>;
  if (isFree && !isExceeded) return <>{children}</>;

  return <>{fallback}</>;
};
