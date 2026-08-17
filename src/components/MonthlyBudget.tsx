import { useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { formatCurrency } from "../utils/currency";
import type { MonthlyBudgets } from "../types/common";
type Expense = {
  amount: number;
  date: string;
};
type MonthlyBudgetProps = {
  expenses: Expense[];
  selectedMonth: string;
  monthlyBudgets: MonthlyBudgets;
  setMonthlyBudgets: Dispatch<SetStateAction<MonthlyBudgets>>;
};

function MonthlyBudget({
  expenses,
  selectedMonth,
  monthlyBudgets,
  setMonthlyBudgets,
}: MonthlyBudgetProps) {
  const today = new Date();

  const currentMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}`;

  const activeMonth =
    selectedMonth === "all" ? currentMonth : selectedMonth;

  const monthlyExpense = useMemo(() => {
    return expenses
      .filter((item) => item.date.slice(0, 7) === activeMonth)
      .reduce((sum, item) => sum + item.amount, 0);
  }, [expenses, activeMonth]);

  const monthlyLimit = monthlyBudgets[activeMonth] || 0;

  const remainingBudget = monthlyLimit - monthlyExpense;

  const usedPercentage =
    monthlyLimit > 0
      ? Math.min((monthlyExpense / monthlyLimit) * 100, 100)
      : 0;

  const budgetExceeded =
    monthlyLimit > 0 && monthlyExpense > monthlyLimit;

  const changeMonthlyLimit = (value: string) => {
    const newLimit = Number(value);

    setMonthlyBudgets((previousBudgets) => ({
      ...previousBudgets,
      [activeMonth]: newLimit >= 0 ? newLimit : 0,
    }));
  };

  return (
    <div
      className={`monthly-budget-card ${
        budgetExceeded ? "budget-exceeded" : ""
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
              changeMonthlyLimit(event.target.value)
            }
          />
        </div>
      </div>

      <div className="budget-details">
        <div>
          <small>Expense</small>
          <strong>{formatCurrency(monthlyExpense)}</strong>
        </div>

        <div>
          <small>Limit</small>
          <strong>{formatCurrency(monthlyLimit)}</strong>
        </div>

        <div>
          <small>
            {budgetExceeded ? "Over Budget" : "Remaining"}
          </small>

          <strong>
            {formatCurrency(Math.abs(remainingBudget))}
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
                  Math.abs(remainingBudget),
                )}`
              : `${usedPercentage.toFixed(
                  1,
                )}% of the budget used`}
          </p>
        </>
      ) : (
        <p className="budget-message">
          Enter your expense limit for {activeMonth}.
        </p>
      )}
    </div>
  );
}

export default MonthlyBudget;