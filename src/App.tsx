import { useEffect, useState } from "react";

import ActionButtons from "./components/ActionButtons";
import AppModal, {
  type AppModalVariant,
} from "./components/AppModal";
import AuthForm from "./components/AuthForm";
import ChangePasswordForm from "./components/ChangePasswordForm";
import Header from "./components/Header";
import MonthlyBudget from "./components/MonthlyBudget";
import OpeningBalanceField from "./components/OpeningBalanceField";
import ResetPasswordForm from "./components/ResetPasswordForm";
import SummaryCard from "./components/SummaryCard";
import TransactionChart from "./components/TransactionChart";
import TransactionForm from "./components/TransactionForm";
import TransactionStatement from "./components/TransactionStatement";
import type { DialogMessage } from "./types/common";
import { useBackup } from "./hooks/useBackup";
import { useExpenseData } from "./hooks/useExpenseData";
import { useTransactionForm } from "./hooks/useTransactionForm";
import { useTransactionSummary } from "./hooks/useTransactionSummary";

import type { Item } from "./types/transaction";
import {
  getAccessToken,
  removeAccessToken,
  setAccessToken,
  setUnauthorizedHandler,
} from "./utils/api";

import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "/api";

type ExpenseTrackerAppProps = {
  onLogout: () => void;
};

