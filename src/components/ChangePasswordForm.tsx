import { useState, type FormEvent } from "react";
import "./ChangePasswordForm.css";
import { apiFetch } from "../utils/api";

type ChangePasswordFormProps = {
  apiUrl: string;
  onClose: () => void;
  onSuccess: () => void;
};

type ChangePasswordResponse = {
  message?: string;
};

export default function ChangePasswordForm({
  apiUrl,
  onClose,
  onSuccess,
}: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const response = await apiFetch(
        `${apiUrl}/auth/change-password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        },
      );

      const data =
        (await response.json()) as ChangePasswordResponse;

      if (!response.ok) {
        setError(
          data.message || "Password change failed.",
        );
        return;
      }

      alert("Password changed successfully.");

      onSuccess();
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="change-password-card">
      <h2>Change Password</h2>

      <form onSubmit={handleSubmit}>
        <div className="change-password-field">
          <label htmlFor="current-password">
            Current Password
          </label>

          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(event) =>
              setCurrentPassword(event.target.value)
            }
            minLength={8}
            maxLength={72}
            autoComplete="current-password"
            required
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
            onChange={(event) =>
              setNewPassword(event.target.value)
            }
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            required
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
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            required
          />
        </div>

        {error && (
          <p
            className="change-password-error"
            role="alert"
          >
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
  );
}