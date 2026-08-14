import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, MailCheck, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — BiteHub" },
      { name: "description", content: "Create a BiteHub account to order, track and reorder food." },
      { property: "og:title", content: "Create account — BiteHub" },
      { property: "og:description", content: "Join BiteHub for faster checkout and order history." },
    ],
  }),
  component: RegisterPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{10,15}$/, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        next[String(i.path[0])] = i.message;
      });
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { name: form.name.trim(), phone: form.phone.trim() },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      toast.success("Account created!");
      void navigate({ to: "/", replace: true });
      return;
    }
    setSent(true);
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-up failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/", replace: true });
  };

  if (sent) {
    return (
      <div className="container-page flex justify-center py-20">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
            <MailCheck className="size-6" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a confirmation link to <strong>{form.email}</strong>. Confirm it to activate your
            BiteHub account.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/login">Back to sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-soft">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <UtensilsCrossed className="size-5" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Faster checkout, saved orders, rewards.</p>

        <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
          {(
            [
              { id: "name", label: "Full name", type: "text" },
              { id: "email", label: "Email", type: "email" },
              { id: "phone", label: "Phone number", type: "tel" },
              { id: "password", label: "Password", type: "password" },
            ] as const
          ).map((f) => (
            <div key={f.id} className="space-y-2">
              <Label htmlFor={f.id}>{f.label}</Label>
              <Input
                id={f.id}
                type={f.type}
                value={form[f.id]}
                onChange={(e) => set(f.id, e.target.value)}
                aria-invalid={Boolean(errors[f.id])}
              />
              {errors[f.id] && <p className="text-xs text-destructive">{errors[f.id]}</p>}
            </div>
          ))}
          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            Create account
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <Button variant="outline" size="lg" className="w-full" onClick={() => void google()}>
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