type ModalState = {
  title: string;
  message: string;
  variant: AppModalVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

function ExpenseTrackerApp({
  onLogout,
}: ExpenseTrackerAppProps) {
  const {
    openingBalance,
    setOpeningBalance,
    incomeSources,
    setIncomeSources,
    expenseSources,
    setExpenseSources,
    incomes,
    setIncomes,
    expenses,
    setExpenses,
    monthlyBudgets,
    setMonthlyBudgets,
    apiError,
    saveSettings,
  } = useExpenseData(API_URL);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearchText, setAppliedSearchText] =
    useState("");

  const [selectedMonth, setSelectedMonth] =
    useState("all");

  const [darkMode, setDarkMode] = useState(false);

  const [
    showChangePassword,
    setShowChangePassword,
  ] = useState(false);

  const [modal, setModal] =
    useState<ModalState | null>(null);

  const showMessage = ({
    title,
    message,
    type,
  }: DialogMessage) => {
    setModal({
      title,
      message,
      variant: type,
      confirmLabel: "OK",
      onConfirm: () => setModal(null),
    });
  };

  const confirmAction = (
    title: string,
    message: string,
    confirmLabel = "Continue",
  ) =>
    new Promise<boolean>((resolve) => {
      setModal({
        title,
        message,
        variant: "warning",
        confirmLabel,
        cancelLabel: "Cancel",
        onConfirm: () => {
          setModal(null);
          resolve(true);
        },
        onCancel: () => {
          setModal(null);
          resolve(false);
        },
      });
    });

  const handleLogoutRequest = async () => {
    const confirmed = await confirmAction(
      "Log Out",
      "Are you sure you want to log out?",
      "Log Out",
    );

    if (!confirmed) {
      return;
    }

    onLogout();
  };

  const saveSources = (
    nextIncomeSources: string[],
    nextExpenseSources: string[],
  ) => {
    return saveSettings({
      openingBalance,
      incomeSources: nextIncomeSources,
      expenseSources: nextExpenseSources,
      monthlyBudgets,
    });
  };

  const {
    transactionType,
    transactionText,
    transactionAmount,
    transactionDate,
    newSource,
    editId,
    formError,
    sourceOptions,
    setTransactionText,
    setTransactionAmount,
    setTransactionDate,
    setNewSource,
    changeTransactionType,
    resetForm,
    addSource,
    saveTransaction,
    updateTransactionInline,
    deleteTransaction,
  } = useTransactionForm({
    apiUrl: API_URL,
    incomes,
    expenses,
    incomeSources,
    expenseSources,
    setIncomes,
    setExpenses,
    setIncomeSources,
    setExpenseSources,
    saveSources,
  });

  const {
    exportCSV,
    exportJSON,
    importJSON,
  } = useBackup({
    apiUrl: API_URL,
    incomes,
    expenses,
    incomeSources,
    expenseSources,
    openingBalance,
    monthlyBudgets,
    setMonthlyBudgets,
    setIncomes,
    setExpenses,
    setIncomeSources,
    setExpenseSources,
    setOpeningBalance,
    confirmAction,
    showMessage,
  });

  const {
    months,
    selectedOpeningBalance,
    totalIncome,
    totalExpense,
    balance,
    filteredTransactions,
    chartData,
    monthlyReport,
  } = useTransactionSummary({
    incomes,
    expenses,
    openingBalance,
    selectedMonth,
    searchText: appliedSearchText,
  });

  const handleSearch = () => {
    setAppliedSearchText(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setAppliedSearchText("");
  };

  const handleSaveSettings = async () => {
    const saved = await saveSettings({
      openingBalance,
      incomeSources,
      expenseSources,
      monthlyBudgets,
    });

    if (saved) {
      showMessage({
        title: "Settings Saved",
        message: "Your settings were saved.",
        type: "success",
      });
      return;
    }

    showMessage({
      title: "Save Failed",
      message: "Settings could not be saved.",
      type: "error",
    });
  };

  const handleOpeningBalanceBlur = async () => {
    const saved = await saveSettings({
      openingBalance,
      incomeSources,
      expenseSources,
      monthlyBudgets,
    });

    if (!saved) {
      showMessage({
        title: "Save Failed",
        message:
          "Opening balance could not be saved.",
        type: "error",
      });
    }
  };

  const handleDeleteTransaction = async (
    item: Item,
  ) => {
    const confirmed = await confirmAction(
      "Delete Transaction",
      `Delete "${item.text}"? This action cannot be undone.`,
      "Delete",
    );

    if (!confirmed) {
      return;
    }

    const deleted = await deleteTransaction(item);

    if (!deleted) {
      showMessage({
        title: "Delete Failed",
        message:
          "The transaction could not be deleted.",
        type: "error",
      });
    }
  };

  const handlePasswordChangeSuccess = () => {
    setShowChangePassword(false);

    setModal({
      title: "Password Changed",
      message:
        "Your password was changed successfully. Please log in again.",
      variant: "success",
      confirmLabel: "OK",
      onConfirm: () => {
        setModal(null);
        onLogout();
      },
    });
  };

  return (
    <>
      <div
        className={darkMode ? "app dark" : "app"}
      >
        <Header
          darkMode={darkMode}
          onToggleDarkMode={() =>
            setDarkMode(
              (currentMode) => !currentMode,
            )
          }
          onChangePassword={() =>
            setShowChangePassword(true)
          }
          onLogout={() => void handleLogoutRequest()}
        />

        {showChangePassword && (
          <ChangePasswordForm
            apiUrl={API_URL}
            onClose={() =>
              setShowChangePassword(false)
            }
            onSuccess={
              handlePasswordChangeSuccess
            }
          />
        )}

        {apiError && (
          <p className="api-error">
            {apiError}
          </p>
        )}

        <div className="top-controls">
          <OpeningBalanceField
            value={openingBalance}
            onChange={setOpeningBalance}
            onBlur={() =>
              void handleOpeningBalanceBlur()
            }
          />

          <select
            value={selectedMonth}
            onChange={(event) =>
              setSelectedMonth(
                event.target.value,
              )
            }
          >
            <option value="all">
              All Months
            </option>

            {months.map((month) => (
              <option
                key={month}
                value={month}
              >
                {month}
              </option>
            ))}
          </select>

          <div className="search-controls">
            <input
              type="text"
              placeholder={`Search ${
                selectedMonth === "all"
                  ? "all"
                  : selectedMonth
              } transactions by source...`}
              value={searchInput}
              onChange={(event) =>
                setSearchInput(
                  event.target.value,
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
            />

            <div className="search-buttons">
              <button
                type="button"
                onClick={handleSearch}
              >
                Search
              </button>

              <button
                type="button"
                onClick={handleClearSearch}
              >
                Clear
              </button>
            </div>
          </div>

          <button
            type="button"
            className="save-settings-button"
            onClick={() =>
              void handleSaveSettings()
            }
          >
            Save Settings
          </button>
        </div>

        <div className="summary-area">
          <SummaryCard
            title="Carried Opening Balance"
            amount={selectedOpeningBalance}
          />

          <SummaryCard
            title="Total Income"
            amount={totalIncome}
            className="income"
          />

          <SummaryCard
            title="Total Expense"
            amount={totalExpense}
            className="expense"
          />

          <SummaryCard
            title="Closing Balance"
            amount={balance}
            className="balance"
          />
        </div>

        <MonthlyBudget
          expenses={expenses}
          selectedMonth={selectedMonth}
          monthlyBudgets={monthlyBudgets}
          setMonthlyBudgets={
            setMonthlyBudgets
          }
        />

        <ActionButtons
          onExportCSV={exportCSV}
          onBackupJSON={exportJSON}
          onImportJSON={importJSON}
        />

        <TransactionForm
          type={transactionType}
          date={transactionDate}
          source={transactionText}
          amount={transactionAmount}
          newSource={newSource}
          sourceOptions={sourceOptions}
          isEditing={editId !== null}
          formError={formError}
          onTypeChange={
            changeTransactionType
          }
          onDateChange={
            setTransactionDate
          }
          onSourceChange={
            setTransactionText
          }
          onAmountChange={
            setTransactionAmount
          }
          onNewSourceChange={setNewSource}
          onAddSource={() =>
            void addSource()
          }
          onSubmit={() =>
            void saveTransaction()
          }
          onCancel={resetForm}
        />

        <TransactionStatement
          items={filteredTransactions}
          report={monthlyReport}
          onSave={updateTransactionInline}
          onDelete={(item) =>
            void handleDeleteTransaction(item)
          }
        />

        <TransactionChart
          data={chartData}
        />
      </div>

      {modal && (
        <div
          className={darkMode ? "dark" : ""}
        >
          <AppModal
            title={modal.title}
            message={modal.message}
            variant={modal.variant}
            confirmLabel={modal.confirmLabel}
            cancelLabel={modal.cancelLabel}
            onConfirm={modal.onConfirm}
            onCancel={modal.onCancel}
          />
        </div>
      )}
    </>
  );
}

function App() {
  const params = new URLSearchParams(
    window.location.hash.slice(1),
  );

  const resetToken = params.get("token");

  const [isAuthenticated, setIsAuthenticated] =
    useState(() => Boolean(getAccessToken()));

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setIsAuthenticated(false);
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  const handleLogin = (accessToken: string) => {
    setAccessToken(accessToken);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    removeAccessToken();
    setIsAuthenticated(false);
  };

  const handleResetSuccess = () => {
    window.history.replaceState(
      {},
      "",
      "/",
    );

    handleLogout();
  };

  if (
    window.location.pathname ===
      "/reset-password" &&
    resetToken
  ) {
    return (
      <ResetPasswordForm
        apiUrl={API_URL}
        resetToken={resetToken}
        onSuccess={handleResetSuccess}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthForm
        apiUrl={API_URL}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <ExpenseTrackerApp
      onLogout={handleLogout}
    />
  );
}

export default App;