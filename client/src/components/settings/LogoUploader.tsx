import * as React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { inputClass, labelClass } from "./SettingsSection";

export interface LogoUploaderProps {
  value?: string | null;
  onChange?: (dataUrl: string) => void;
  disabled?: boolean;
  accept?: string;
}

export function LogoUploader({
  value,
  onChange,
  disabled,
  accept = "image/*",
}: LogoUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onChange) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") onChange(result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-2">
      <Label className={labelClass}>Company logo</Label>
      <div className="flex items-center gap-3 flex-wrap">
        {value ? (
          <div className="h-16 w-16 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
            <img src={value} alt="Logo" className="h-full w-full object-contain" />
          </div>
        ) : (
          <div className="h-16 w-16 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 text-slate-400">
            <Upload className="w-6 h-6" />
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFile}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl h-10"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload picture
          </Button>
          {value && onChange && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-xl h-10 text-slate-600"
              disabled={disabled}
              onClick={() => onChange("")}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
