import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/site/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My account — BiteHub" },
      { name: "description", content: "Manage your BiteHub profile details and contact info." },
      { property: "og:title", content: "My account — BiteHub" },
      { property: "og:description", content: "Update your BiteHub account details." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, isAdmin, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    setName(profile?.name ?? "");
    setPhone(profile?.phone ?? "");
  }, [profile]);

  if (!loading && !user) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<UserRound className="size-6" />}
          title="Sign in to manage your account"
          description="Your saved details and preferences live here."
          action={
            <Button asChild>
              <Link to="/login" search={{ redirect: "/profile" }}>
                Sign in
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim(), phone: phone.trim() })
      .eq("id", user.id);
    setBusy(false);
    if (error) {
      toast.error("Couldn't save your details.");
      return;
    }
    await refresh();
    toast.success("Profile updated.");
  };

  const claimAdmin = async () => {
    setClaiming(true);
    const { data, error } = await supabase.rpc("claim_first_admin");
    setClaiming(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data) {
      await refresh();
      toast.success("You are now the restaurant admin.");
    } else {
      toast.error("An admin already exists for this restaurant.");
    }
  };

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/", replace: true });
  };

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">My Account</h1>

      <div className="mt-8 grid max-w-3xl gap-6">
        <form
          onSubmit={save}
          className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
        >
          <h2 className="font-display text-lg font-semibold">Profile details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={15}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? ""} disabled />
            </div>
          </div>
          <Button type="submit" disabled={busy}>
            Save changes
          </Button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div>
            <h2 className="font-display text-lg font-semibold">Restaurant admin</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isAdmin
                ? "You have admin access to the BiteHub dashboard."
                : "Claim admin access if you're the restaurant owner and no admin exists yet."}
            </p>
          </div>
          {isAdmin ? (
            <Button asChild variant="outline">
              <Link to="/admin">
                <ShieldCheck className="size-4" /> Open dashboard
              </Link>
            </Button>
          ) : (
            <Button variant="outline" onClick={() => void claimAdmin()} disabled={claiming}>
              Claim admin access
            </Button>
          )}
        </div>

        <div className="flex justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div>
            <h2 className="font-display text-lg font-semibold">Session</h2>
            <p className="mt-1 text-sm text-muted-foreground">Sign out of BiteHub on this device.</p>
          </div>
          <Button variant="destructive" onClick={() => void signOut()}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
