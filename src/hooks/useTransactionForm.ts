import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Item, TransactionType } from "../types/transaction";
const getTodayLocalDate = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
type UseTransactionFormProps = {
  apiUrl: string;
  incomes: Item[];
  expenses: Item[];
  incomeSources: string[];
  expenseSources: string[];
  setIncomes: Dispatch<SetStateAction<Item[]>>;
  setExpenses: Dispatch<SetStateAction<Item[]>>;
  setIncomeSources: Dispatch<SetStateAction<string[]>>;
  setExpenseSources: Dispatch<SetStateAction<string[]>>;
};

export const useTransactionForm = ({
  apiUrl,
  incomes,
  expenses,
  incomeSources,
  expenseSources,
  setIncomes,
  setExpenses,
  setIncomeSources,
  setExpenseSources,
}: UseTransactionFormProps) => {
  const [transactionType, setTransactionType] =
    useState<TransactionType>("income");
  const [transactionText, setTransactionText] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionDate, setTransactionDate] =
  useState(getTodayLocalDate);
  const [newSource, setNewSource] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const allItems = [...incomes, ...expenses];

  const availableSources =
    transactionType === "income" ? incomeSources : expenseSources;

  const sourceOptions =
    transactionText && !availableSources.includes(transactionText)
      ? [transactionText, ...availableSources]
      : availableSources;

  const resetForm = () => {
    setTransactionText("");
    setTransactionAmount("");
    setTransactionDate(getTodayLocalDate());
    setNewSource("");
    setEditId(null);
  };

  const changeTransactionType = (type: TransactionType) => {
    setTransactionType(type);
    setTransactionText("");
    setNewSource("");
  };

  const addSource = () => {
    const source = newSource.trim();

    if (source === "") return;

    if (transactionType === "income") {
      if (!incomeSources.includes(source)) {
        setIncomeSources((currentSources) => [
          ...currentSources,
          source,
        ]);
      }
    } else if (!expenseSources.includes(source)) {
      setExpenseSources((currentSources) => [
        ...currentSources,
        source,
      ]);
    }

    setTransactionText(source);
    setNewSource("");
  };

  const saveTransaction = async () => {
    const text = transactionText.trim();
    const amount = Number(transactionAmount);

    if (text === "" || transactionAmount === "" || amount <= 0) {
      return;
    }

    if (editId) {
      const originalItem = allItems.find((item) => item.id === editId);

      if (!originalItem) return;

      try {
        const response = await fetch(
          `${apiUrl}/${originalItem.type}/${editId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text,
              amount,
              date: transactionDate,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to update transaction");
        }

        const updatedItem: Item = {
          ...originalItem,
          text,
          amount,
          date: transactionDate,
        };

        if (originalItem.type === "income") {
          setIncomes((currentIncomes) =>
            currentIncomes.map((item) =>
              item.id === editId ? updatedItem : item,
            ),
          );
        } else {
          setExpenses((currentExpenses) =>
            currentExpenses.map((item) =>
              item.id === editId ? updatedItem : item,
            ),
          );
        }
      } catch (error) {
        console.error("Transaction update failed:", error);
        alert("Transaction could not be updated.");
        return;
      }
    } else {
      try {
        const response = await fetch(`${apiUrl}/${transactionType}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            amount,
            date: transactionDate,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save transaction");
        }

        const savedData: {
          id: number | string;
          text: string;
          amount: number;
          date: string;
        } = await response.json();

        const newItem: Item = {
          id: String(savedData.id),
          text: savedData.text,
          amount: Number(savedData.amount),
          date: savedData.date,
          type: transactionType,
        };

        if (transactionType === "income") {
          setIncomes((currentIncomes) => [
            ...currentIncomes,
            newItem,
          ]);
        } else {
          setExpenses((currentExpenses) => [
            ...currentExpenses,
            newItem,
          ]);
        }
      } catch (error) {
        console.error("Transaction save failed:", error);
        alert("Transaction could not be saved.");
        return;
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

  const updateTransactionInline = async (
    updatedItem: Item,
  ): Promise<boolean> => {
  try {
    const response = await fetch(
      `${apiUrl}/${updatedItem.type}/${updatedItem.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: updatedItem.text,
          amount: updatedItem.amount,
          date: updatedItem.date,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Transaction update failed: ${response.status}`,
      );
    }

    if (updatedItem.type === "income") {
      setIncomes((currentIncomes) =>
        currentIncomes.map((income) =>
          income.id === updatedItem.id
            ? updatedItem
            : income,
        ),
      );
    } else {
      setExpenses((currentExpenses) =>
        currentExpenses.map((expense) =>
          expense.id === updatedItem.id
            ? updatedItem
            : expense,
        ),
      );
    }

    return true;
  } catch (error) {
    console.error(
      "Inline transaction update failed:",
      error,
    );

    return false;
  }
};

  const deleteTransaction = async (item: Item) => {
    const shouldDelete = window.confirm(
      `Delete "${item.text}" transaction?`,
    );

    if (!shouldDelete) return;

    try {
      const response = await fetch(
        `${apiUrl}/${item.type}/${item.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }

      if (item.type === "income") {
        setIncomes((currentIncomes) =>
          currentIncomes.filter((income) => income.id !== item.id),
        );
      } else {
        setExpenses((currentExpenses) =>
          currentExpenses.filter((expense) => expense.id !== item.id),
        );
      }

      if (editId === item.id) {
        resetForm();
      }
    } catch (error) {
      console.error("Transaction delete failed:", error);
      alert("Transaction could not be deleted.");
    }
  };

  return {
    transactionType,
    transactionText,
    transactionAmount,
    transactionDate,
    newSource,
    editId,
    sourceOptions,
    setTransactionText,
    setTransactionAmount,
    setTransactionDate,
    setNewSource,
    changeTransactionType,
    resetForm,
    updateTransactionInline,
    addSource,
    saveTransaction,
    editTransaction,
    deleteTransaction,
  };
};