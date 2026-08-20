import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  Item,
  TransactionType,
} from "../types/transaction";

import type {
  MonthlyBudgets,
} from "../types/common";

import type { ApiFetcher } from "../utils/api";
import { isRecord } from "../utils/typeGuards";

export type {
  MonthlyBudgets,
} from "../types/common";

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
        date: date.slice(0, 10),
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

  const sources = Array.from(
    new Set(
      value
        .filter(
          (source): source is string =>
            typeof source === "string",
        )
        .map((source) => source.trim())
        .filter(Boolean),
    ),
  );

  return sources.length > 0
    ? sources
    : fallback;
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
  settings: SettingsData,
): SettingsPayload => ({
  openingBalance:
    Number(settings.openingBalance) || 0,

  incomeSources: normalizeSources(
    settings.incomeSources,
    DEFAULT_INCOME_SOURCES,
  ),

  expenseSources: normalizeSources(
    settings.expenseSources,
    DEFAULT_EXPENSE_SOURCES,
  ),

  monthlyBudgets: normalizeMonthlyBudgets(
    settings.monthlyBudgets,
  ),
});

const isAbortError = (
  error: unknown,
): boolean =>
  error instanceof DOMException &&
  error.name === "AbortError";

export const useExpenseData = (
  apiUrl: string,
  apiFetch: ApiFetcher,
) => {
  const [
    openingBalance,
    setOpeningBalance,
  ] = useState(0);

  const [
    incomeSources,
    setIncomeSources,
  ] = useState<string[]>(
    DEFAULT_INCOME_SOURCES,
  );

  const [
    expenseSources,
    setExpenseSources,
  ] = useState<string[]>(
    DEFAULT_EXPENSE_SOURCES,
  );

  const [
    monthlyBudgets,
    setMonthlyBudgets,
  ] = useState<MonthlyBudgets>({});

  const [incomes, setIncomes] =
    useState<Item[]>([]);

  const [expenses, setExpenses] =
    useState<Item[]>([]);

  const [apiError, setApiError] =
    useState("");

  useEffect(() => {
    // In React StrictMode development, the first mount cleanup
    // intentionally aborts its in-flight requests before remount.
    // Production is unaffected, and aborting prevents stale updates.
    const controller =
      new AbortController();

    const applySettings = (
      settings: SettingsPayload,
    ) => {
      setOpeningBalance(
        settings.openingBalance,
      );

      setIncomeSources(
        settings.incomeSources,
      );

      setExpenseSources(
        settings.expenseSources,
      );

      setMonthlyBudgets(
        settings.monthlyBudgets,
      );
    };

    const loadData = async () => {
      const errorMessages: string[] = [];

      try {
        const [
          incomeResponse,
          expenseResponse,
        ] = await Promise.all([
          apiFetch(
            `${apiUrl}/income`,
            {
              signal: controller.signal,
            },
          ),

          apiFetch(
            `${apiUrl}/expense`,
            {
              signal: controller.signal,
            },
          ),
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

        if (controller.signal.aborted) {
          return;
        }

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
        if (isAbortError(error)) {
          return;
        }

        console.error(
          "Transaction data load failed:",
          error,
        );

        errorMessages.push(
          "Transaction data could not be loaded.",
        );
      }

      if (controller.signal.aborted) {
        return;
      }

      try {
        const settingsResponse =
          await apiFetch(
            `${apiUrl}/settings`,
            {
              signal:
                controller.signal,
            },
          );

        if (!settingsResponse.ok) {
          throw new Error(
            `Settings request failed: ${settingsResponse.status}`,
          );
        }

        const settingsData =
          (await settingsResponse.json()) as SettingsData;

        if (controller.signal.aborted) {
          return;
        }

        const normalizedSettings =
          normalizeSettings(
            settingsData,
          );

        applySettings(
          normalizedSettings,
        );
      } catch (error) {
        if (isAbortError(error)) {
          return;
        }

        console.error(
          "Settings data load failed:",
          error,
        );

        errorMessages.push(
          "Settings data could not be loaded from the server.",
        );
      }

      if (!controller.signal.aborted) {
        setApiError(
          errorMessages.join(" "),
        );
      }
    };

    void loadData();

    return () => {
      controller.abort();
    };
  }, [apiUrl, apiFetch]);

  const saveSettings = useCallback(
    async (
      settings: SettingsPayload,
    ): Promise<boolean> => {
      try {
        const response =
          await apiFetch(
            `${apiUrl}/settings`,
            {
              method: "PATCH",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify(
                settings,
              ),
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
          "Settings could not be saved to the server.",
        );

        return false;
      }
    },
    [apiUrl, apiFetch],
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