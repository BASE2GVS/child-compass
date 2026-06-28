"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/design-system";

type FormSaveButtonProps = React.ComponentProps<typeof Button> & {
  savingLabel?: string;
};

export default function FormSaveButton({
  children,
  savingLabel = "Saving…",
  disabled,
  ...props
}: FormSaveButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} {...props}>
      {pending ? savingLabel : children}
    </Button>
  );
}
