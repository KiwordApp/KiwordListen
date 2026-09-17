import React from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/kiword/ui/components/Modal";
import { PricingPage } from "@/kiword/ui/settings/subscription/PricingPage";
import { KiwordButton } from "@/kiword/ui/components/KiwordButton";
import { PromoUrgencyHint } from "@/kiword/ui/components/PromoUrgencyHint";

interface SubscriptionCTAModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: "wordLimit" | "featureLocked";
}

/**
 * 订阅 CTA 弹窗
 *
 * 当免费用户触发受限功能时弹出，展示定价页面供用户升级。
 * 基于 Modal 组件构建，内嵌 PricingPage（订阅在官网完成，点击订阅跳转官网）。
 */
export const SubscriptionCTAModal: React.FC<SubscriptionCTAModalProps> = ({
  isOpen,
  onClose,
  trigger,
}) => {
  const { t } = useTranslation();

  const titleKey =
    trigger === "wordLimit"
      ? "subscription.cta.wordLimitTitle"
      : "subscription.cta.featureLockedTitle";
  const descriptionKey =
    trigger === "wordLimit"
      ? "subscription.cta.wordLimitDescription"
      : "subscription.cta.featureLockedDescription";

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <div className="text-center px-6 pt-6">
        <h2 className="text-2xl font-bold text-kw-text-primary">
          {t(titleKey)}
        </h2>
        <p className="mt-2 text-kw-text-secondary">{t(descriptionKey)}</p>
        {/* 限时活动紧迫感提示（组件内置受众判定，Pro 用户/已结束自动隐藏） */}
        <PromoUrgencyHint className="mx-auto mt-3 max-w-sm" />
      </div>

      <PricingPage />

      {/* 底部跳过按钮 */}
      <div className="flex justify-center pb-6 px-6">
        <KiwordButton variant="ghost" size="sm" onClick={onClose}>
          {t("subscription.cta.dismissButton")}
        </KiwordButton>
      </div>
    </Modal>
  );
};
