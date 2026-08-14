import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  className,
  showValue = true,
}: {
  rating: number;
  className?: string;
  showValue?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", className)}>
      <Star className="size-4 fill-accent text-accent" aria-hidden />
      {showValue && <span className="font-medium">{Number(rating).toFixed(1)}</span>}
    </span>
  );
}
