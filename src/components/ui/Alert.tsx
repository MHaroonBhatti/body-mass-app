import type { ReactNode } from "react";

type AlertTone = "info" | "error" | "success";

const toneClasses: Record<AlertTone, string> = {
  info: "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)]",
  error: "border-red-200 bg-red-50 text-red-900",
  success: "border-teal-200 bg-teal-50 text-teal-950",
};

export function Alert({
  tone = "info",
  title,
  children,
}: {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm ${toneClasses[tone]}`}
    >
      {title ? <p className="mb-1 font-medium">{title}</p> : null}
      <div className="text-[0.95em] leading-relaxed opacity-90">{children}</div>
    </div>
  );
}
