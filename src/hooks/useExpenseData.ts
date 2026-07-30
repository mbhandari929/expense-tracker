import { useEffect, useState } from "react";
import type { Item } from "../types/transaction";
import { fixOldData, loadJson } from "../utils/storage";

const DEFAULT_INCOME_SOURCES = ["Salary", "Bonus", "Other"];

const DEFAULT_EXPENSE_SOURCES = [
  "Food",
  "Rent",
  "Transport",
  "Other",
];

export const useExpenseData = (apiUrl: string) => {
  const [openingBalance, setOpeningBalance] = useState(() =>
    loadJson<number>("openingBalance", 0),
  );

  const [incomeSources, setIncomeSources] = useState<string[]>(() =>
    loadJson<string[]>("incomeSources", DEFAULT_INCOME_SOURCES),
  );

  const [expenseSources, setExpenseSources] = useState<string[]>(() =>
    loadJson<string[]>("expenseSources", DEFAULT_EXPENSE_SOURCES),
  );

  const [incomes, setIncomes] = useState<Item[]>(() =>
    fixOldData(loadJson<unknown[]>("incomes", []), "income"),
  );

  const [expenses, setExpenses] = useState<Item[]>(() =>
    fixOldData(loadJson<unknown[]>("expenses", []), "expense"),
  );

  useEffect(() => {
    localStorage.setItem(
      "openingBalance",
      JSON.stringify(openingBalance),
    );
  }, [openingBalance]);

  useEffect(() => {
    localStorage.setItem("incomeSources", JSON.stringify(incomeSources));
  }, [incomeSources]);

  useEffect(() => {
    localStorage.setItem(
      "expenseSources",
      JSON.stringify(expenseSources),
    );
  }, [expenseSources]);

  useEffect(() => {
    localStorage.setItem("incomes", JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const [incomeResponse, expenseResponse] = await Promise.all([
          fetch(`${apiUrl}/income`),
          fetch(`${apiUrl}/expense`),
        ]);

        if (!incomeResponse.ok || !expenseResponse.ok) {
          throw new Error("Failed to load transactions");
        }

        const incomeData: unknown = await incomeResponse.json();
        const expenseData: unknown = await expenseResponse.json();

        setIncomes(
          fixOldData(
            Array.isArray(incomeData) ? incomeData : [],
            "income",
          ),
        );

        setExpenses(
          fixOldData(
            Array.isArray(expenseData) ? expenseData : [],
            "expense",
          ),
        );
      } catch (error) {
        console.error("Backend data load failed:", error);
      }
    };

    void loadTransactions();
  }, [apiUrl]);
  return {
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
  };
};