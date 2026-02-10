import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface AppCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  headerAction?: React.ReactNode;
  padding?: "default" | "tight";
  hover?: boolean;
}

const AppCard = React.forwardRef<HTMLDivElement, AppCardProps>(
  (
    {
      title,
      description,
      headerAction,
      padding = "default",
      hover = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const paddingClass = padding === "tight" ? "p-4" : "p-6";
    return (
      <Card
        ref={ref}
        className={cn(
          hover && "transition-colors duration-150 hover:bg-muted/30",
          className
        )}
        {...props}
      >
        {(title != null || description != null || headerAction != null) && (
          <CardHeader className={cn("pb-4", paddingClass)}>
            <div className="flex items-start justify-between gap-4">
              <div>
                {title != null && (
                  <CardTitle className="text-lg font-medium">{title}</CardTitle>
                )}
                {description != null && (
                  <CardDescription className="mt-1">{description}</CardDescription>
                )}
              </div>
              {headerAction != null && (
                <div className="shrink-0">{headerAction}</div>
              )}
            </div>
          </CardHeader>
        )}
        <CardContent className={cn(!title && !description && !headerAction && "p-0", paddingClass, (title != null || description != null || headerAction != null) && "pt-0")}>
          {children}
        </CardContent>
      </Card>
    );
  }
);
AppCard.displayName = "AppCard";

export { AppCard };
