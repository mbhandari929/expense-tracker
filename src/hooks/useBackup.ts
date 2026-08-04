import type {
  ChangeEvent,
  Dispatch,
  SetStateAction,
} from "react";
import type { Item } from "../types/transaction";
import { fixOldData } from "../utils/storage";

type MonthlyBudgets = Record<string, number>;

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
    link.download = "expense-tracker-backup.json";
    link.click();

    URL.revokeObjectURL(url);
  };

  const importJSON = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const confirmed = window.confirm(
      "Importing this backup will replace all current transactions and settings. Continue?",
    );

    if (!confirmed) {
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const data: unknown = JSON.parse(
          String(reader.result),
        );

        if (
          typeof data !== "object" ||
          data === null ||
          Array.isArray(data)
        ) {
          throw new Error("Invalid backup data");
        }

        const backup = data as Record<string, unknown>;

        const importedIncomes = Array.isArray(
          backup.incomes,
        )
          ? backup.incomes
          : [];

        const importedExpenses = Array.isArray(
          backup.expenses,
        )
          ? backup.expenses
          : [];

        const normalizedIncomes = fixOldData(
          importedIncomes,
          "income",
        );

        const normalizedExpenses = fixOldData(
          importedExpenses,
          "expense",
        );

        const restoredIncomeSources = Array.isArray(
          backup.incomeSources,
        )
          ? backup.incomeSources.filter(
              (source): source is string =>
                typeof source === "string",
            )
          : [];

        const restoredExpenseSources = Array.isArray(
          backup.expenseSources,
        )
          ? backup.expenseSources.filter(
              (source): source is string =>
                typeof source === "string",
            )
          : [];

        const restoredMonthlyBudgets =
          typeof backup.monthlyBudgets === "object" &&
          backup.monthlyBudgets !== null &&
          !Array.isArray(backup.monthlyBudgets)
            ? (backup.monthlyBudgets as MonthlyBudgets)
            : {};

        const response = await fetch(
          `${apiUrl}/backup/restore`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              incomes: normalizedIncomes.map((item) => ({
                text: item.text,
                amount: Number(item.amount),
                date: item.date.slice(0, 10),
              })),
              expenses: normalizedExpenses.map((item) => ({
                text: item.text,
                amount: Number(item.amount),
                date: item.date.slice(0, 10),
              })),
              openingBalance:
                Number(backup.openingBalance) || 0,
              incomeSources: restoredIncomeSources,
              expenseSources: restoredExpenseSources,
              monthlyBudgets: restoredMonthlyBudgets,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Backup restore failed");
        }

        const restoredData =
          (await response.json()) as RestoreResponse;

        setIncomes(
          restoredData.incomes.map((item) => ({
            id: String(item.id),
            text: item.text,
            amount: Number(item.amount),
            date: item.date,
            type: "income",
          })),
        );

        setExpenses(
          restoredData.expenses.map((item) => ({
            id: String(item.id),
            text: item.text,
            amount: Number(item.amount),
            date: item.date,
            type: "expense",
          })),
        );

        setOpeningBalance(
          Number(
            restoredData.settings.openingBalance,
          ) || 0,
        );

        setIncomeSources(
          restoredData.settings.incomeSources,
        );

        setExpenseSources(
          restoredData.settings.expenseSources,
        );

        setMonthlyBudgets(
          restoredData.settings.monthlyBudgets || {},
        );

        alert("Backup restored successfully!");
      } catch (error) {
        console.error("Backup import failed:", error);

        alert(
          "Backup import failed. Please reload and check your data.",
        );
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