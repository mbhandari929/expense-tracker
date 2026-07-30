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

export const useExpenseData = () => {
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