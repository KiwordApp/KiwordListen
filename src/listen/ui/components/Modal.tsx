import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CloseButton } from "./CloseButton";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className = "w-[90vw] h-[90vh] max-w-6xl",
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/28 p-4 kiword-theme">
      <div className="absolute inset-0" />
      <div
        className={`relative flex flex-col overflow-hidden rounded-kw-xl bg-kw-bg-page shadow-xl ring-1 ring-kw-border ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButton
          onClick={onClose}
          ariaLabel={t("common.close")}
          className="z-[110]"
        />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
};
