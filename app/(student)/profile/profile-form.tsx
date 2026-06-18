"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { toast } from "sonner";
import { z } from "zod";
import type { Branch } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InlineSpinner } from "@/components/loading/InlineSpinner";
import { updateProfile, signOut } from "@/app/_actions/auth";
import { createClient } from "@/lib/supabase/client";

const BRANCHES = [
  { value: "CSE", label: "Computer Science" },
  { value: "IT", label: "Information Technology" },
  { value: "ECE", label: "Electronics & Communication" },
  { value: "EEE", label: "Electrical & Electronics" },
  { value: "MECH", label: "Mechanical" },
  { value: "CIVIL", label: "Civil" },
  { value: "CHEM", label: "Chemical" },
  { value: "AI_ML", label: "AI / ML" },
  { value: "OTHER", label: "Other" },
] as const;

const schema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  branch: z
    .enum([
      "CSE",
      "IT",
      "ECE",
      "EEE",
      "MECH",
      "CIVIL",
      "CHEM",
      "AI_ML",
      "OTHER",
    ])
    .optional(),
  gradYear: z
    .number()
    .int()
    .min(2000)
    .max(2035)
    .optional(),
});
type Values = z.infer<typeof schema>;

type Props = {
  email: string;
  name: string | null;
  branch: Branch | null;
  gradYear: number | null;
  avatarUrl: string | null;
};

export function ProfileForm({ email, name, branch, gradYear, avatarUrl }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: name ?? "",
      branch: branch ?? undefined,
      gradYear: gradYear ?? undefined,
    },
  });

  async function onSubmit(values: Values) {
    setSubmitting(true);
    try {
      await updateProfile(values);
      toast.success("Profile saved.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSubmitting(false);
    }
  }

  const initials = (name ?? email).slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your basic account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-full border border-border bg-secondary flex items-center justify-center overflow-hidden text-sm font-semibold text-foreground">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  width={56}
                  height={56}
                  className="object-cover size-full"
                />
              ) : (
                initials
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {name ?? "Unnamed student"}
              </p>
              <p className="text-xs text-muted-foreground">{email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} readOnly disabled />
            <p className="text-xs text-muted-foreground">
              Email is tied to your authentication and cannot be changed here.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How you appear across the platform.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pick your branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BRANCHES.map((b) => (
                          <SelectItem key={b.value} value={b.value}>
                            {b.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gradYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Graduation year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="2026"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <InlineSpinner className="mr-2" />
                    Saving…
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Change your password or sign out.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <ChangePasswordDialog />
          <SignOutEverywhereButton />
        </CardContent>
      </Card>
    </div>
  );
}

function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Password updated.");
      setOpen(false);
      setNewPassword("");
      setConfirm("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        Change password
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Pick a new password (at least 8 characters). Google-sign-in
            accounts can change passwords via Google directly.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <InlineSpinner className="mr-2" />
                  Updating…
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SignOutEverywhereButton() {
  const [pending, setPending] = useState(false);
  async function onClick() {
    setPending(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut({ scope: "global" });
      await signOut();
    } finally {
      setPending(false);
    }
  }
  return (
    <Button variant="outline" onClick={onClick} disabled={pending}>
      {pending ? <InlineSpinner className="mr-2" /> : null}
      Sign out everywhere
    </Button>
  );
}
