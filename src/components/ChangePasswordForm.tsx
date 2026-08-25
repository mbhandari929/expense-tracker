import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

import {
  authFetch,
  getAuthMessage,
} from "../utils/api";

import "./ChangePasswordForm.css";

type ChangePasswordFormProps = {
  apiUrl: string;
  onClose: () => void;
  onSuccess: () => void;
  onUnauthorized: () => void;
};

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "a[href]",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function ChangePasswordForm({
  apiUrl,
  onClose,
  onSuccess,
  onUnauthorized,
}: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const currentPasswordRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    currentPasswordRef.current?.focus();
  }, []);

  const handleKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key === "Escape") {
      event.preventDefault();

      if (!isSubmitting) {
        onClose();
      }

      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements =
      dialogRef.current?.querySelectorAll<HTMLElement>(
        FOCUSABLE_SELECTOR,
      );

    if (!focusableElements?.length) {
      event.preventDefault();
      dialogRef.current?.focus();
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

  const handleOverlayMouseDown = (
    event: MouseEvent<HTMLDivElement>,
  ) => {
    if (
      event.target === event.currentTarget &&
      !isSubmitting
    ) {
      onClose();
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        "New password must be different from current password.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authFetch(
        apiUrl,
        "/auth/change-password",
        {
          currentPassword,
          newPassword,
        },
        "Password change failed.",
        {
          method: "PATCH",
          authenticated: true,
        },
      );

      const message = getAuthMessage(
        result.data.message,
      );

      const normalizedMessage =
        message?.trim().toLowerCase() || "";

      const isCurrentPasswordError =
        result.status === 401 &&
        normalizedMessage.includes("current password");

      if (
        result.status === 401 &&
        !isCurrentPasswordError
      ) {
        onUnauthorized();
        return;
      }

      if (!result.ok) {
        setError(
          result.errorMessage ||
            "Password change failed.",
        );
        return;
      }

      onSuccess();
    } catch (error) {
      console.error("Password change failed:", error);
      setError("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="change-password-overlay"
      onMouseDown={handleOverlayMouseDown}
    >
      <div
        ref={dialogRef}
        className="change-password-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <h2 id="change-password-title">
          Change Password
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="change-password-field">
            <label htmlFor="current-password">
              Current Password
            </label>

            <input
              ref={currentPasswordRef}
              id="current-password"
              type="password"
              value={currentPassword}
              minLength={8}
              maxLength={72}
              autoComplete="current-password"
              required
              onChange={(event) =>
                setCurrentPassword(event.target.value)
              }
            />
          </div>

          <div className="change-password-field">
            <label htmlFor="new-password">
              New Password
            </label>

            <input
              id="new-password"
              type="password"
              value={newPassword}
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              required
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
            />
          </div>

          <div className="change-password-field">
            <label htmlFor="confirm-password">
              Confirm New Password
            </label>

            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              required
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
            />
          </div>

          {error && (
            <p className="change-password-error" role="alert">
              {error}
            </p>
          )}

          <div className="change-password-actions">
            <button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Changing..."
                : "Change Password"}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordForm;