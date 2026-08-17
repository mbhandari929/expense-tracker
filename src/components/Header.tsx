type HeaderProps = {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
};

function Header({
  darkMode,
  onToggleDarkMode,
  onChangePassword,
  onLogout,
}: HeaderProps) {
  return (
    <header className="app-header">
      <h1>💰 Expense Tracker App</h1>

      <button
        type="button"
        className="dark-btn"
        onClick={onToggleDarkMode}
      >
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      <button
        type="button"
        className="change-password-button"
        onClick={onChangePassword}
      >
        Change Password
      </button>

      <button
        type="button"
        className="logout-button"
        onClick={onLogout}
      >
        Logout
      </button>
    </header>
  );
}

export default Header;