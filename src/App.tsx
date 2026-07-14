import MonthlyBudget from "./components/MonthlyBudget";
import Header from "./components/Header";
import SummaryCard from "./components/SummaryCard";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

type TransactionType = "income" | "expense";

type Item = {
  id: string;
  text: string;
  amount: number;
  date: string;
  type: TransactionType;
};

const createId = () => crypto.randomUUID();

const fixOldData = (items: any[], type: TransactionType): Item[] => {
  return items.map((item) => ({
    id: item.id || createId(),
    text: item.text,
    amount: Number(item.amount),
    date: item.date?.includes("T") ? item.date : new Date().toISOString(),
    type,
  }));
};

function App() {
  const [transactionType, setTransactionType] =
    useState<TransactionType>("income");
  const [transactionText, setTransactionText] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [newSource, setNewSource] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [darkMode, setDarkMode] = useState(false);

  const importInputRef = useRef<HTMLInputElement | null>(null);

  const [openingBalance, setOpeningBalance] = useState<number>(() => {
    return Number(localStorage.getItem("openingBalance")) || 0;
  });

  const [incomeSources, setIncomeSources] = useState<string[]>(() => {
    const saved = localStorage.getItem("incomeSources");
    return saved ? JSON.parse(saved) : ["Salary", "Bonus", "Other"];
  });

  const [expenseSources, setExpenseSources] = useState<string[]>(() => {
    const saved = localStorage.getItem("expenseSources");
    return saved
      ? JSON.parse(saved)
      : ["Food", "Rent", "Transport", "Other"];
  });

  const [incomes, setIncomes] = useState<Item[]>(() => {
    const saved = localStorage.getItem("incomes");
    return saved ? fixOldData(JSON.parse(saved), "income") : [];
  });

  const [expenses, setExpenses] = useState<Item[]>(() => {
    const saved = localStorage.getItem("expenses");
    return saved ? fixOldData(JSON.parse(saved), "expense") : [];
  });

  useEffect(() => {
    localStorage.setItem("incomes", JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("incomeSources", JSON.stringify(incomeSources));
  }, [incomeSources]);

  useEffect(() => {
    localStorage.setItem("expenseSources", JSON.stringify(expenseSources));
  }, [expenseSources]);

  useEffect(() => {
    localStorage.setItem("openingBalance", String(openingBalance));
  }, [openingBalance]);

  const allItems = useMemo(
    () => [...incomes, ...expenses],
    [incomes, expenses]
  );

  const availableSources =
    transactionType === "income" ? incomeSources : expenseSources;

  const sourceOptions =
    transactionText && !availableSources.includes(transactionText)
      ? [transactionText, ...availableSources]
      : availableSources;

  const months = useMemo(() => {
    const monthList = allItems.map((item) => item.date.slice(0, 7));
    return Array.from(new Set(monthList)).sort().reverse();
  }, [allItems]);

  const monthFilteredItems = useMemo(() => {
    if (selectedMonth === "all") return allItems;

    return allItems.filter(
      (item) => item.date.slice(0, 7) === selectedMonth
    );
  }, [allItems, selectedMonth]);

  const monthFilteredIncomes = monthFilteredItems.filter(
    (item) => item.type === "income"
  );

  const monthFilteredExpenses = monthFilteredItems.filter(
    (item) => item.type === "expense"
  );

  const totalIncome = monthFilteredIncomes.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const totalExpense = monthFilteredExpenses.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const balance = openingBalance + totalIncome - totalExpense;

  const filteredTransactions = [...monthFilteredItems]
    .filter((item) =>
      item.text.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const transactionReport = [
    ...incomeSources.map((source) => ({
      type: "income" as const,
      source,
      total: monthFilteredIncomes
        .filter((item) => item.text === source)
        .reduce((sum, item) => sum + item.amount, 0),
    })),
    ...expenseSources.map((source) => ({
      type: "expense" as const,
      source,
      total: monthFilteredExpenses
        .filter((item) => item.text === source)
        .reduce((sum, item) => sum + item.amount, 0),
    })),
  ].filter((item) => item.total > 0);

  const chartData = transactionReport.map((item) => ({
    name: `${item.type === "income" ? "Income" : "Expense"} - ${item.source}`,
    total: item.total,
  }));

  const monthlyReport = allItems.reduce((report, item) => {
    const month = item.date.slice(0, 7);

    if (!report[month]) {
      report[month] = { income: 0, expense: 0 };
    }

    if (item.type === "income") {
      report[month].income += item.amount;
    } else {
      report[month].expense += item.amount;
    }

    return report;
  }, {} as Record<string, { income: number; expense: number }>);

  
  const COLORS = ["#00C49F", "#0088FE", "#FFBB28", "#FF8042", "#FF4560"];

  const resetForm = () => {
    setTransactionText("");
    setTransactionAmount("");
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

  const saveTransaction = () => {
    const text = transactionText.trim();
    const amount = Number(transactionAmount);

    if (text === "" || transactionAmount === "" || amount <= 0) return;

    if (editId) {
      const originalItem = allItems.find((item) => item.id === editId);
      if (!originalItem) return;

      const updatedItem: Item = {
        ...originalItem,
        text,
        amount,
        type: transactionType,
      };

      setIncomes((currentIncomes) => {
        const withoutEditedItem = currentIncomes.filter(
          (item) => item.id !== editId
        );

        return transactionType === "income"
          ? [...withoutEditedItem, updatedItem]
          : withoutEditedItem;
      });

      setExpenses((currentExpenses) => {
        const withoutEditedItem = currentExpenses.filter(
          (item) => item.id !== editId
        );

        return transactionType === "expense"
          ? [...withoutEditedItem, updatedItem]
          : withoutEditedItem;
      });
    } else {
      const newItem: Item = {
        id: createId(),
        text,
        amount,
        date: new Date().toISOString(),
        type: transactionType,
      };

      if (transactionType === "income") {
        setIncomes((currentIncomes) => [...currentIncomes, newItem]);
      } else {
        setExpenses((currentExpenses) => [...currentExpenses, newItem]);
      }
    }

    resetForm();
  };

  const editTransaction = (item: Item) => {
    setTransactionType(item.type);
    setTransactionText(item.text);
    setTransactionAmount(String(item.amount));
    setEditId(item.id);
  };

  const deleteTransaction = (item: Item) => {
    if (item.type === "income") {
      setIncomes((currentIncomes) =>
        currentIncomes.filter((income) => income.id !== item.id)
      );
    } else {
      setExpenses((currentExpenses) =>
        currentExpenses.filter((expense) => expense.id !== item.id)
      );
    }

    if (editId === item.id) {
      resetForm();
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

        setIncomes(fixOldData(data.incomes || [], "income"));
        setExpenses(fixOldData(data.expenses || [], "expense"));
        setIncomeSources(data.incomeSources || []);
        setExpenseSources(data.expenseSources || []);
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
        <input
          type="number"
          value={openingBalance}
          onChange={(event) =>
            setOpeningBalance(Number(event.target.value))
          }
          placeholder="Opening Balance"
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
      <MonthlyBudget
        expenses={expenses}
         selectedMonth={selectedMonth}
/>
      <div className="backup-buttons">
        <button onClick={exportCSV}>CSV Export</button>
        <button onClick={exportJSON}>JSON Backup</button>
        <button onClick={() => importInputRef.current?.click()}>
          JSON Import
        </button>

        <input
          ref={importInputRef}
          type="file"
          accept=".json"
          onChange={importJSON}
          style={{ display: "none" }}
        />
      </div>

      <div className="source-area compact-area single-transaction-area">
        <div className="transaction-form-card">
          <h2>{editId ? "Edit Transaction" : "Add Transaction"}</h2>

          <label>Transaction Type</label>
          <select
            value={transactionType}
            onChange={(event) => {
              setTransactionType(event.target.value as TransactionType);
              setTransactionText("");
            }}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <label>Add New Source</label>
          <div className="source-input-row">
            <input
              type="text"
              value={newSource}
              onChange={(event) => setNewSource(event.target.value)}
              placeholder={
                transactionType === "income"
                  ? "Add income source"
                  : "Add expense source"
              }
            />
            <button type="button" onClick={addSource}>
              Add Source
            </button>
          </div>

          <label>Source</label>
          <select
            value={transactionText}
            onChange={(event) => setTransactionText(event.target.value)}
          >
            <option value="">Select source</option>
            {sourceOptions.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>

          <label>Amount</label>
          <input
            type="number"
            min="0"
            value={transactionAmount}
            onChange={(event) => setTransactionAmount(event.target.value)}
            placeholder="Amount"
          />

          <div className="transaction-form-actions">
            <button type="button" onClick={saveTransaction}>
              {editId ? "Update Transaction" : "Add Transaction"}
            </button>

            {editId && (
              <button type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      

      <div className="chart-area single-chart-area">
        <div className="chart-box">
          <h2>Income & Expense Pie Chart</h2>

          {chartData.length === 0 ? (
            <p>No chart data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="total"
                  nameKey="name"
                  outerRadius={110}
                  label
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      

      <div className="history-area single-history-area">
  <div className="history-box">
    <h2>Income & Expense Statement</h2>

    <div className="monthly-summary-inside">
      <h3>📅 Monthly Report</h3>

      {Object.entries(monthlyReport)
        .sort(([firstMonth], [secondMonth]) =>
          secondMonth.localeCompare(firstMonth)
        )
        .map(([month, data]) => (
          <div key={month} className="monthly-summary-row">
            <strong>{month}</strong>

            <span className="income-amount">
              Income: ¥{data.income.toLocaleString()}
            </span>

            <span className="expense-amount">
              Expense: ¥{data.expense.toLocaleString()}
            </span>

            <span>
              Balance: ¥{(data.income - data.expense).toLocaleString()}
            </span>
          </div>
        ))}
    </div>

    <div className="statement-table">
      <div className="statement-row statement-header">
        <span>Date</span>
        <span>Type</span>
        <span>Source</span>
        <span>Amount</span>
        <span>Action</span>
      </div>

      {filteredTransactions.length === 0 ? (
        <p className="empty-message">No transactions found.</p>
      ) : (
        filteredTransactions.map((item) => (
          <div
            key={item.id}
            className={`statement-row ${
              item.type === "income"
                ? "income-statement"
                : "expense-statement"
            }`}
          >
            <span>{item.date.slice(0, 10)}</span>

            <span className={`type-badge ${item.type}`}>
              {item.type === "income" ? "Income" : "Expense"}
            </span>

            <strong>{item.text}</strong>

            <span
              className={
                item.type === "income"
                  ? "income-amount"
                  : "expense-amount"
              }
            >
              {item.type === "income" ? "+" : "-"}¥
              {item.amount.toLocaleString()}
            </span>

            <div className="action-buttons">
              <button onClick={() => editTransaction(item)}>✏️</button>
              <button onClick={() => deleteTransaction(item)}>×</button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
</div>
    </div>
  );
}
export default App;
