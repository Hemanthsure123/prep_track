"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteCompany } from "@/app/_actions/interview";

export function CompanyDeleteButton({
  companyId,
  companyName,
  interviewCount,
}: {
  companyId: string;
  companyName: string;
  interviewCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        const { deletedInterviews } = await deleteCompany(companyId);
        toast.success(
          `Deleted ${companyName}${
            deletedInterviews > 0
              ? ` and ${deletedInterviews} ${
                  deletedInterviews === 1 ? "experience" : "experiences"
                }`
              : ""
          }.`,
        );
        setOpen(false);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Delete failed.");
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Delete ${companyName}`}
            className="absolute right-3 top-3 z-10 h-8 w-8 rounded-md p-0 text-foreground-muted opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
          />
        }
      >
        {pending ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <Trash2Icon className="size-4" />
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {companyName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes {companyName}
            {interviewCount > 0
              ? ` and all ${interviewCount} ${
                  interviewCount === 1 ? "experience" : "experiences"
                } belonging to it`
              : ""}
            , including every round, question, topic link, bookmark and uploaded
            file. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={pending}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
