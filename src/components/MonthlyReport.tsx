import { formatCurrency } from "../utils/currency";

type MonthlyReportData = {
  income: number;
  expense: number;
};

type MonthlyReportProps = {
  report: Record<string, MonthlyReportData>;
};

function MonthlyReport({ report }: MonthlyReportProps) {
  const reportEntries = Object.entries(report).sort(
    ([firstMonth], [secondMonth]) =>
      secondMonth.localeCompare(firstMonth)
  );

  return (
    <div className="monthly-summary-inside">
      <h3>📅 Monthly Report</h3>

      {reportEntries.length === 0 ? (
        <p>No monthly data yet.</p>
      ) : (
        reportEntries.map(([month, data]) => (
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
        ))
      )}
    </div>
  );
}

export default MonthlyReport;