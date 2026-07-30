import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import type { Item } from "../types/transaction";
import { fixOldData } from "../utils/storage";

type UseBackupProps = {
  incomes: Item[];
  expenses: Item[];
  incomeSources: string[];
  expenseSources: string[];
  openingBalance: number;
  setIncomes: Dispatch<SetStateAction<Item[]>>;
  setExpenses: Dispatch<SetStateAction<Item[]>>;
  setIncomeSources: Dispatch<SetStateAction<string[]>>;
  setExpenseSources: Dispatch<SetStateAction<string[]>>;
  setOpeningBalance: Dispatch<SetStateAction<number>>;
};

export const useBackup = ({
  incomes,
  expenses,
  incomeSources,
  expenseSources,
  openingBalance,
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

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
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
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "expense-tracker-backup.json";
    link.click();

    URL.revokeObjectURL(url);
  };

  const importJSON = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data: unknown = JSON.parse(String(reader.result));

        if (
          typeof data !== "object" ||
          data === null ||
          Array.isArray(data)
        ) {
          throw new Error("Invalid backup data");
        }

        const backup = data as Record<string, unknown>;

        const importedIncomes = Array.isArray(backup.incomes)
          ? backup.incomes
          : [];

        const importedExpenses = Array.isArray(backup.expenses)
          ? backup.expenses
          : [];

        setIncomes(fixOldData(importedIncomes, "income"));
        setExpenses(fixOldData(importedExpenses, "expense"));

        setIncomeSources(
          Array.isArray(backup.incomeSources)
            ? backup.incomeSources.filter(
                (source): source is string =>
                  typeof source === "string",
              )
            : [],
        );

        setExpenseSources(
          Array.isArray(backup.expenseSources)
            ? backup.expenseSources.filter(
                (source): source is string =>
                  typeof source === "string",
              )
            : [],
        );

        setOpeningBalance(Number(backup.openingBalance) || 0);

        alert("Backup imported successfully!");
      } catch {
        alert("Invalid backup file!");
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