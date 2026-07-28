import { useEffect, useId, useMemo, useRef, useState } from "react";

/**
 * A listbox we render ourselves, because a native <select> hands its dropdown to
 * the OS and no CSS can reach inside it. Everything here is ours: hard edges,
 * mono type, black selection — the same language as the rest of the app.
 *
 * Keyboard, on the trigger: Enter/Space opens when closed and commits when open,
 * arrows open then move, Home/End jump (ignored while closed), Escape closes,
 * Tab closes and lets focus leave.
 *
 * The trigger is role="combobox", not a plain button: aria-activedescendant is
 * not valid on role="button", so screen readers drop it and announce nothing as
 * the highlight moves. This is the ARIA select-only combobox pattern.
 */

interface Option {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: readonly (string | Option)[];
  disabled?: boolean;
  "aria-label"?: string;
}

const toOption = (o: string | Option): Option =>
  typeof o === "string" ? { value: o, label: o } : o;

const trigger =
  "w-full rounded-none border bg-transparent px-2 py-1.5 text-left text-fg " +
  "focus:outline-none focus-visible:border-fg/60 " + // replaces the outline we drop
  "disabled:cursor-not-allowed disabled:opacity-40";

export function Select({ value, onChange, options, disabled, ...aria }: Props) {
  const opts = useMemo(() => options.map(toOption), [options]);
  // -1 stays -1. Clamping it to 0 made the control display the first option's
  // label while holding a value it never showed — a lying primitive.
  const selectedIndex = opts.findIndex((o) => o.value === value);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(selectedIndex);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();

  // Dismiss on a click anywhere outside the control
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  // Keep the keyboard-highlighted option visible when the list scrolls
  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function show() {
    setActive(Math.max(0, selectedIndex));
    setOpen(true);
  }

  function commit(index: number) {
    onChange(opts[index].value);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        open ? setActive((i) => Math.min(i + 1, opts.length - 1)) : show();
        break;
      case "ArrowUp":
        e.preventDefault();
        open ? setActive((i) => Math.max(i - 1, 0)) : show();
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActive(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActive(opts.length - 1);
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        open ? commit(active) : show();
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        role="combobox"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        className={`${trigger} flex items-center justify-between gap-2 ${
          open ? "border-fg/60" : "border-fg/20"
        }`}
        {...aria}
      >
        {/* An unrecognised value shows itself rather than pretending to be option 0 */}
        <span className="truncate">{opts[selectedIndex]?.label ?? value}</span>
        <span aria-hidden="true" className="text-muted">
          {open ? "▴" : "▾"}
        </span>
      </button>

      {open && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 max-h-56 overflow-y-auto border border-fg bg-bg"
        >
          {opts.map((o, i) => (
            <li
              key={o.value}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={o.value === value}
              onMouseEnter={() => setActive(i)}
              // preventDefault on mousedown, not onClick: stops focus moving to
              // the <li>. onKeyDown lives on the trigger only, so if focus ever
              // left it, arrows and Escape would go dead after a mouse pick.
              onMouseDown={(e) => {
                e.preventDefault();
                commit(i);
              }}
              className={`cursor-pointer px-2 py-1.5 ${
                o.value === value ? "bg-fg text-bg" : i === active ? "bg-soft" : ""
              }`}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
