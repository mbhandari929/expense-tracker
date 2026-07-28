import MonthlyBudget from "./components/MonthlyBudget";
import Header from "./components/Header";
import SummaryCard from "./components/SummaryCard";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import TransactionForm from "./components/TransactionForm";
import OpeningBalanceField from "./components/OpeningBalanceField";
import TransactionChart from "./components/TransactionChart";
import TransactionStatement from "./components/TransactionStatement";
import ActionButtons from "./components/ActionButtons";
// Recharts imports removed (not used in this file). TransactionChart component handles chart rendering.
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

const isRecord = (
  value: unknown
): value is Record<string, unknown> => {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
};

const fixOldData = (
  items: unknown[],
  type: TransactionType
): Item[] => {
  return items
    .filter(isRecord)
    .map((item) => {
      const amount = Number(item.amount);

      return {
        id:
          typeof item.id === "string" && item.id
            ? item.id
            : createId(),

        text:
          typeof item.text === "string"
            ? item.text
            : "",

        amount: Number.isFinite(amount) ? amount : 0,

        date:
          typeof item.date === "string" && item.date
            ? item.date
            : new Date().toISOString().slice(0, 10),

        type,
      };
    });
};
function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);

    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function App() {
  const [transactionType, setTransactionType] =
    useState<TransactionType>("income");
  const [transactionText, setTransactionText] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [newSource, setNewSource] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const getCurrentMonth = () => {
    const today = new Date();

    return `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}`;
  };
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [darkMode, setDarkMode] = useState(false);

  const [openingBalance, setOpeningBalance] = useState<number>(() => {
    const savedOpeningBalance = loadJson<string | null>("openingBalance", null);
    return savedOpeningBalance ? Number(savedOpeningBalance) : 0;
  });
  useEffect(() => {
    localStorage.setItem("openingBalance", String(openingBalance));
  }, [openingBalance]);

  const [incomeSources, setIncomeSources] = useState<string[]>(() =>
    loadJson("incomeSources", ["Salary", "Bonus", "Other"])
  );

  const [expenseSources, setExpenseSources] = useState<string[]>(() =>
    loadJson("expenseSources", [
      "Food",
      "Rent",
      "Transport",
      "Other",
    ])
  );

  const [incomes, setIncomes] = useState<Item[]>(() =>
    fixOldData(
      loadJson<unknown[]>("incomes", []),
      "income"
    )
  );

  const [expenses, setExpenses] = useState<Item[]>(() =>
    fixOldData(
      loadJson<unknown[]>("expenses", []),
      "expense"
    )
  );
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
    if (selectedMonth === "all") {
      return allItems;
    }

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

  const saveTransaction = () => {
    const text = transactionText.trim();
    const amount = Number(transactionAmount);

    if (text === "" || transactionAmount === "" || amount <= 0) return;

    if (editId) {
      const originalItem = allItems.find((item) => item.id === editId);
      if (!originalItem) return;

      const updatedItem: Item = {

        ...originalItem,
        date: transactionDate,
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
        date: transactionDate,
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
    setTransactionDate(item.date);
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
const monthlyReport = useMemo(() => {
  return allItems.reduce<
    Record<string, { income: number; expense: number; balance: number }>
  >((report, item) => {
    const month = item.date.slice(0, 7);

    if (!report[month]) {
      report[month] = {
        income: 0,
        expense: 0,
        balance: 0,
      };
    }

    if (item.type === "income") {
      report[month].income += item.amount;
    } else {
      report[month].expense += item.amount;
    }

    report[month].balance =
      report[month].income - report[month].expense;

    return report;
  }, {});
}, [allItems]);

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
      <MonthlyBudget
        expenses={expenses}
        selectedMonth={selectedMonth}
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
