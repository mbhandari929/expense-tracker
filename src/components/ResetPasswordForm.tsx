import { useState, type FormEvent } from "react";
import { authFetch } from "../utils/api";
import "./AuthForm.css";
import AppModal from "./AppModal";

type ResetPasswordFormProps = {
  apiUrl: string;
  resetToken: string;
  onSuccess: () => void;
};

export default function ResetPasswordForm({
  apiUrl,
  resetToken,
  onSuccess,
}: ResetPasswordFormProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] =
    useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authFetch(
        apiUrl,
        "/auth/reset-password",
        {
          resetToken,
          newPassword,
        },
        "Password reset failed.",
      );

      if (!result.ok) {
        setError(
          result.errorMessage ||
            "Password reset failed.",
        );
        return;
      }

      setShowSuccessModal(true);
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    onSuccess();
  };

  return (
    <>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-icon">🔐</div>

          <h1>Reset Password</h1>

          <p className="auth-description">
            Enter your new password.
          </p>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <div className="auth-field">
              <label htmlFor="reset-new-password">
                New Password
              </label>

              <input
                id="reset-new-password"
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

            <div className="auth-field">
              <label htmlFor="reset-confirm-password">
                Confirm New Password
              </label>

              <input
                id="reset-confirm-password"
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
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="auth-main-button"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Resetting..."
                : "Reset Password"}
            </button>
          </form>
        </div>
      </div>

      {showSuccessModal && (
        <AppModal
          title="Password Reset"
          message="Password reset successfully."
          variant="success"
          confirmLabel="OK"
          onConfirm={handleSuccessConfirm}
        />
      )}
    </>
  );
}