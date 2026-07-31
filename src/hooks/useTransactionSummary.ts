import { useMemo } from "react";
import type { Item } from "../types/transaction";

type UseTransactionSummaryProps = {
  incomes: Item[];
  expenses: Item[];
  incomeSources: string[];
  expenseSources: string[];
  openingBalance: number;
  selectedMonth: string;
  searchText: string;
};

type MonthlyReportData = {
  income: number;
  expense: number;
  balance: number;
};

export const useTransactionSummary = ({
  incomes,
  expenses,
  incomeSources,
  expenseSources,
  openingBalance,
  selectedMonth,
  searchText,
}: UseTransactionSummaryProps) => {
  const allItems = useMemo(
    () => [...incomes, ...expenses],
    [incomes, expenses],
  );

  const months = useMemo(() => {
    const monthList = allItems.map((item) => item.date.slice(0, 7));

    return Array.from(new Set(monthList)).sort().reverse();
  }, [allItems]);

  const monthFilteredItems = useMemo(() => {
    if (selectedMonth === "all") {
      return allItems;
    }

    return allItems.filter(
      (item) => item.date.slice(0, 7) === selectedMonth,
    );
  }, [allItems, selectedMonth]);

  const monthFilteredIncomes = useMemo(
    () => monthFilteredItems.filter((item) => item.type === "income"),
    [monthFilteredItems],
  );

  const monthFilteredExpenses = useMemo(
    () => monthFilteredItems.filter((item) => item.type === "expense"),
    [monthFilteredItems],
  );

  const totalIncome = useMemo(
    () =>
      monthFilteredIncomes.reduce(
        (sum, item) => sum + item.amount,
        0,
      ),
    [monthFilteredIncomes],
  );

  const totalExpense = useMemo(
    () =>
      monthFilteredExpenses.reduce(
        (sum, item) => sum + item.amount,
        0,
      ),
    [monthFilteredExpenses],
  );

  const selectedOpeningBalance = useMemo(() => {
    if (selectedMonth === "all") {
      return openingBalance;
    }

    const previousTransactionsBalance = allItems
      .filter((item) => item.date.slice(0, 7) < selectedMonth)
      .reduce((total, item) => {
        if (item.type === "income") {
          return total + item.amount;
        }

        return total - item.amount;
      }, 0);

    return openingBalance + previousTransactionsBalance;
  }, [allItems, openingBalance, selectedMonth]);

  const balance =
    selectedOpeningBalance + totalIncome - totalExpense;

  const filteredTransactions = useMemo(
    () =>
      [...monthFilteredItems]
        .filter((item) =>
          item.text
            .toLowerCase()
            .includes(searchText.toLowerCase()),
        )
        .sort((a, b) => b.date.localeCompare(a.date)),
    [monthFilteredItems, searchText],
  );

  const chartData = useMemo(() => {
    const transactionReport = [
      ...incomeSources.map((source) => ({
        type: "income" as const,
        source,
        total: monthFilteredIncomes
          .filter((item) => item.text === source)
          .reduce((sum, item) => sum + item.amount, 0),
      })),

      ...expenseSources.map((source) => ({
        type: "expense" as const,
        source,
        total: monthFilteredExpenses
          .filter((item) => item.text === source)
          .reduce((sum, item) => sum + item.amount, 0),
      })),
    ].filter((item) => item.total > 0);

    return transactionReport.map((item) => ({
      name: `${
        item.type === "income" ? "Income" : "Expense"
      } - ${item.source}`,
      total: item.total,
    }));
  }, [
    incomeSources,
    expenseSources,
    monthFilteredIncomes,
    monthFilteredExpenses,
  ]);

  const monthlyReport = useMemo(() => {
  const monthlyTotals = allItems.reduce<
    Record<string, { income: number; expense: number }>
  >((report, item) => {
    const month = item.date.slice(0, 7);

    if (!report[month]) {
      report[month] = {
        income: 0,
        expense: 0,
      };
    }

    if (item.type === "income") {
      report[month].income += item.amount;
    } else {
      report[month].expense += item.amount;
    }

    return report;
  }, {});

  const sortedMonths = Object.keys(monthlyTotals).sort();

  return sortedMonths.reduce<{
    report: Record<string, MonthlyReportData>;
    carriedBalance: number;
  }>(
    (result, month) => {
      const { income, expense } = monthlyTotals[month];

      const closingBalance =
        result.carriedBalance + income - expense;

      return {
        carriedBalance: closingBalance,
        report: {
          ...result.report,
          [month]: {
            income,
            expense,
            balance: closingBalance,
          },
        },
      };
    },
    {
      report: {},
      carriedBalance: openingBalance,
    },
  ).report;
}, [allItems, openingBalance]);
  return {
    allItems,
    months,
    monthFilteredItems,
    selectedOpeningBalance,
    totalIncome,
    totalExpense,
    balance,
    filteredTransactions,
    chartData,
    monthlyReport,
  };
};