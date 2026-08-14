import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/site/StarRating";
import { formatPKR } from "@/lib/format";
import { useCart } from "@/hooks/useCart";
import type { MenuItem, SelectedOption } from "@/lib/types";

/** Shared customization UI used by both the quick-view dialog and the detail page. */
export function ItemCustomizer({ item, onDone }: { item: MenuItem; onDone?: () => void }) {
  const { add } = useCart();
  const groups = Array.isArray(item.options) ? item.options : [];
  const [single, setSingle] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    groups.forEach((g) => {
      if (g.type === "single" && g.choices[0]) initial[g.name] = g.choices[0].label;
    });
    return initial;
  });
  const [multi, setMulti] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const selected = useMemo<SelectedOption[]>(() => {
    const out: SelectedOption[] = [];
    groups.forEach((g) => {
      if (g.type === "single") {
        const label = single[g.name];
        const choice = g.choices.find((c) => c.label === label);
        if (choice) out.push({ group: g.name, label: choice.label, price: Number(choice.price) });
      } else {
        (multi[g.name] ?? []).forEach((label) => {
          const choice = g.choices.find((c) => c.label === label);
          if (choice) out.push({ group: g.name, label: choice.label, price: Number(choice.price) });
        });
      }
    });
    return out;
  }, [groups, single, multi]);

  const unitPrice = Number(item.price) + selected.reduce((s, o) => s + o.price, 0);

  const handleAdd = () => {
    add(item, selected, quantity, notes.trim() || undefined);
    toast.success(`${item.name} added to cart.`);
    onDone?.();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <StarRating rating={item.rating} />
        <Badge variant={item.is_available ? "secondary" : "destructive"}>
          {item.is_available ? "Available now" : "Currently unavailable"}
        </Badge>
        <span className="font-display text-xl font-bold text-primary">
          {formatPKR(Number(item.price))}
        </span>
      </div>

      <p className="text-sm text-muted-foreground">{item.description}</p>

      {item.ingredients.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold">Ingredients</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {item.ingredients.map((ing) => (
              <Badge key={ing} variant="outline" className="font-normal">
                {ing}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {groups.map((group) => (
        <fieldset key={group.name} className="space-y-3">
          <legend className="text-sm font-semibold">
            {group.name}
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {group.type === "single" ? "Choose one" : "Choose any"}
            </span>
          </legend>

          {group.type === "single" ? (
            <RadioGroup
              value={single[group.name] ?? ""}
              onValueChange={(v) => setSingle((p) => ({ ...p, [group.name]: v }))}
              className="grid gap-2 sm:grid-cols-2"
            >
              {group.choices.map((choice) => (
                <Label
                  key={choice.label}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border p-3 text-sm transition-colors hover:bg-secondary has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-secondary"
                >
                  <span className="flex items-center gap-2">
                    <RadioGroupItem value={choice.label} />
                    {choice.label}
                  </span>
                  <span className="text-muted-foreground">
                    {choice.price > 0 ? `+ ${formatPKR(choice.price)}` : "Free"}
                  </span>
                </Label>
              ))}
            </RadioGroup>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {group.choices.map((choice) => {
                const checked = (multi[group.name] ?? []).includes(choice.label);
                return (
                  <Label
                    key={choice.label}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border p-3 text-sm transition-colors hover:bg-secondary has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-secondary"
                  >
                    <span className="flex items-center gap-2">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) =>
                          setMulti((prev) => {
                            const current = prev[group.name] ?? [];
                            return {
                              ...prev,
                              [group.name]: v
                                ? [...current, choice.label]
                                : current.filter((l) => l !== choice.label),
                            };
                          })
                        }
                      />
                      {choice.label}
                    </span>
                    <span className="text-muted-foreground">
                      {choice.price > 0 ? `+ ${formatPKR(choice.price)}` : "Free"}
                    </span>
                  </Label>
                );
              })}
            </div>
          )}
        </fieldset>
      ))}

      <div className="space-y-2">
        <Label htmlFor="special-instructions">Special instructions</Label>
        <Textarea
          id="special-instructions"
          placeholder="e.g. extra spicy, no mayo"
          value={notes}
          maxLength={200}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-1.5 sm:justify-start">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Minus className="size-4" />
          </Button>
          <span className="w-8 text-center font-semibold" aria-live="polite">
            {quantity}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => Math.min(20, q + 1))}
          >
            <Plus className="size-4" />
          </Button>
        </div>

        <Button className="flex-1" size="lg" disabled={!item.is_available} onClick={handleAdd}>
          <ShoppingBag className="size-4" />
          Add to cart · {formatPKR(unitPrice * quantity)}
        </Button>
      </div>
    </div>
  );
}
