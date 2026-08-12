import { useState, type FormEvent } from "react";
import "./AuthForm.css";
type ResetPasswordFormProps = {
  apiUrl: string;
  resetToken: string;
  onSuccess: () => void;
};

type ResetPasswordResponse = {
  message?: string | string[];
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
      const response = await fetch(
        `${apiUrl}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resetToken,
            newPassword,
          }),
        },
      );

      const data =
        (await response.json()) as ResetPasswordResponse;

      if (!response.ok) {
        const message = Array.isArray(data.message)
          ? data.message.join(" ")
          : data.message;

        setError(
          message || "Password reset failed.",
        );
        return;
      }

      alert("Password reset successfully.");
      onSuccess();
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
  );
}