import {
  useCallback,
  useEffect,
  useState,
} from "react";

import ExpenseTrackerPage from "./pages/ExpenseTrackerPage";
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import {
  getAccessToken,
  removeAccessToken,
  setAccessToken,
} from "./utils/api";

import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const getCurrentHash = () =>
  window.location.hash.slice(1);

function App() {
  const [hash, setHash] = useState(getCurrentHash);

  useEffect(() => {
    const handleHashChange = () => {
      setHash(getCurrentHash());
    };

    window.addEventListener(
      "hashchange",
      handleHashChange,
    );

    return () => {
      window.removeEventListener(
        "hashchange",
        handleHashChange,
      );
    };
  }, []);

  const [hashPath, hashQuery = ""] = hash.split("?");
  const resetToken = new URLSearchParams(
    hashQuery,
  ).get("token");

  const [isAuthenticated, setIsAuthenticated] =
    useState(() => Boolean(getAccessToken()));

  const handleLogin = useCallback(
    (accessToken: string) => {
      setAccessToken(accessToken);
      setIsAuthenticated(true);
    },
    [],
  );

  const handleLogout = useCallback(() => {
    removeAccessToken();
    setIsAuthenticated(false);
  }, []);

  const handleResetSuccess = useCallback(() => {
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${window.location.search}`,
    );
    setHash("");
    handleLogout();
  }, [handleLogout]);

  if (
    hashPath === "/reset-password" &&
    resetToken
  ) {
    return (
      <ResetPasswordPage
        apiUrl={API_URL}
        resetToken={resetToken}
        onSuccess={handleResetSuccess}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginPage
        apiUrl={API_URL}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <ExpenseTrackerPage
      apiUrl={API_URL}
      onLogout={handleLogout}
    />
  );
}

export default App;