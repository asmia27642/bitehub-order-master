import { Check, CircleX } from "lucide-react";
import { statusLabel, stepsFor } from "@/lib/format";
import { cn } from "@/lib/utils";

export function OrderTracker({ status, type }: { status: string; type: string }) {
  const steps = stepsFor(type);
  const current = steps.indexOf(status);

  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-5">
        <CircleX className="size-6 text-destructive" />
        <div>
          <p className="font-semibold">Order cancelled</p>
          <p className="text-sm text-muted-foreground">
            Please contact the restaurant if this looks wrong.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const done = current >= index && current !== -1;
        const active = current === index;
        return (
          <li key={step} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground",
                )}
              >
                {done ? <Check className="size-4" /> : <span className="text-xs">{index + 1}</span>}
              </span>
              {index < steps.length - 1 && (
                <span
                  className={cn("h-10 w-0.5", done ? "bg-primary" : "bg-border")}
                  aria-hidden
                />
              )}
            </div>
            <div className="pb-6">
              <p className={cn("font-medium", active && "text-primary")}>
                {statusLabel(step, type)}
              </p>
              {active && (
                <p className="text-sm text-muted-foreground">Current status of your order</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
