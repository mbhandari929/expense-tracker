import { useEffect, useMemo, useState } from "react";

type Expense = {
  amount: number;
  date: string;
};

type MonthlyBudgetProps = {
  expenses: Expense[];
  selectedMonth: string;
};

type MonthlyBudgets = Record<string, number>;

const formatCurrency = (amount: number) => {
  return `¥${amount.toLocaleString("en-US")}`;
};
function MonthlyBudget({
  expenses,
  selectedMonth,
}: MonthlyBudgetProps) {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const activeMonth =
    selectedMonth === "all" ? currentMonth : selectedMonth;

  const [monthlyBudgets, setMonthlyBudgets] =
    useState<MonthlyBudgets>(() => {
      try {
        const saved = localStorage.getItem("monthlyBudgets");

        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    });

  useEffect(() => {
    localStorage.setItem(
      "monthlyBudgets",
      JSON.stringify(monthlyBudgets)
    );
  }, [monthlyBudgets]);

  const monthlyExpense = useMemo(() => {
    return expenses
      .filter(
        (item) => item.date.slice(0, 7) === activeMonth
      )
      .reduce(
        (sum, item) => sum + item.amount,
        0
      );
  }, [expenses, activeMonth]);

  const monthlyLimit =
    monthlyBudgets[activeMonth] || 0;

  const remainingBudget =
    monthlyLimit - monthlyExpense;

  const usedPercentage =
    monthlyLimit > 0
      ? Math.min(
          (monthlyExpense / monthlyLimit) * 100,
          100
        )
      : 0;

  const budgetExceeded =
    monthlyLimit > 0 &&
    monthlyExpense > monthlyLimit;

  const changeMonthlyLimit = (value: string) => {
    const newLimit = Number(value);

    setMonthlyBudgets((previousBudgets) => ({
      ...previousBudgets,
      [activeMonth]:
        newLimit >= 0 ? newLimit : 0,
    }));
  };

  return (
    <div
      className={`monthly-budget-card ${
        budgetExceeded
          ? "budget-exceeded"
          : ""
      }`}
    >
      <div className="monthly-budget-header">
        <div>
          <h2>Monthly Expense Limit</h2>
          <p>Month: {activeMonth}</p>
        </div>

        <div className="monthly-limit-input">
          <span>¥</span>

          <input
            type="number"
            min="0"
            value={monthlyLimit || ""}
            placeholder="Enter monthly limit"
            onChange={(event) =>
              changeMonthlyLimit(
                event.target.value
              )
            }
          />
        </div>
      </div>

      <div className="budget-details">
        <div>
          <small>Expense</small>

          <strong>
            {formatCurrency(monthlyExpense)}
          </strong>
        </div>

        <div>
          <small>Limit</small>

          <strong>
            {formatCurrency(monthlyLimit)}
          </strong>
        </div>

        <div>
          <small>
            {budgetExceeded
              ? "Over Budget"
              : "Remaining"}
          </small>

          <strong>
            {formatCurrency(
              Math.abs(remainingBudget)
            )}
          </strong>
        </div>
      </div>

      {monthlyLimit > 0 ? (
        <>
          <div className="budget-progress">
            <div
              className="budget-progress-bar"
              style={{
                width: `${usedPercentage}%`,
              }}
            />
          </div>

          <p className="budget-message">
            {budgetExceeded
              ? `⚠️ Budget exceeded by ${formatCurrency(
                  Math.abs(
                    remainingBudget
                  )
                )}`
              : `${usedPercentage.toFixed(
                  1
                )}% of the budget used`}
          </p>
        </>
      ) : (
        <p className="budget-message">
          Enter your expense limit for{" "}
          {activeMonth}.
        </p>
      )}
    </div>
  );
}

export default MonthlyBudget;