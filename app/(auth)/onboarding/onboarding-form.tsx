"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InlineSpinner } from "@/components/loading/InlineSpinner";
import { completeOnboarding } from "@/app/_actions/auth";

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
  name: z.string().trim().min(1, "Tell us your name."),
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

type FormValues = z.infer<typeof schema>;

type Props = {
  defaultName: string;
  defaultBranch?: FormValues["branch"];
  defaultGradYear?: number;
};

export function OnboardingForm({
  defaultName,
  defaultBranch,
  defaultGradYear,
}: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [skipping, setSkipping] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultName,
      branch: defaultBranch,
      gradYear: defaultGradYear,
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      await completeOnboarding(values);
      toast.success("You're all set.");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function skip() {
    setSkipping(true);
    try {
      await completeOnboarding({
        name: defaultName.trim() || "Student",
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(message);
    } finally {
      setSkipping(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome to the platform.</CardTitle>
        <CardDescription>
          Tell us a bit about yourself so we can tailor your experience. You can
          change any of this later from your profile.
        </CardDescription>
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
                    <Input
                      autoComplete="name"
                      placeholder="Ada Lovelace"
                      {...field}
                    />
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
                  <FormLabel>Branch (optional)</FormLabel>
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
                  <FormLabel>Graduation year (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder="2026"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? undefined : Number(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              type="submit"
              className="w-full"
              disabled={submitting || skipping}
            >
              {submitting ? (
                <>
                  <InlineSpinner className="mr-2" />
                  Saving…
                </>
              ) : (
                "Continue"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={submitting || skipping}
              onClick={skip}
            >
              {skipping ? (
                <>
                  <InlineSpinner className="mr-2" />
                  Setting up…
                </>
              ) : (
                "Skip for now"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
