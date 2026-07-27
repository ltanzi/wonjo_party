import {
  forwardRef,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

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

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = "", children, ...props }, ref) => (
    <select ref={ref} className={`${base} ${className}`} {...props}>
      {children}
    </select>
  ),
);
Select.displayName = "Select";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = "", ...props }, ref) => (
  <textarea ref={ref} className={`${base} ${className}`} {...props} />
));
Textarea.displayName = "Textarea";
