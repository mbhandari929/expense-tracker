import { useState } from "react";
import type {
  Dispatch,
  SetStateAction,
} from "react";

import type {
  Item,
  TransactionType,
} from "../types/transaction";
import type { ApiFetcher } from "../utils/api";
import { getTodayLocalDate } from "../utils/date";

type UseTransactionFormProps = {
  apiUrl: string;
  apiFetch: ApiFetcher;
  incomes: Item[];
  expenses: Item[];
  incomeSources: string[];
  expenseSources: string[];

  setIncomes: Dispatch<
    SetStateAction<Item[]>
  >;

  setExpenses: Dispatch<
    SetStateAction<Item[]>
  >;

  setIncomeSources: Dispatch<
    SetStateAction<string[]>
  >;

  setExpenseSources: Dispatch<
    SetStateAction<string[]>
  >;

  saveSources: (
    nextIncomeSources: string[],
    nextExpenseSources: string[],
  ) => Promise<boolean>;
};

export const useTransactionForm = ({
  apiUrl,
  apiFetch,
  incomes,
  expenses,
  incomeSources,
  expenseSources,
  setIncomes,
  setExpenses,
  setIncomeSources,
  setExpenseSources,
  saveSources,
}: UseTransactionFormProps) => {
  const [
    transactionType,
    setTransactionType,
  ] = useState<TransactionType>("income");

  const [
    transactionText,
    setTransactionText,
  ] = useState("");

  const [
    transactionAmount,
    setTransactionAmount,
  ] = useState("");

  const [
    transactionDate,
    setTransactionDate,
  ] = useState(getTodayLocalDate);

  const [
    newSource,
    setNewSource,
  ] = useState("");

  const [
    editId,
    setEditId,
  ] = useState<string | null>(null);

  const [
    formError,
    setFormError,
  ] = useState("");

  const allItems = [
    ...incomes,
    ...expenses,
  ];

  const availableSources =
    transactionType === "income"
      ? incomeSources
      : expenseSources;

  const sourceOptions =
    transactionText &&
    !availableSources.includes(
      transactionText,
    )
      ? [
          transactionText,
          ...availableSources,
        ]
      : availableSources;

  const resetForm = () => {
    setTransactionText("");
    setTransactionAmount("");
    setTransactionDate(
      getTodayLocalDate(),
    );
    setNewSource("");
    setEditId(null);
    setFormError("");
  };

  const changeTransactionType = (
    type: TransactionType,
  ) => {
    setTransactionType(type);
    setTransactionText("");
    setNewSource("");
    setEditId(null);
    setFormError("");
  };

  const addSource = async () => {
    const source = newSource.trim();

    if (!source) {
      setFormError(
        "Please enter a source name.",
      );
      return;
    }

    const isIncome =
      transactionType === "income";

    const sourceAlreadyExists =
      isIncome
        ? incomeSources.includes(source)
        : expenseSources.includes(source);

    if (sourceAlreadyExists) {
      setTransactionText(source);
      setNewSource("");
      setFormError("");
      return;
    }

    const nextIncomeSources =
      isIncome
        ? [...incomeSources, source]
        : incomeSources;

    const nextExpenseSources =
      isIncome
        ? expenseSources
        : [...expenseSources, source];

    const saved = await saveSources(
      nextIncomeSources,
      nextExpenseSources,
    );

    if (!saved) {
      setFormError(
        "Source could not be saved.",
      );
      return;
    }

    if (isIncome) {
      setIncomeSources(
        nextIncomeSources,
      );
    } else {
      setExpenseSources(
        nextExpenseSources,
      );
    }

    setTransactionText(source);
    setNewSource("");
    setFormError("");
  };

  const validateTransaction = () => {
    const text =
      transactionText.trim();

    const amount = Number(
      transactionAmount,
    );

    const today =
      getTodayLocalDate();

    if (transactionDate === "") {
      setFormError(
        "Please select a transaction date.",
      );
      return null;
    }

    if (transactionDate > today) {
      setFormError(
        "Future dates are not allowed.",
      );
      return null;
    }

    if (text === "") {
      setFormError(
        "Please select or add a source.",
      );
      return null;
    }

    if (
      transactionAmount === "" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setFormError(
        "Amount must be greater than 0.",
      );
      return null;
    }

    setFormError("");

    return {
      text,
      amount,
      date: transactionDate,
    };
  };

  const saveTransaction =
    async () => {
      const validatedData =
        validateTransaction();

      if (!validatedData) {
        return;
      }

      const {
        text,
        amount,
        date,
      } = validatedData;

      if (editId) {
        const originalItem =
          allItems.find(
            (item) =>
              item.id === editId,
          );

        if (!originalItem) {
          setFormError(
            "Transaction could not be found.",
          );
          return;
        }

        try {
          const response =
            await apiFetch(
              `${apiUrl}/${originalItem.type}/${editId}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  text,
                  amount,
                  date,
                }),
              },
            );

          if (!response.ok) {
            const errorBody =
              await response.text();

            throw new Error(
              `Update failed: ${response.status} ${errorBody}`,
            );
          }

          const updatedItem: Item =
            {
              ...originalItem,
              text,
              amount,
              date,
            };

          if (
            originalItem.type ===
            "income"
          ) {
            setIncomes(
              (currentIncomes) =>
                currentIncomes.map(
                  (item) =>
                    item.id === editId
                      ? updatedItem
                      : item,
                ),
            );
          } else {
            setExpenses(
              (currentExpenses) =>
                currentExpenses.map(
                  (item) =>
                    item.id === editId
                      ? updatedItem
                      : item,
                ),
            );
          }
        } catch (error) {
          console.error(
            "Transaction update failed:",
            error,
          );

          setFormError(
            "Transaction could not be updated.",
          );
          return;
        }
      } else {
        try {
          const response =
            await apiFetch(
              `${apiUrl}/${transactionType}`,
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  text,
                  amount,
                  date,
                }),
              },
            );

          if (!response.ok) {
            const errorBody =
              await response.text();

            throw new Error(
              `Save failed: ${response.status} ${errorBody}`,
            );
          }

          const savedData =
            (await response.json()) as {
              id: number | string;
              text: string;
              amount: number;
              date: string;
            };

          const newItem: Item = {
            id: String(
              savedData.id,
            ),
            text: savedData.text,
            amount: Number(
              savedData.amount,
            ),
            date: savedData.date,
            type: transactionType,
          };

          if (
            transactionType ===
            "income"
          ) {
            setIncomes(
              (currentIncomes) => [
                ...currentIncomes,
                newItem,
              ],
            );
          } else {
            setExpenses(
              (currentExpenses) => [
                ...currentExpenses,
                newItem,
              ],
            );
          }
        } catch (error) {
          console.error(
            "Transaction save failed:",
            error,
          );

          setFormError(
            "Transaction could not be saved.",
          );
          return;
        }
      }

      resetForm();
    };

  const editTransaction = (
    item: Item,
  ) => {
    setTransactionType(item.type);
    setTransactionText(item.text);

    setTransactionAmount(
      String(item.amount),
    );

    setTransactionDate(
      item.date.slice(0, 10),
    );

    setEditId(item.id);
    setFormError("");
  };

  const updateTransactionInline =
    async (
      updatedItem: Item,
    ): Promise<boolean> => {
      try {
        const response =
          await apiFetch(
            `${apiUrl}/${updatedItem.type}/${updatedItem.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                text: updatedItem.text,
                amount:
                  updatedItem.amount,
                date:
                  updatedItem.date.slice(
                    0,
                    10,
                  ),
              }),
            },
          );

        if (!response.ok) {
          const errorBody =
            await response.text();

          throw new Error(
            `Inline update failed: ${response.status} ${errorBody}`,
          );
        }

        if (
          updatedItem.type ===
          "income"
        ) {
          setIncomes(
            (currentIncomes) =>
              currentIncomes.map(
                (income) =>
                  income.id ===
                  updatedItem.id
                    ? updatedItem
                    : income,
              ),
          );
        } else {
          setExpenses(
            (currentExpenses) =>
              currentExpenses.map(
                (expense) =>
                  expense.id ===
                  updatedItem.id
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

 const deleteTransaction = async (item: Item): Promise<boolean> => {
  try {
    const response = await apiFetch(
      `${apiUrl}/${item.type}/${item.id}`,
      { method: "DELETE" },
    );

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.status}`);
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

    return true;
  } catch (error) {
    console.error("Transaction delete failed:", error);
    return false;
  }
};
  return {
    transactionType,
    transactionText,
    transactionAmount,
    transactionDate,
    newSource,
    editId,
    formError,
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