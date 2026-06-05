"use client";

import { useEffect } from "react";

export default function FormSubmitFeedback() {
  useEffect(() => {
    function handleSubmit(event: SubmitEvent) {
      const form = event.target;

      if (!(form instanceof HTMLFormElement)) {
        return;
      }

      window.setTimeout(() => {
        if (event.defaultPrevented) {
          return;
        }

        const submitButtons = form.querySelectorAll<HTMLButtonElement>(
          'button[type="submit"]'
        );

        submitButtons.forEach((button) => {
          if (button.disabled) {
            return;
          }

          button.dataset.originalText = button.textContent ?? "";
          button.disabled = true;
          button.setAttribute("aria-busy", "true");
          button.classList.add("cursor-not-allowed", "opacity-70");
          button.textContent = button.dataset.pendingText || "Working...";
        });
      }, 0);
    }

    function handlePageShow() {
      document
        .querySelectorAll<HTMLButtonElement>('button[aria-busy="true"]')
        .forEach((button) => {
          button.disabled = false;
          button.removeAttribute("aria-busy");
          button.classList.remove("cursor-not-allowed", "opacity-70");

          if (button.dataset.originalText) {
            button.textContent = button.dataset.originalText;
            delete button.dataset.originalText;
          }
        });
    }

    document.addEventListener("submit", handleSubmit);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      document.removeEventListener("submit", handleSubmit);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  return null;
}
