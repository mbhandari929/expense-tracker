import MonthlyBudget from "./components/MonthlyBudget";
import Header from "./components/Header";
import SummaryCard from "./components/SummaryCard";
import { useEffect, useState } from "react";
import TransactionForm from "./components/TransactionForm";
import OpeningBalanceField from "./components/OpeningBalanceField";
import TransactionChart from "./components/TransactionChart";
import TransactionStatement from "./components/TransactionStatement";
import ActionButtons from "./components/ActionButtons";
import { fixOldData, } from "./utils/storage";
import { useExpenseData } from "./hooks/useExpenseData";
import { useTransactionSummary } from "./hooks/useTransactionSummary";
import { useTransactionForm } from "./hooks/useTransactionForm";
import { useBackup } from "./hooks/useBackup";
import "./App.css";

const API_URL = "http://localhost:3000";

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
  } = useExpenseData();
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
  editTransaction,
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
  incomes,
  expenses,
  incomeSources,
  expenseSources,
  openingBalance,
  setIncomes,
  setExpenses,
  setIncomeSources,
  setExpenseSources,
  setOpeningBalance,
});
  const [searchText, setSearchText] = useState("");
  const getCurrentMonth = () => {
    const today = new Date();

    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0",
    )}`;
  };
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const [incomeResponse, expenseResponse] = await Promise.all([
          fetch(`${API_URL}/income`),
          fetch(`${API_URL}/expense`),
        ]);

        if (!incomeResponse.ok || !expenseResponse.ok) {
          throw new Error("Failed to load transactions");
        }

        const incomeData: unknown = await incomeResponse.json();
        const expenseData: unknown = await expenseResponse.json();

        setIncomes(
          fixOldData(Array.isArray(incomeData) ? incomeData : [], "income"),
        );

        setExpenses(
          fixOldData(Array.isArray(expenseData) ? expenseData : [], "expense"),
        );
      } catch (error) {
        console.error("Backend data load failed:", error);
      }
    };

    void loadTransactions();
  }, [setIncomes, setExpenses]);
 const {
  months,
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
  searchText,
});
 

 
  return (
    <div className={darkMode ? "app dark" : "app"}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="top-controls">
        <OpeningBalanceField
          value={openingBalance}
          onChange={setOpeningBalance}
        />
        <select
          value={selectedMonth}
          onChange={(event) => setSelectedMonth(event.target.value)}
        >
          <option value="all">All Months</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search source..."
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
      </div>

      <div className="summary-area">
        <SummaryCard title="Opening Balance" amount={openingBalance} />
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
        <SummaryCard title="Balance" amount={balance} className="balance" />
      </div>
      <MonthlyBudget expenses={expenses} selectedMonth={selectedMonth} />
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
        onEdit={editTransaction}
        onDelete={deleteTransaction}
      />
      <TransactionChart data={chartData} />
    </div>
  );
}
export default App;
