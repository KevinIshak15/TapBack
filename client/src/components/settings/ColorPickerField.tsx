import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { labelClass } from "./SettingsSection";

export interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
  disabled?: boolean;
}

export function ColorPickerField({
  label,
  value,
  onChange,
  optional,
  disabled,
}: ColorPickerFieldProps) {
  return (
    <div className="space-y-2">
      <Label className={labelClass}>
        {label}
        {optional && <span className="text-xs text-slate-400 font-normal ml-1">(Optional)</span>}
      </Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || "#2563eb"}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-10 w-14 rounded-lg border border-slate-200 cursor-pointer disabled:opacity-50"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="#2563eb"
          className="h-12 rounded-xl border-slate-200 bg-white focus:border-slate-500 focus:ring-slate-500/20 flex-1 font-mono text-sm"
        />
      </div>
    </div>
  );
}
