"use client";

import { useFormStatus } from "react-dom";

type ConfirmSubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  confirmMessage: string;
  className?: string;
};

export default function ConfirmSubmitButton({
  label,
  pendingLabel,
  confirmMessage,
  className = "",
}: ConfirmSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      onClick={(e) => {
        const confirmed = window.confirm(confirmMessage);

        if (!confirmed) {
          e.preventDefault();
        }
      }}
      className={className}
    >
      {pending ? pendingLabel ?? label : label}
    </button>
  );
}
