import MonthlyBudget from "./components/MonthlyBudget";
import Header from "./components/Header";
import SummaryCard from "./components/SummaryCard";
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import TransactionForm from "./components/TransactionForm";
import OpeningBalanceField from "./components/OpeningBalanceField";
import TransactionChart from "./components/TransactionChart";
import TransactionStatement from "./components/TransactionStatement";
import ActionButtons from "./components/ActionButtons";
import type { Item, TransactionType } from "./types/transaction";
import { fixOldData, } from "./utils/storage";
import { useExpenseData } from "./hooks/useExpenseData";
import { useTransactionSummary } from "./hooks/useTransactionSummary";
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
  const [transactionType, setTransactionType] =
    useState<TransactionType>("income");
  const [transactionText, setTransactionText] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [newSource, setNewSource] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

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
  allItems,
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
 

  const availableSources =
    transactionType === "income" ? incomeSources : expenseSources;

  const sourceOptions =
    transactionText && !availableSources.includes(transactionText)
      ? [transactionText, ...availableSources]
      : availableSources;

  


  
  
  
    
   
 
  const resetForm = () => {
    setTransactionText("");
    setTransactionAmount("");
    setTransactionDate(new Date().toISOString().slice(0, 10));
    setNewSource("");
    setEditId(null);
  };

  const addSource = () => {
    const source = newSource.trim();

    if (source === "") return;

    if (transactionType === "income") {
      if (!incomeSources.includes(source)) {
        setIncomeSources([...incomeSources, source]);
      }
    } else if (!expenseSources.includes(source)) {
      setExpenseSources([...expenseSources, source]);
    }

    setTransactionText(source);
    setNewSource("");
  };

  const saveTransaction = async () => {
    const text = transactionText.trim();
    const amount = Number(transactionAmount);

    if (text === "" || transactionAmount === "" || amount <= 0) return;

    if (editId) {
      const originalItem = allItems.find((item) => item.id === editId);
      if (!originalItem) return;

      try {
        const response = await fetch(
          `${API_URL}/${originalItem.type}/${editId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text,
              amount,
              date: transactionDate,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to update transaction");
        }

        const updatedItem: Item = {
          ...originalItem,
          text,
          amount,
          date: transactionDate,
        };

        if (originalItem.type === "income") {
          setIncomes((currentIncomes) =>
            currentIncomes.map((item) =>
              item.id === editId ? updatedItem : item,
            ),
          );
        } else {
          setExpenses((currentExpenses) =>
            currentExpenses.map((item) =>
              item.id === editId ? updatedItem : item,
            ),
          );
        }
      } catch (error) {
        console.error("Transaction update failed:", error);
        alert("Transaction could not be updated.");
        return;
      }
    } else {
      try {
        const response = await fetch(`${API_URL}/${transactionType}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            amount,
            date: transactionDate,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save transaction");
        }

        const savedData: {
          id: number | string;
          text: string;
          amount: number;
          date: string;
        } = await response.json();

        const newItem: Item = {
          id: String(savedData.id),
          text: savedData.text,
          amount: Number(savedData.amount),
          date: savedData.date,
          type: transactionType,
        };

        if (transactionType === "income") {
          setIncomes((currentIncomes) => [...currentIncomes, newItem]);
        } else {
          setExpenses((currentExpenses) => [...currentExpenses, newItem]);
        }
      } catch (error) {
        console.error("Transaction save failed:", error);
        alert("Transaction could not be saved.");
        return;
      }
    }

    resetForm();
  };

  const editTransaction = (item: Item) => {
    setTransactionType(item.type);
    setTransactionText(item.text);
    setTransactionAmount(String(item.amount));
    setTransactionDate(item.date);
    setEditId(item.id);
  };

  const deleteTransaction = async (item: Item) => {
    const shouldDelete = window.confirm(`Delete "${item.text}" transaction?`);

    if (!shouldDelete) return;

    try {
      const response = await fetch(`${API_URL}/${item.type}/${item.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }

      if (item.type === "income") {
        setIncomes((currentIncomes) =>
          currentIncomes.filter((income) => income.id !== item.id),
        );
      } else {
        setExpenses((currentExpenses) =>
          currentExpenses.filter((expense) => expense.id !== item.id),
        );
      }

      if (editId === item.id) {
        resetForm();
      }
    } catch (error) {
      console.error("Transaction delete failed:", error);
      alert("Transaction could not be deleted.");
    }
  };

  const exportCSV = () => {
    const rows = [
      ["Type", "Source", "Amount", "Date"],
      ...allItems.map((item) => [
        item.type,
        item.text,
        item.amount,
        item.date.slice(0, 10),
      ]),
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "expense-tracker.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const backupData = {
      incomes,
      expenses,
      incomeSources,
      expenseSources,
      openingBalance,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "expense-tracker-backup.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  const importJSON = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));

        const incomes = Array.isArray(data.incomes) ? data.incomes : [];
        const expenses = Array.isArray(data.expenses) ? data.expenses : [];

        setIncomes(fixOldData(incomes, "income"));
        setExpenses(fixOldData(expenses, "expense"));

        setIncomeSources(
          Array.isArray(data.incomeSources) ? data.incomeSources : [],
        );

        setExpenseSources(
          Array.isArray(data.expenseSources) ? data.expenseSources : [],
        );
        setOpeningBalance(Number(data.openingBalance) || 0);

        alert("Backup imported successfully!");
      } catch {
        alert("Invalid backup file!");
      }
    };

    reader.readAsText(file);
  };

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
        onTypeChange={(type: TransactionType) => {
          setTransactionType(type);
          setTransactionText("");
          setNewSource("");
        }}
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
