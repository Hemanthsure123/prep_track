"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { RoundBlock } from "./RoundBlock";
import { makeEmptyRound, type WizardValues } from "./types";

export function Step2Rounds() {
  const { control } = useFormContext<WizardValues>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "rounds",
  });

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">Rounds</h2>
        <p className="text-muted-foreground text-sm">
          Add one card per round. Reorder with the arrows — round numbers
          renumber automatically. Questions go on the next step.
        </p>
      </header>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <RoundBlock
            key={field.id}
            index={index}
            total={fields.length}
            onMoveUp={() => index > 0 && move(index, index - 1)}
            onMoveDown={() =>
              index < fields.length - 1 && move(index, index + 1)
            }
            onRemove={() => remove(index)}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => append(makeEmptyRound())}
      >
        <PlusIcon className="size-4" />
        Add round
      </Button>
    </div>
  );
}
