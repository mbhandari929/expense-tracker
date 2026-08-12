import { useState, type FormEvent } from "react";

import { setAccessToken } from "../utils/api";
import "./AuthForm.css";

type AuthFormProps = {
  apiUrl: string;
  onLogin: (token: string) => void;
};

type AuthMode = "login" | "register" | "forgot";

type AuthResponse = {
  access_token?: string;
  message?: string | string[];
};

export default function AuthForm({
  apiUrl,
  onLogin,
}: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const isForgotPassword = mode === "forgot";

  const resetMessages = () => {
    setError("");
    setMessage("");
  };

  const handleAuthSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    resetMessages();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${apiUrl}/auth/${mode}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const data =
        (await response.json()) as AuthResponse;

      if (!response.ok) {
        const errorMessage = Array.isArray(data.message)
          ? data.message.join(" ")
          : data.message;

        setError(
          errorMessage || "Authentication failed.",
        );
        return;
      }

      if (isRegister) {
        setMode("login");
        setPassword("");
        setMessage(
          "Registration successful. Please login.",
        );
        return;
      }

      if (!data.access_token) {
        setError("Access token was not returned.");
        return;
      }

      setAccessToken(data.access_token);
      onLogin(data.access_token);
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    resetMessages();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${apiUrl}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      const data =
        (await response.json()) as AuthResponse;

      if (!response.ok) {
        const errorMessage = Array.isArray(data.message)
          ? data.message.join(" ")
          : data.message;

        setError(
          errorMessage ||
            "Password reset request failed.",
        );
        return;
      }

     const successMessage = Array.isArray(data.message)
  ? data.message.join(" ")
  : data.message;

setMessage(
  successMessage ||
    "If an account exists, a reset link has been sent.",
);
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showLogin = () => {
    setMode("login");
    setPassword("");
    resetMessages();
  };

  const showRegister = () => {
    setMode("register");
    setPassword("");
    resetMessages();
  };

  const showForgotPassword = () => {
    setMode("forgot");
    setPassword("");
    resetMessages();
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">💰</div>

        <h1>Expense Tracker</h1>

        <p className="auth-description">
          {isForgotPassword
            ? "Enter your email to reset your password."
            : isLogin
              ? "Welcome back! Login to continue."
              : "Create your account to get started."}
        </p>

        {isForgotPassword ? (
          <form
            className="auth-form"
            onSubmit={handleForgotPassword}
          >
            <div className="auth-field">
              <label htmlFor="forgot-email">
                Email
              </label>

              <input
                id="forgot-email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                required
              />
            </div>

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            {message && (
              <p className="auth-success">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="auth-main-button"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Please wait..."
                : "Send Reset Link"}
            </button>

            <button
              type="button"
              className="auth-secondary-button"
              onClick={showLogin}
              disabled={isSubmitting}
            >
              Back to Login
            </button>
          </form>
        ) : (
          <>
            <form
              className="auth-form"
              onSubmit={handleAuthSubmit}
            >
              <div className="auth-field">
                <label htmlFor="auth-email">
                  Email
                </label>

                <input
                  id="auth-email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  autoComplete="email"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="auth-password">
                  Password
                </label>

                <input
                  id="auth-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  minLength={8}
                  maxLength={72}
                  autoComplete={
                    isLogin
                      ? "current-password"
                      : "new-password"
                  }
                  required
                />
              </div>

              {error && (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              )}

              {message && (
                <p className="auth-success">
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="auth-main-button"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Please wait..."
                  : isLogin
                    ? "Login"
                    : "Create Account"}
              </button>
            </form>

            {isLogin && (
              <button
                type="button"
                className="auth-forgot-button"
                onClick={showForgotPassword}
                disabled={isSubmitting}
              >
                Forgot Password?
              </button>
            )}

            <div className="auth-divider">
              <span />
              <p>or</p>
              <span />
            </div>

            <p className="auth-bottom-text">
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}
            </p>

            <button
              type="button"
              className="auth-secondary-button"
              onClick={
                isLogin ? showRegister : showLogin
              }
              disabled={isSubmitting}
            >
              {isLogin
                ? "Create Account"
                : "Back to Login"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}