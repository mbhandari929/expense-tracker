import { useState, type FormEvent } from "react";

import { setAccessToken } from "../utils/api";
import "./AuthForm.css";

type AuthMode = "login" | "register" | "forgot";

type AuthFormProps = {
  apiUrl: string;
  onLogin: (token: string) => void;
};

type AuthResponse = {
  access_token?: string;
  message?: string | string[];
};

function AuthForm({ apiUrl, onLogin }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const isForgotPassword = mode === "forgot";

  const clearMessages = () => {
    setError("");
    setMessage("");
  };

  const getMessage = (value?: string | string[]) =>
    Array.isArray(value) ? value.join(" ") : value;

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setPassword("");
    clearMessages();
  };

  const handleAuthSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    clearMessages();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/auth/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = (await response.json()) as AuthResponse;

      if (!response.ok) {
        setError(
          getMessage(data.message) || "Authentication failed.",
        );
        return;
      }

      if (isRegister) {
        setMode("login");
        setPassword("");
        setMessage("Registration successful. Please login.");
        return;
      }

      if (!data.access_token) {
        setError("Access token was not returned.");
        return;
      }

      setAccessToken(data.access_token);
      onLogin(data.access_token);
    } catch (error) {
      console.error("Authentication request failed:", error);
      setError("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    clearMessages();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${apiUrl}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        },
      );

      const data = (await response.json()) as AuthResponse;

      if (!response.ok) {
        setError(
          getMessage(data.message) ||
            "Password reset request failed.",
        );
        return;
      }

      setMessage(
        getMessage(data.message) ||
          "If an account exists, a reset link has been sent.",
      );
    } catch (error) {
      console.error("Password reset request failed:", error);
      setError("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
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
              <label htmlFor="forgot-email">Email</label>

              <input
                id="forgot-email"
                type="email"
                value={email}
                placeholder="example@email.com"
                autoComplete="email"
                required
                onChange={(event) =>
                  setEmail(event.target.value)
                }
              />
            </div>

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            {message && (
              <p className="auth-success">{message}</p>
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
              disabled={isSubmitting}
              onClick={() => changeMode("login")}
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
                <label htmlFor="auth-email">Email</label>

                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  placeholder="example@email.com"
                  autoComplete="email"
                  required
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                />
              </div>

              <div className="auth-field">
                <label htmlFor="auth-password">Password</label>

                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  placeholder="Enter your password"
                  minLength={8}
                  maxLength={72}
                  autoComplete={
                    isLogin
                      ? "current-password"
                      : "new-password"
                  }
                  required
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                />
              </div>

              {error && (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              )}

              {message && (
                <p className="auth-success">{message}</p>
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
                disabled={isSubmitting}
                onClick={() => changeMode("forgot")}
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
              disabled={isSubmitting}
              onClick={() =>
                changeMode(isLogin ? "register" : "login")
              }
            >
              {isLogin ? "Create Account" : "Back to Login"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthForm;