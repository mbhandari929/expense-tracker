import {
  useEffect,
  useRef,
  type KeyboardEvent,
} from "react";

export type AppModalVariant =
  | "info"
  | "success"
  | "error"
  | "warning";

type AppModalProps = {
  title: string;
  message: string;
  variant?: AppModalVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
};

function AppModal({
  title,
  message,
  variant = "info",
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: AppModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef =
    useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmButtonRef.current?.focus();
  }, []);

  const handleKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key === "Escape") {
      onCancel?.();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements =
      modalRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );

    if (!focusableElements?.length) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement =
      focusableElements[focusableElements.length - 1];

    if (
      event.shiftKey &&
      document.activeElement === firstElement
    ) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (
      !event.shiftKey &&
      document.activeElement === lastElement
    ) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  return (
    <div
      className="app-modal-overlay"
      onKeyDown={handleKeyDown}
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          onCancel
        ) {
          onCancel();
        }
      }}
    >
      <div
        ref={modalRef}
        className={`app-modal app-modal-${variant}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-modal-title"
        aria-describedby="app-modal-message"
      >
        <h2 id="app-modal-title">{title}</h2>

        <p id="app-modal-message">{message}</p>

        <div className="app-modal-actions">
          {onCancel && (
            <button
              type="button"
              className="app-modal-cancel"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
          )}

          <button
            ref={confirmButtonRef}
            type="button"
            className="app-modal-confirm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AppModal;