import React from "react";
import { SettingContainer } from "@/components/ui/SettingContainer";

/**
 * A wrapper around the original SettingContainer that injects Kiword's theme classes.
 * We use CSS overrides here to force Kiword tokens onto the underlying generic component.
 */
export const KiwordSettingContainer: React.FC<
  React.ComponentProps<typeof SettingContainer>
> = (props) => {
  return (
    <div className="kiword-legacy-override [&>div]:!border-kw-border [&>div>div>h3]:!text-kw-text-primary [&>div>div>p]:!text-kw-text-secondary [&_svg]:!text-kw-text-muted hover:[&_svg]:!text-kw-primary-500 [&_input\[type\=range\]]:!accent-kw-primary-500 [&_.bg-mid-gray\/20]:!bg-kw-gray-200 dark:[&_.bg-mid-gray\/20]:!bg-kw-gray-700">
      <SettingContainer {...props} />
    </div>
  );
};
