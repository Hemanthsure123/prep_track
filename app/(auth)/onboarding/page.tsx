import { redirect } from "next/navigation";

import { getCurrentDbUser } from "@/lib/auth/guards";

import { OnboardingForm } from "./onboarding-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Welcome | Interview Experience Platform",
};

export default async function OnboardingPage() {
  const user = await getCurrentDbUser();
  if (!user) redirect("/login");
  if (user.onboardedAt) redirect("/dashboard");

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <OnboardingForm
        defaultName={user.name ?? ""}
        defaultBranch={user.branch ?? undefined}
        defaultGradYear={user.gradYear ?? undefined}
      />
    </main>
  );
}
