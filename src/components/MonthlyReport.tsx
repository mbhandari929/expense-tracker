import { useState } from "react";
import { formatCurrency } from "../utils/currency";

type MonthlyReportData = {
  income: number;
  expense: number;
};

type MonthlyReportProps = {
  report: Record<string, MonthlyReportData>;
};

function MonthlyReport({ report }: MonthlyReportProps) {
  const [showAllMonths, setShowAllMonths] = useState(false);

  const reportEntries = Object.entries(report).sort(
    ([firstMonth], [secondMonth]) =>
      secondMonth.localeCompare(firstMonth)
  );

  const visibleReportEntries = showAllMonths
    ? reportEntries
    : reportEntries.slice(0, 5);

  return (
    <div className="monthly-summary-inside">
      <h3>📅 Monthly Report</h3>

      {reportEntries.length === 0 ? (
        <p>No monthly data yet.</p>
      ) : (
        <>
          {visibleReportEntries.map(([month, data]) => (
            <div key={month} className="monthly-summary-row">
              <strong>{month}</strong>

              <span className="income-amount">
                Income: {formatCurrency(data.income)}
              </span>

              <span className="expense-amount">
                Expense: {formatCurrency(data.expense)}
              </span>

              <span>
                Balance: {formatCurrency(data.income - data.expense)}
              </span>
            </div>
          ))}

          {reportEntries.length > 5 && (
            <button
              type="button"
              className="view-all-months-btn"
              onClick={() => setShowAllMonths((previous) => !previous)}
            >
              {showAllMonths ? "Show Latest 5 Months" : "View All Months"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default MonthlyReport;