import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ItemCustomizer } from "./ItemCustomizer";
import type { MenuItem } from "@/lib/types";

export function ItemDialog({
  item,
  onOpenChange,
}: {
  item: MenuItem | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={Boolean(item)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        {item && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">{item.name}</DialogTitle>
            </DialogHeader>
            <img
              src={item.image ?? "/images/hero.jpg"}
              alt={item.name}
              loading="lazy"
              width={1024}
              height={768}
              className="aspect-[16/9] w-full rounded-xl object-cover"
            />
            <ItemCustomizer item={item} onDone={() => onOpenChange(false)} />
            <Link
              to="/menu/$id"
              params={{ id: item.id }}
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              View full item page
            </Link>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
