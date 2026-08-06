import { apiFetch } from "../utils/api";
import { useCallback, useEffect, useState } from "react";
import type {
  Item,
  TransactionType,
} from "../types/transaction";

const DEFAULT_INCOME_SOURCES = [
  "Salary",
  "Bonus",
  "Other",
];

const DEFAULT_EXPENSE_SOURCES = [
  "Food",
  "Rent",
  "Transport",
  "Other",
];

const SETTINGS_STORAGE_KEY =
  "expense-tracker-settings";

export type MonthlyBudgets = Record<string, number>;

export type SettingsPayload = {
  openingBalance: number;
  incomeSources: string[];
  expenseSources: string[];
  monthlyBudgets: MonthlyBudgets;
};

type SettingsData = {
  openingBalance?: unknown;
  incomeSources?: unknown;
  expenseSources?: unknown;
  monthlyBudgets?: unknown;
};

const isRecord = (
  value: unknown,
): value is Record<string, unknown> => {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
};

const normalizeApiTransactions = (
  data: unknown,
  type: TransactionType,
): Item[] => {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.flatMap((value) => {
    if (!isRecord(value)) {
      return [];
    }

    const id = value.id;
    const text = value.text;
    const amount = Number(value.amount);
    const date = value.date;

    if (
      (typeof id !== "string" &&
        typeof id !== "number") ||
      typeof text !== "string" ||
      !Number.isFinite(amount) ||
      typeof date !== "string"
    ) {
      return [];
    }

    return [
      {
        id: String(id),
        text,
        amount,
        date,
        type,
      },
    ];
  });
};

const normalizeSources = (
  value: unknown,
  fallback: string[],
): string[] => {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const sources = value.filter(
    (source): source is string =>
      typeof source === "string",
  );

  return sources.length > 0 ? sources : fallback;
};

const normalizeMonthlyBudgets = (
  value: unknown,
): MonthlyBudgets => {
  if (!isRecord(value)) {
    return {};
  }

  return Object.entries(value).reduce<MonthlyBudgets>(
    (budgets, [month, amount]) => {
      const numericAmount = Number(amount);

      if (
        /^\d{4}-\d{2}$/.test(month) &&
        Number.isFinite(numericAmount) &&
        numericAmount >= 0
      ) {
        budgets[month] = numericAmount;
      }

      return budgets;
    },
    {},
  );
};

const normalizeSettings = (
  settingsData: SettingsData,
): SettingsPayload => {
  return {
    openingBalance:
      Number(settingsData.openingBalance) || 0,

    incomeSources: normalizeSources(
      settingsData.incomeSources,
      DEFAULT_INCOME_SOURCES,
    ),

    expenseSources: normalizeSources(
      settingsData.expenseSources,
      DEFAULT_EXPENSE_SOURCES,
    ),

    monthlyBudgets: normalizeMonthlyBudgets(
      settingsData.monthlyBudgets,
    ),
  };
};

const loadStoredSettings =
  (): SettingsPayload | null => {
    try {
      const storedSettings = localStorage.getItem(
        SETTINGS_STORAGE_KEY,
      );

      if (!storedSettings) {
        return null;
      }

      const parsedSettings: unknown =
        JSON.parse(storedSettings);

      if (!isRecord(parsedSettings)) {
        return null;
      }

      return normalizeSettings(parsedSettings);
    } catch (error) {
      console.error(
        "Browser settings load failed:",
        error,
      );

      return null;
    }
  };

const storeSettings = (
  settings: SettingsPayload,
) => {
  localStorage.setItem(
    SETTINGS_STORAGE_KEY,
    JSON.stringify(settings),
  );
};

export const useExpenseData = (apiUrl: string) => {
  const [openingBalance, setOpeningBalance] =
    useState(0);

  const [incomeSources, setIncomeSources] =
    useState<string[]>(DEFAULT_INCOME_SOURCES);

  const [expenseSources, setExpenseSources] =
    useState<string[]>(DEFAULT_EXPENSE_SOURCES);

  const [monthlyBudgets, setMonthlyBudgets] =
    useState<MonthlyBudgets>({});

  const [incomes, setIncomes] =
    useState<Item[]>([]);

  const [expenses, setExpenses] =
    useState<Item[]>([]);

  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const applySettings = (
      settings: SettingsPayload,
    ) => {
      setOpeningBalance(settings.openingBalance);
      setIncomeSources(settings.incomeSources);
      setExpenseSources(settings.expenseSources);
      setMonthlyBudgets(settings.monthlyBudgets);
    };

    const loadData = async () => {
      const errorMessages: string[] = [];

      try {
        const [
          incomeResponse,
          expenseResponse,
        ] = await Promise.all([
          apiFetch(`${apiUrl}/income`),
          apiFetch(`${apiUrl}/expense`),
        ]);

        if (
          !incomeResponse.ok ||
          !expenseResponse.ok
        ) {
          throw new Error(
            "Failed to load transactions",
          );
        }

        const incomeData: unknown =
          await incomeResponse.json();

        const expenseData: unknown =
          await expenseResponse.json();

        setIncomes(
          normalizeApiTransactions(
            incomeData,
            "income",
          ),
        );

        setExpenses(
          normalizeApiTransactions(
            expenseData,
            "expense",
          ),
        );
      } catch (error) {
        console.error(
          "Transaction data load failed:",
          error,
        );

        errorMessages.push(
          "Transaction data could not be loaded.",
        );
      }

      const storedSettings =
        loadStoredSettings();

      if (storedSettings) {
        applySettings(storedSettings);
      }

      try {
        const settingsResponse = await apiFetch(
          `${apiUrl}/settings`,
        );

        if (!settingsResponse.ok) {
          throw new Error(
            `Settings request failed: ${settingsResponse.status}`,
          );
        }

        const settingsData =
          (await settingsResponse.json()) as SettingsData;

        const normalizedSettings =
          normalizeSettings(settingsData);

        applySettings(normalizedSettings);
        storeSettings(normalizedSettings);
      } catch (error) {
        console.error(
          "Settings data load failed:",
          error,
        );

        errorMessages.push(
          "Settings API is unavailable. Browser settings are being used.",
        );
      }

      setApiError(errorMessages.join(" "));
    };

    void loadData();
  }, [apiUrl]);

  const saveSettings = useCallback(
    async (settings: SettingsPayload) => {
      try {
        storeSettings(settings);
      } catch (error) {
        console.error(
          "Browser settings save failed:",
          error,
        );

        setApiError(
          "Settings could not be saved in this browser.",
        );

        return false;
      }

      try {
        const response = await apiFetch(
          `${apiUrl}/settings`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(settings),
          },
        );

        if (!response.ok) {
          throw new Error(
            `Settings save failed: ${response.status}`,
          );
        }

        setApiError("");
        return true;
      } catch (error) {
        console.error(
          "Settings server sync failed:",
          error,
        );

        setApiError(
          "Settings were saved in this browser, but could not be synced with the server.",
        );

        return true;
      }
    },
    [apiUrl],
  );

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
    saveSettings,
  };
};