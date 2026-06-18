import { IconSequenceLoader } from "./IconSequenceLoader";
import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  variant?: "overlay" | "inset";
  className?: string;
};

export function FullScreenLoader({
  label = "Loading…",
  variant = "overlay",
  className,
}: Props) {
  if (variant === "inset") {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "flex min-h-[60vh] items-center justify-center",
          className,
        )}
      >
        <IconSequenceLoader label={label} size="lg" />
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
        className,
      )}
    >
      <IconSequenceLoader label={label} size="lg" />
    </div>
  );
}
