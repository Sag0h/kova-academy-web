"use client";

import type { ReactNode } from "react";

export function ConfirmSubmitButton({
  children,
  className,
  disabled,
  message,
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  message: string;
}) {
  return (
    <button
      className={className}
      disabled={disabled}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      type="submit"
    >
      {children}
    </button>
  );
}
