"use client";

type ConfirmSubmitButtonProps = {
  label: string;
  confirmMessage: string;
  className?: string;
};

export default function ConfirmSubmitButton({
  label,
  confirmMessage,
  className = "",
}: ConfirmSubmitButtonProps) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        const confirmed = window.confirm(confirmMessage);

        if (!confirmed) {
          e.preventDefault();
        }
      }}
      className={className}
    >
      {label}
    </button>
  );
}