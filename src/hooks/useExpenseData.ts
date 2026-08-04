import { useEffect, useState } from "react";
import type { Item } from "../types/transaction";
import { fixOldData } from "../utils/storage";

const DEFAULT_INCOME_SOURCES = ["Salary", "Bonus", "Other"];

const DEFAULT_EXPENSE_SOURCES = [
  "Food",
  "Rent",
  "Transport",
  "Other",
];

export type MonthlyBudgets = Record<string, number>;

type SettingsData = {
  openingBalance?: number;
  incomeSources?: unknown;
  expenseSources?: unknown;
  monthlyBudgets?: unknown;
};

export const useExpenseData = (apiUrl: string) => {
  const [openingBalance, setOpeningBalance] = useState(0);

  const [incomeSources, setIncomeSources] = useState<string[]>(
    DEFAULT_INCOME_SOURCES,
  );

  const [expenseSources, setExpenseSources] = useState<string[]>(
    DEFAULT_EXPENSE_SOURCES,
  );

  const [monthlyBudgets, setMonthlyBudgets] =
    useState<MonthlyBudgets>({});

  const [incomes, setIncomes] = useState<Item[]>([]);
  const [expenses, setExpenses] = useState<Item[]>([]);
  const [apiError, setApiError] = useState("");
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          incomeResponse,
          expenseResponse,
          settingsResponse,
        ] = await Promise.all([
          fetch(`${apiUrl}/income`),
          fetch(`${apiUrl}/expense`),
          fetch(`${apiUrl}/settings`),
        ]);

        if (
          !incomeResponse.ok ||
          !expenseResponse.ok ||
          !settingsResponse.ok
        ) {
          throw new Error("Failed to load application data");
        }

        const incomeData: unknown = await incomeResponse.json();
        const expenseData: unknown = await expenseResponse.json();
        const settingsData =
          (await settingsResponse.json()) as SettingsData;

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

        setOpeningBalance(Number(settingsData.openingBalance) || 0);

        setIncomeSources(
          Array.isArray(settingsData.incomeSources)
            ? settingsData.incomeSources.filter(
                (source): source is string =>
                  typeof source === "string",
              )
            : DEFAULT_INCOME_SOURCES,
        );

        setExpenseSources(
          Array.isArray(settingsData.expenseSources)
            ? settingsData.expenseSources.filter(
                (source): source is string =>
                  typeof source === "string",
              )
            : DEFAULT_EXPENSE_SOURCES,
        );

        setMonthlyBudgets(
          typeof settingsData.monthlyBudgets === "object" &&
            settingsData.monthlyBudgets !== null &&
            !Array.isArray(settingsData.monthlyBudgets)
            ? (settingsData.monthlyBudgets as MonthlyBudgets)
            : {},
        );

        setSettingsLoaded(true);
        setApiError("");
      } catch (error) {
        console.error("Backend data load failed:", error);
        setApiError(
          "API connection failed. Please check the backend server.",
        );
      }
    };

    void loadData();
  }, [apiUrl]);

  useEffect(() => {
    if (!settingsLoaded) return;

    const saveSettings = async () => {
      try {
        const response = await fetch(`${apiUrl}/settings`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            openingBalance,
            incomeSources,
            expenseSources,
            monthlyBudgets,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save settings");
        }

        setApiError("");
      } catch (error) {
        console.error("Settings save failed:", error);
        setApiError(
          "Settings could not be saved. Please check the backend server.",
        );
      }
    };

    void saveSettings();
  }, [
    apiUrl,
    openingBalance,
    incomeSources,
    expenseSources,
    monthlyBudgets,
    settingsLoaded,
  ]);

  return {
    openingBalance,
    setOpeningBalance,
    incomeSources,
    setIncomeSources,
    expenseSources,
    setExpenseSources,
    monthlyBudgets,
    setMonthlyBudgets,
    incomes,
    setIncomes,
    expenses,
    setExpenses,
    apiError,
  };
};