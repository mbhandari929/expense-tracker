import type {
  ChangeEvent,
  Dispatch,
  SetStateAction,
} from "react";
import type {
  DialogMessage,
  MonthlyBudgets,
} from "../types/common";
import type { Item } from "../types/transaction";
import { apiFetch } from "../utils/api";
import { isRecord } from "../utils/typeGuards";


type BackupTransaction = {
  text: string;
  amount: number;
  date: string;
};

type UseBackupProps = {
  apiUrl: string;
  incomes: Item[];
  expenses: Item[];
  incomeSources: string[];
  expenseSources: string[];
  openingBalance: number;
  monthlyBudgets: MonthlyBudgets;

  setMonthlyBudgets: Dispatch<
    SetStateAction<MonthlyBudgets>
  >;
  setIncomes: Dispatch<SetStateAction<Item[]>>;
  setExpenses: Dispatch<SetStateAction<Item[]>>;
  setIncomeSources: Dispatch<
    SetStateAction<string[]>
  >;
  setExpenseSources: Dispatch<
    SetStateAction<string[]>
  >;
  setOpeningBalance: Dispatch<
    SetStateAction<number>
  >;

  confirmAction: (
    title: string,
    message: string,
  ) => Promise<boolean>;

  showMessage: (message: DialogMessage) => void;
};

type RestoredTransaction = {
  id: number | string;
  text: string;
  amount: number;
  date: string;
};

type RestoreResponse = {
  message: string;
  incomes: RestoredTransaction[];
  expenses: RestoredTransaction[];
  settings: {
    openingBalance: number;
    incomeSources: string[];
    expenseSources: string[];
    monthlyBudgets: MonthlyBudgets;
  };
};

const normalizeDate = (
  value: unknown,
): string => {
  if (typeof value !== "string") {
    return "";
  }

  const date = value.slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return "";
  }

  const [year, month, day] = date
    .split("-")
    .map(Number);

  const parsedDate = new Date(
    Date.UTC(year, month - 1, day),
  );

  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return "";
  }

  return date;
};

const normalizeSources = (
  value: unknown,
): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
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
};

const mergeSources = (
  existingSources: string[],
  transactions: BackupTransaction[],
): string[] => {
  const transactionSources =
    transactions.map((item) => item.text);

  return Array.from(
    new Set([
      ...existingSources,
      ...transactionSources,
    ]),
  );
};

const normalizeBackupTransactions = (
  value: unknown,
): BackupTransaction[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const text =
      typeof item.text === "string"
        ? item.text.trim()
        : "";

    const amount = Number(item.amount);
    const date = normalizeDate(item.date);

    if (
      !text ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !date
    ) {
      return [];
    }

    return [
      {
        text,
        amount,
        date,
      },
    ];
  });
};

export const useBackup = ({
  apiUrl,
  incomes,
  expenses,
  incomeSources,
  expenseSources,
  openingBalance,
  monthlyBudgets,
  setMonthlyBudgets,
  setIncomes,
  setExpenses,
  setIncomeSources,
  setExpenseSources,
  setOpeningBalance,
  confirmAction,
  showMessage,
}: UseBackupProps) => {
  const allItems = [...incomes, ...expenses];

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

    const csv = rows
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "expense-tracker.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const backupData = {
      incomes,
      expenses,
      incomeSources,
      expenseSources,
      openingBalance,
      monthlyBudgets,
    };

    const blob = new Blob(
      [JSON.stringify(backupData, null, 2)],
      {
        type: "application/json",
      },
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download =
      "expense-tracker-backup.json";
    link.click();

    URL.revokeObjectURL(url);
  };

  const importJSON = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const data: unknown = JSON.parse(
          String(reader.result),
        );

        if (!isRecord(data)) {
          throw new Error(
            "Invalid backup data",
          );
        }

        const normalizedIncomes =
          normalizeBackupTransactions(
            data.incomes,
          );

        const normalizedExpenses =
          normalizeBackupTransactions(
            data.expenses,
          );

        const restoredIncomeSources =
          normalizeSources(
            data.incomeSources,
          );

        const restoredExpenseSources =
          normalizeSources(
            data.expenseSources,
          );

        const mergedIncomeSources =
          mergeSources(
            restoredIncomeSources,
            normalizedIncomes,
          );

        const mergedExpenseSources =
          mergeSources(
            restoredExpenseSources,
            normalizedExpenses,
          );

        const restoredMonthlyBudgets =
          isRecord(data.monthlyBudgets)
            ? (data.monthlyBudgets as MonthlyBudgets)
            : {};

        const rawOpeningBalance = Number(
          data.openingBalance,
        );

        const restoredOpeningBalance =
          Number.isFinite(rawOpeningBalance)
            ? rawOpeningBalance
            : 0;

        const shouldReplace =
          await confirmAction(
            "Restore Backup",
            "This will replace all existing transactions and settings with the selected backup. This action cannot be undone.",
          );

        if (!shouldReplace) {
          return;
        }

        const response = await apiFetch(
          `${apiUrl}/backup/restore`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              incomes:
                normalizedIncomes,
              expenses:
                normalizedExpenses,
              openingBalance:
                restoredOpeningBalance,
              incomeSources:
                mergedIncomeSources,
              expenseSources:
                mergedExpenseSources,
              monthlyBudgets:
                restoredMonthlyBudgets,
            }),
          },
        );

        if (!response.ok) {
          throw new Error(
            `Backup restore failed: ${response.status}`,
          );
        }

        const restoredData =
          (await response.json()) as RestoreResponse;

        const restoredIncomes: Item[] =
          restoredData.incomes.map(
            (item) => ({
              id: String(item.id),
              text: item.text.trim(),
              amount: Number(item.amount),
              date:
                normalizeDate(item.date),
              type: "income",
            }),
          );

        const restoredExpenses: Item[] =
          restoredData.expenses.map(
            (item) => ({
              id: String(item.id),
              text: item.text.trim(),
              amount: Number(item.amount),
              date:
                normalizeDate(item.date),
              type: "expense",
            }),
          );

        const finalIncomeSources =
          mergeSources(
            normalizeSources(
              restoredData.settings
                .incomeSources,
            ),
            restoredIncomes,
          );

        const finalExpenseSources =
          mergeSources(
            normalizeSources(
              restoredData.settings
                .expenseSources,
            ),
            restoredExpenses,
          );

        setIncomes(restoredIncomes);
        setExpenses(restoredExpenses);

        setOpeningBalance(
          Number(
            restoredData.settings
              .openingBalance,
          ) || 0,
        );

        setIncomeSources(
          finalIncomeSources,
        );

        setExpenseSources(
          finalExpenseSources,
        );

        setMonthlyBudgets(
          restoredData.settings
            .monthlyBudgets || {},
        );

        showMessage({
          title: "Backup Restored",
          message:
            "Your backup was restored successfully.",
          type: "success",
        });
      } catch (error) {
        console.error(
          "Backup import failed:",
          error,
        );

        showMessage({
          title:
            "Backup Restore Failed",
          message:
            "The backup could not be restored. Please check the selected file and try again.",
          type: "error",
        });
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  return {
    exportCSV,
    exportJSON,
    importJSON,
  };
};