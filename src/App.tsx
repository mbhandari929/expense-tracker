
import { useEffect, useMemo, useRef, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./App.css";
import Header from "./components/Header";
type Item = {
  id: string;
  text: string;
  amount: number;
  date: string;
  type: "income" | "expense";
};

const createId = () => crypto.randomUUID();

const fixOldData = (items: any[], type: "income" | "expense"): Item[] => {
  return items.map((item) => ({
    id: item.id || createId(),
    text: item.text,
    amount: Number(item.amount),
    date: item.date?.includes("T") ? item.date : new Date().toISOString(),
    type,
  }));
};

function App() {
  const [incomeText, setIncomeText] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");
 
  const [expenseText, setExpenseText] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  const [newIncomeSource, setNewIncomeSource] = useState("");
  const [newExpenseSource, setNewExpenseSource] = useState("");

  const [searchText, setSearchText] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [darkMode, setDarkMode] = useState(false);

  const [editIncomeId, setEditIncomeId] = useState<string | null>(null);
  const [editExpenseId, setEditExpenseId] = useState<string | null>(null);

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
    return saved ? JSON.parse(saved) : ["Food", "Rent", "Transport", "Other"];
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

  const allItems = [...incomes, ...expenses];

  const months = useMemo(() => {
    const monthList = allItems.map((item) => item.date.slice(0, 7));
    return Array.from(new Set(monthList)).sort().reverse();
  }, [allItems]);

  const monthFilteredItems =
    selectedMonth === "all"
      ? allItems
      : allItems.filter((item) => item.date.slice(0, 7) === selectedMonth);

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

  const filteredIncomes = monthFilteredIncomes.filter((item) =>
    item.text.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredExpenses = monthFilteredExpenses.filter((item) =>
    item.text.toLowerCase().includes(searchText.toLowerCase())
  );

  const incomeReport = incomeSources.map((source) => ({
    source,
    total: monthFilteredIncomes
      .filter((item) => item.text === source)
      .reduce((sum, item) => sum + item.amount, 0),
  }));

  const expenseReport = expenseSources.map((source) => ({
    source,
    total: monthFilteredExpenses
      .filter((item) => item.text === source)
      .reduce((sum, item) => sum + item.amount, 0),
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

  const recentItems = [...allItems]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const COLORS = ["#00C49F", "#0088FE", "#FFBB28", "#FF8042", "#FF4560"];

  const addIncomeSource = () => {
    const source = newIncomeSource.trim();
    if (source === "") return;
    if (!incomeSources.includes(source)) {
      setIncomeSources([...incomeSources, source]);
    }
    setNewIncomeSource("");
  };

  const addExpenseSource = () => {
    const source = newExpenseSource.trim();
    if (source === "") return;
    if (!expenseSources.includes(source)) {
      setExpenseSources([...expenseSources, source]);
    }
    setNewExpenseSource("");
  };

  const addIncome = () => {
    if (incomeText === "" || incomeAmount === "") return;

    if (editIncomeId) {
      setIncomes(
        incomes.map((item) =>
          item.id === editIncomeId
            ? { ...item, text: incomeText, amount: Number(incomeAmount) }
            : item
        )
      );
      setEditIncomeId(null);
    } else {
      setIncomes([
        ...incomes,
        {
          id: createId(),
          text: incomeText,
          amount: Number(incomeAmount),
          date: new Date().toISOString(),
          type: "income",
        },
      ]);
    }

    setIncomeText("");
    setIncomeAmount("");
  };

  const addExpense = () => {
    if (expenseText === "" || expenseAmount === "") return;

    if (editExpenseId) {
      setExpenses(
        expenses.map((item) =>
          item.id === editExpenseId
            ? { ...item, text: expenseText, amount: Number(expenseAmount) }
            : item
        )
      );
      setEditExpenseId(null);
    } else {
      setExpenses([
        ...expenses,
        {
          id: createId(),
          text: expenseText,
          amount: Number(expenseAmount),
          date: new Date().toISOString(),
          type: "expense",
        },
      ]);
    }

    setExpenseText("");
    setExpenseAmount("");
  };

  const editIncome = (id: string) => {
    const item = incomes.find((income) => income.id === id);
    if (!item) return;

    setIncomeText(item.text);
    setIncomeAmount(String(item.amount));
    setEditIncomeId(id);
  };

  const editExpense = (id: string) => {
    const item = expenses.find((expense) => expense.id === id);
    if (!item) return;

    setExpenseText(item.text);
    setExpenseAmount(String(item.amount));
    setEditExpenseId(id);
  };

  const deleteIncome = (id: string) => {
    setIncomes(incomes.filter((item) => item.id !== id));
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter((item) => item.id !== id));
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

  const importJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
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
          onChange={(e) => setOpeningBalance(Number(e.target.value))}
          placeholder="Opening Balance"
        />

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
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
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div className="summary-area">
        <div className="summary-card">
          <h3>Opening Balance</h3>
          <p>¥{openingBalance}</p>
        </div>

        <div className="summary-card income">
          <h3>Total Income</h3>
          <p>¥{totalIncome}</p>
        </div>

        <div className="summary-card expense">
          <h3>Total Expense</h3>
          <p>¥{totalExpense}</p>
        </div>

        <div className="summary-card balance">
          <h3>Balance</h3>
          <p>¥{balance}</p>
        </div>
      </div>

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

      <div className="source-area">
        <div className="source-box">
          <h2>Income Source</h2>
          <input
            value={newIncomeSource}
            onChange={(e) => setNewIncomeSource(e.target.value)}
            placeholder="Add income source"
          />
          <button onClick={addIncomeSource}>Add Source</button>
        </div>

        <div className="source-box">
          <h2>Expense Source</h2>
          <input
            value={newExpenseSource}
            onChange={(e) => setNewExpenseSource(e.target.value)}
            placeholder="Add expense source"
          />
          <button onClick={addExpenseSource}>Add Source</button>
        </div>
      </div>

      <div className="form-area">
        <div className="form-box income-form">
          <h2>{editIncomeId ? "Edit Income" : "Add Income"}</h2>

          <select
            value={incomeText}
            onChange={(e) => setIncomeText(e.target.value)}
          >
            <option value="">Select income source</option>
            {incomeSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={incomeAmount}
            onChange={(e) => setIncomeAmount(e.target.value)}
            placeholder="Income amount"
          />

          <button onClick={addIncome}>
            {editIncomeId ? "Update Income" : "Add Income"}
          </button>
        </div>

        <div className="form-box expense-form">
          <h2>{editExpenseId ? "Edit Expense" : "Add Expense"}</h2>

          <select
            value={expenseText}
            onChange={(e) => setExpenseText(e.target.value)}
          >
            <option value="">Select expense source</option>
            {expenseSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
            placeholder="Expense amount"
          />

          <button onClick={addExpense}>
            {editExpenseId ? "Update Expense" : "Add Expense"}
          </button>
        </div>
      </div>

      <div className="report-area">
        <div className="report-card">
          <h2>Income Report</h2>
          {incomeReport
            .filter((item) => item.total > 0)
            .map((item) => (
              <div key={item.source} className="report-row">
                <span>{item.source}</span>
                <span>¥{item.total}</span>
              </div>
            ))}
        </div>

        <div className="report-card">
          <h2>Expense Report</h2>
          {expenseReport
            .filter((item) => item.total > 0)
            .map((item) => (
              <div key={item.source} className="report-row">
                <span>{item.source}</span>
                <span>¥{item.total}</span>
              </div>
            ))}
        </div>
      </div>

      <div className="chart-area">
        <div className="chart-box">
          <h2>Income Pie Chart</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={incomeReport.filter((item) => item.total > 0)}
                dataKey="total"
                nameKey="source"
                outerRadius={100}
                label
              >
                {incomeReport.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h2>Expense Pie Chart</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseReport.filter((item) => item.total > 0)}
                dataKey="total"
                nameKey="source"
                outerRadius={100}
                label
              >
                {expenseReport.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="report-card">
        <h2>📅 Monthly Report</h2>

        {Object.entries(monthlyReport).map(([month, data]) => (
          <div key={month} className="report-row">
            <span>{month}</span>
            <span>Income: ¥{data.income}</span>
            <span>Expense: ¥{data.expense}</span>
            <span>Balance: ¥{data.income - data.expense}</span>
          </div>
        ))}
      </div>

      <div className="report-card">
        <h2>Recent 5 Transactions</h2>

        {recentItems.map((item) => (
          <div key={item.id} className="report-row">
            <span>{item.date.slice(0, 10)}</span>
            <span>{item.text}</span>
            <span>{item.type}</span>
            <span>¥{item.amount}</span>
          </div>
        ))}
      </div>

      <div className="history-area">
        <div className="history-box">
          <h2>Income History</h2>

          {filteredIncomes.map((item) => (
            <div key={item.id} className="history-item income-item">
              <div>
                <strong>{item.text}</strong>
                <br />
                <small>{item.date.slice(0, 10)}</small>
              </div>

              <span>¥{item.amount}</span>

              <div className="action-buttons">
                <button onClick={() => editIncome(item.id)}>✏️</button>
                <button onClick={() => deleteIncome(item.id)}>×</button>
              </div>
            </div>
          ))}
        </div>

        <div className="history-box">
          <h2>Expense History</h2>

          {filteredExpenses.map((item) => (
            <div key={item.id} className="history-item expense-item">
              <div>
                <strong>{item.text}</strong>
                <br />
                <small>{item.date.slice(0, 10)}</small>
              </div>

              <span>¥{item.amount}</span>

              <div className="action-buttons">
                <button onClick={() => editExpense(item.id)}>✏️</button>
                <button onClick={() => deleteExpense(item.id)}>×</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;