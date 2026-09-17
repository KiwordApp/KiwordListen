import React from "react";
import { cn } from "../utils/cn";
import { KiwordCard } from "./KiwordCard";

interface SettingsGroupProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const KiwordSettingsGroup: React.FC<SettingsGroupProps> = ({
  title,
  description,
  children,
  className,
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      {title && (
        <div className="px-2">
          <h2 className="text-xs font-semibold text-kw-text-muted uppercase tracking-wider">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-kw-text-secondary mt-1">{description}</p>
          )}
        </div>
      )}
      <KiwordCard className="overflow-visible">
        <div className="kiword-legacy-override divide-y divide-kw-border [&>div]:!border-kw-border [&>div>div>h3]:!text-kw-text-primary [&>div>div>p]:!text-kw-text-secondary [&_svg]:!text-kw-text-muted hover:[&_svg]:!text-kw-primary-500 [&_input\[type\=range\]]:!accent-kw-primary-500 [&_.bg-mid-gray\/20]:!bg-kw-gray-200 dark:[&_.bg-mid-gray\/20]:!bg-kw-gray-700">
          {children}
        </div>
      </KiwordCard>
    </div>
  );
};
