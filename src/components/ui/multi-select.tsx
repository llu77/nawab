
"use client"

import * as React from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "@/lib/utils";

type Option = {
  value: string;
  label: string;
  group?: string;
};

type MultiSelectProps = {
  options: Option[];
  selected: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({ options, selected, onChange, placeholder, className }: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleUnselect = React.useCallback((val: string) => {
    onChange(selected.filter((s) => s !== val));
  }, [onChange, selected]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current
    if (input) {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (input.value === "") {
          const newSelected = [...selected];
          newSelected.pop();
          onChange(newSelected);
        }
      }
      if (e.key === "Escape") {
        input.blur();
      }
    }
  }, [onChange, selected]);

  const selectables = options.filter(option => !selected.includes(option.value));

  const groupedOptions = React.useMemo(() => {
    return selectables.reduce((acc, option) => {
      const group = option.group || "General";
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(option);
      return acc;
    }, {} as Record<string, Option[]>);
  }, [selectables]);


  return (
    <CommandPrimitive onKeyDown={handleKeyDown} className={cn("overflow-visible bg-transparent", className)}>
      <div
        className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      >
        <div className="flex flex-wrap gap-1">
          {selected.map((value) => {
            const option = options.find(o => o.value === value);
            return (
              <Badge key={value} variant="secondary" className="text-base">
                {option?.label}
                <button
                  className="mr-2 h-4 w-4 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(value);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(value)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            )
          })}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && Object.keys(groupedOptions).length > 0 ? (
          <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandList className="max-h-[300px] overflow-y-auto">
              {inputValue.length > 0 && (
                 <CommandItem
                    disabled
                    className="flex justify-center py-2 text-xs text-muted-foreground"
                >
                    اكتب للبحث...
                </CommandItem>
              )}
              {Object.entries(groupedOptions).map(([group, groupOptions]) => {
                return (
                  <CommandGroup key={group} heading={<span className="text-base font-bold text-foreground">{group}</span>} className="p-2">
                    {groupOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onSelect={() => {
                          setInputValue("");
                          onChange([...selected, option.value]);
                        }}
                        className={"cursor-pointer text-base"}
                      >
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )
              })}
            </CommandList>
          </div>
        ) : null}
      </div>
    </CommandPrimitive>
  )
}
