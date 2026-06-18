import type { Dispatch, SetStateAction } from "react";

type HeaderProps = {
  darkMode: boolean;
  setDarkMode: Dispatch<SetStateAction<boolean>>;
};

function Header({ darkMode, setDarkMode }: HeaderProps) {
  return (
    <>
      <h1>💰 Expense Tracker App</h1>

      <button className="dark-btn" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>
    </>
  );
}

export default Header;