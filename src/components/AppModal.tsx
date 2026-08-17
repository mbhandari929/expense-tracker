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
  return (
    <div className="app-modal-overlay">
      <div
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