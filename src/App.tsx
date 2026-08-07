import { useState } from "react";
import ActionButtons from "./components/ActionButtons";
import Header from "./components/Header";
import MonthlyBudget from "./components/MonthlyBudget";
import OpeningBalanceField from "./components/OpeningBalanceField";
import SummaryCard from "./components/SummaryCard";
import TransactionChart from "./components/TransactionChart";
import TransactionForm from "./components/TransactionForm";
import TransactionStatement from "./components/TransactionStatement";
import { useBackup } from "./hooks/useBackup";
import { useExpenseData } from "./hooks/useExpenseData";
import { useTransactionForm } from "./hooks/useTransactionForm";
import { useTransactionSummary } from "./hooks/useTransactionSummary";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const getCurrentMonth = () => {
  const today = new Date();

  return `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}`;
};

function App() {
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

  const {
    transactionType,
    transactionText,
    transactionAmount,
    transactionDate,
    newSource,
    editId,
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
  });

  const { exportCSV, exportJSON, importJSON } = useBackup({
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
  });

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearchText, setAppliedSearchText] =
    useState("");

  const [selectedMonth, setSelectedMonth] =
    useState(getCurrentMonth);

  const [darkMode, setDarkMode] = useState(false);

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
    incomeSources,
    expenseSources,
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
      alert("Settings saved successfully.");
    } else {
      alert("Settings could not be saved.");
    }
  };

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {apiError && (
        <p className="api-error">{apiError}</p>
      )}

      <div className="top-controls">
        <OpeningBalanceField
          value={openingBalance}
          onChange={setOpeningBalance}
        />

        <select
          value={selectedMonth}
          onChange={(event) =>
            setSelectedMonth(event.target.value)
          }
        >
          <option value="all">All Months</option>

          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>

       <div className="search-controls">
  <input
    type="text"
    placeholder={`Search ${
      selectedMonth === "all" ? "all" : selectedMonth
    } transactions by source...`}
    value={searchInput}
    onChange={(event) =>
      setSearchInput(event.target.value)
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
      <button
  type="button"
  className="save-settings-button"
  onClick={handleSaveSettings}
>
  Save Settings
</button>
    </button>
  </div>
</div>
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
        setMonthlyBudgets={setMonthlyBudgets}
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
        onTypeChange={changeTransactionType}
        onDateChange={setTransactionDate}
        onSourceChange={setTransactionText}
        onAmountChange={setTransactionAmount}
        onNewSourceChange={setNewSource}
        onAddSource={addSource}
        onSubmit={saveTransaction}
        onCancel={resetForm}
      />

      <TransactionStatement
        items={filteredTransactions}
        report={monthlyReport}
        onSave={updateTransactionInline}
        onDelete={deleteTransaction}
      />

      <TransactionChart data={chartData} />
    </div>
  );
}

export default App;