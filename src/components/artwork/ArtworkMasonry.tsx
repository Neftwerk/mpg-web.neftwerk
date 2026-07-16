"use client";

import { Children, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Extra classes on the column container. */
  className?: string;
  /**
   * Column count breakpoints (Tailwind columns-* utilities).
   * Default matches Discover / My Gallery browse density.
   */
  columnsClassName?: string;
};

/**
 * Pinterest-style masonry: uniform column width, variable item height.
 * Items must size their images to column width (w-full h-auto).
 */
export function ArtworkMasonry({
  children,
  className = "",
  columnsClassName = "columns-2 gap-3 lg:columns-3 xl:columns-4",
}: Props) {
  return (
    <div className={`${columnsClassName} ${className}`}>
      {Children.map(children, (child, index) => {
        if (child == null) return null;
        return (
          <div key={index} className="mb-3 break-inside-avoid">
            {child}
          </div>
        );
      })}
    </div>
  );
}
