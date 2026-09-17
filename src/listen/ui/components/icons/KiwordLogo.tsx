import React from "react";
import { cn } from "../../utils/cn";

const brandLogoUrl = "/icon.ico";

export const KiwordLogo = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 font-bold tracking-tight select-none",
        className,
      )}
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-kw-lg bg-kw-primary-500 shadow-kw-sm">
        <img
          src={brandLogoUrl}
          alt="Kiword"
          className="h-full w-full object-contain"
        />
      </div>
      <span className="text-[16px] text-kw-text-primary">Kiword</span>
    </div>
  );
};
