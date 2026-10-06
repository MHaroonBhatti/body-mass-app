import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "main" | "section";
}) {
  return (
    <Tag className={`mx-auto w-full max-w-3xl px-4 sm:px-6 ${className}`}>{children}</Tag>
  );
}
