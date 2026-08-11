import {
  useState,
  type FormEvent,
} from "react";
import { setAccessToken } from "../utils/api";
import "./AuthForm.css";

type AuthFormProps = {
  apiUrl: string;
  onLogin: (token: string) => void;
};

type AuthResponse = {
  access_token?: string;
  message?: string | string[];
};

export default function AuthForm({
  apiUrl,
  onLogin,
}: AuthFormProps) {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] =
    useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const isLogin = mode === "login";

  // Login / Register
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
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
        const message = Array.isArray(data.message)
          ? data.message.join(" ")
          : data.message;

        setError(
          message || "Authentication failed.",
        );
        return;
      }

      if (!isLogin) {
        setMode("login");
        setPassword("");

        alert(
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
      setError(
        "Unable to connect to the server.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Switch Login / Register
  const switchMode = () => {
    setMode(isLogin ? "register" : "login");
    setPassword("");
    setError("");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">💰</div>

        <h1>Expense Tracker</h1>

        <p className="auth-description">
          {isLogin
            ? "Welcome back! Login to continue."
            : "Create your account to get started."}
        </p>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <div className="auth-field">
            <label htmlFor="auth-email">
              Email
            </label>

            <input
              id="auth-email"
              type="email"
              value={email}
              placeholder="example@email.com"
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
              value={password}
              placeholder="Enter your password"
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
            <p
              className="auth-error"
              role="alert"
            >
              {error}
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
          onClick={switchMode}
          disabled={isSubmitting}
        >
          {isLogin
            ? "Create Account"
            : "Back to Login"}
        </button>
      </div>
    </div>
  );
}