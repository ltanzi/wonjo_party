import { KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { Input } from "./Field";

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  "aria-label"?: string;
  autoFocus?: boolean;
  required?: boolean;
}

/**
 * Free-text input with prefix-filtered suggestions. Replaces a native
 * <datalist>: browsers disagree on how they match against it — Chrome matches
 * anywhere in the string, not just the start — and that behaviour cannot be
 * set from HTML or CSS. This is the ARIA 1.2 "combobox with list autocomplete"
 * pattern instead, so filtering is ours to define: startsWith, case-insensitive.
 *
 * Never a closed set — whatever is typed is the value, suggested or not.
 */
export function Autocomplete({ value, onChange, options, ...rest }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();

  const query = value.trim().toLowerCase();
  const matches = query ? options.filter((o) => o.toLowerCase().startsWith(query)) : options;
  // Don't suggest the value already sitting in the field — there's nothing to pick
  const suggestions = matches.filter((o) => o.toLowerCase() !== query);

  useEffect(() => setActive(0), [value]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function pick(name: string) {
    onChange(name);
    setOpen(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    // Nothing to navigate: let Enter behave like any other field and submit
    // the form, rather than swallowing the keystroke for an empty list.
    if (!open || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => Math.min(i + 1, suggestions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        pick(suggestions[active]);
        break;
      case "Escape":
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <Input
        {...rest}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-expanded={open && suggestions.length > 0}
        aria-controls={id}
        aria-activedescendant={open && suggestions.length > 0 ? `${id}-opt-${active}` : undefined}
        autoComplete="off"
      />

      {open && suggestions.length > 0 && (
        <ul
          ref={listRef}
          id={id}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 max-h-56 overflow-y-auto border border-fg bg-bg"
        >
          {suggestions.map((name, i) => (
            <li
              key={name}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              // preventDefault, not onClick: keeps focus on the input, matching
              // Select.tsx — otherwise focus would move to the <li> and the
              // keyboard handler (bound to the input alone) would go dead.
              onMouseDown={(e) => {
                e.preventDefault();
                pick(name);
              }}
              className={`cursor-pointer px-2 py-1.5 ${i === active ? "bg-soft" : ""}`}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
