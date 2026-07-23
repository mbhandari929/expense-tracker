import ActionButtons from "./ActionButtons";
import { formatCurrency } from "../utils/currency";

export type TransactionItem = {
  id: string;
  text: string;
  amount: number;
  date: string;
  type: "income" | "expense";
};

type StatementRowProps = {
  item: TransactionItem;
  onEdit: (item: TransactionItem) => void;
  onDelete: (item: TransactionItem) => void;
};

function StatementRow({
  item,
  onEdit,
  onDelete,
}: StatementRowProps) {
  return (
    <div
      className={`statement-row ${
        item.type === "income"
          ? "income-statement"
          : "expense-statement"
      }`}
    >
      <span>{item.date.slice(0, 10)}</span>

      <span className={`type-badge ${item.type}`}>
        {item.type === "income" ? "Income" : "Expense"}
      </span>

      <strong>{item.text}</strong>

      <span
        className={
          item.type === "income"
            ? "income-amount"
            : "expense-amount"
        }
      >
        {item.type === "income" ? "+" : "-"}
        {formatCurrency(item.amount)}
      </span>

      <ActionButtons
        onEdit={() => onEdit(item)}
        onDelete={() => onDelete(item)}
      />
    </div>
  );
}

export default StatementRow;