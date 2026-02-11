import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export interface SaveButtonRowProps {
  label: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
}

export function SaveButtonRow({
  label,
  disabled,
  loading,
  onClick,
  type = "button",
  variant = "default",
}: SaveButtonRowProps) {
  return (
    <div className="flex justify-end pt-1">
      <Button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={variant === "default" ? "h-11 min-h-11 font-semibold" : undefined}
        variant={variant === "default" ? undefined : variant}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving…
          </>
        ) : (
          label
        )}
      </Button>
    </div>
  );
}
