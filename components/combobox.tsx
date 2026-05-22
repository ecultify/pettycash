"use client";

import { useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// A free-text input with a tap-to-open suggestion list built from past
// entries. Pick an existing value, or type a new one — when the text doesn't
// match anything, a "Use '<text>' (new)" row lets you commit it.
export function Combobox({
  value,
  onChange,
  options,
  placeholder,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const query = value.trim().toLowerCase();
  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query))
    : options;
  const exactMatch = options.some((o) => o.toLowerCase() === query);
  const showCreate = value.trim() !== "" && !exactMatch;

  function pick(next: string) {
    onChange(next);
    setOpen(false);
  }

  return (
    <div className="relative">
      <Input
        id={id}
        value={value}
        role="combobox"
        aria-expanded={open}
        autoComplete="off"
        placeholder={placeholder}
        className="h-12 pr-10"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (closeTimer.current) clearTimeout(closeTimer.current);
          setOpen(true);
        }}
        onBlur={() => {
          // Delay so a tap on a suggestion registers before the panel closes.
          closeTimer.current = setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Toggle suggestions"
        onPointerDown={(e) => {
          e.preventDefault();
          setOpen((o) => !o);
        }}
        className="absolute right-0 top-0 flex h-12 w-10 items-center justify-center text-muted-foreground"
      >
        <ChevronsUpDown className="h-4 w-4" />
      </button>

      {open && (filtered.length > 0 || showCreate) && (
        <div
          // Prevent the input from blurring before a suggestion tap lands.
          onPointerDown={(e) => e.preventDefault()}
          className="absolute left-0 right-0 z-30 mt-1 max-h-56 overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {showCreate && (
            <button
              type="button"
              onClick={() => pick(value.trim())}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-3 text-left text-sm hover:bg-muted"
            >
              <span className="text-muted-foreground">Use</span>
              <span className="min-w-0 flex-1 truncate font-medium">
                “{value.trim()}”
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                new
              </span>
            </button>
          )}
          {filtered.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => pick(option)}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-3 text-left text-sm hover:bg-muted"
            >
              <Check
                className={cn(
                  "h-4 w-4 shrink-0",
                  option === value ? "opacity-100" : "opacity-0",
                )}
              />
              <span className="min-w-0 flex-1 truncate">{option}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
