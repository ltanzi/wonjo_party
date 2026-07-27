import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const base =
  "w-full rounded-none border border-fg/20 bg-transparent px-2 py-1.5 text-fg " +
  "placeholder:text-muted focus:border-fg/60 focus:outline-none disabled:opacity-40";

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted">
      {children}
    </span>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input ref={ref} className={`${base} ${className}`} {...props} />
  ),
);
Input.displayName = "Input";

// Select lives in ./Select.tsx — it is a custom listbox, not a native <select>,
// because the OS renders a native dropdown's list and CSS cannot reach it.

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = "", ...props }, ref) => (
  <textarea ref={ref} className={`${base} ${className}`} {...props} />
));
Textarea.displayName = "Textarea";
