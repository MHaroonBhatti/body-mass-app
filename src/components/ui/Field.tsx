import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

interface FieldShellProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}

export function FieldShell({ id, label, error, hint, optional, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-[var(--foreground)]">
        {label}
        {optional ? (
          <span className="ml-1 font-normal text-[var(--muted)]">(optional)</span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-[var(--muted)]">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-[var(--danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const controlClass =
  "w-full rounded-xl border border-[var(--border)] bg-white px-3.5 py-3 text-sm text-[var(--foreground)] shadow-sm placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25 aria-[invalid=true]:border-[var(--danger)]";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
};

export function TextInput({
  id,
  label,
  error,
  hint,
  optional,
  className = "",
  ...rest
}: InputProps) {
  const fieldId = id ?? rest.name ?? label;
  return (
    <FieldShell id={fieldId} label={label} error={error} hint={hint} optional={optional}>
      <input
        id={fieldId}
        className={`${controlClass} ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        {...rest}
      />
    </FieldShell>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
};

export function TextSelect({
  id,
  label,
  error,
  hint,
  optional,
  className = "",
  children,
  ...rest
}: SelectProps) {
  const fieldId = id ?? rest.name ?? label;
  return (
    <FieldShell id={fieldId} label={label} error={error} hint={hint} optional={optional}>
      <select
        id={fieldId}
        className={`${controlClass} ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        {...rest}
      >
        {children}
      </select>
    </FieldShell>
  );
}
