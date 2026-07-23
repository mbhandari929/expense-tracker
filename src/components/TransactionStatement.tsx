import MonthlyReport from "./MonthlyReport";
import StatementRow from "./StatementRow";
import type { TransactionItem } from "./StatementRow";

type MonthlyReportData = {
  income: number;
  expense: number;
};

type TransactionStatementProps = {
  items: TransactionItem[];
  report: Record<string, MonthlyReportData>;
  onEdit: (item: TransactionItem) => void;
  onDelete: (item: TransactionItem) => void;
};

function TransactionStatement({
  items,
  report,
  onEdit,
  onDelete,
}: TransactionStatementProps) {
  return (
    <div className="history-area single-history-area">
      <div className="history-box">
        <h2>Income & Expense Statement</h2>

        <MonthlyReport report={report} />

        <div className="statement-table">
          <div className="statement-row statement-header">
            <span>Date</span>
            <span>Type</span>
            <span>Source</span>
            <span>Amount</span>
            <span>Action</span>
          </div>

          {items.length === 0 ? (
            <p className="empty-message">
              No transactions found.
            </p>
          ) : (
            items.map((item) => (
              <StatementRow
                key={item.id}
                item={item}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default TransactionStatement;