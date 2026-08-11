import { useState } from "react";
import StatementActionButtons from "./StatementActionButtons";
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
  onSave: (
    item: TransactionItem,
  ) => Promise<boolean>;
  onDelete: (item: TransactionItem) => void;
};

function StatementRow({
  item,
  onSave,
  onDelete,
}: StatementRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editDate, setEditDate] = useState(
    item.date.slice(0, 10),
  );
  const [editText, setEditText] = useState(item.text);
  const [editAmount, setEditAmount] = useState(
    String(item.amount),
  );
  const [editError, setEditError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const startEditing = () => {
    setEditDate(item.date.slice(0, 10));
    setEditText(item.text);
    setEditAmount(String(item.amount));
    setEditError("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditDate(item.date.slice(0, 10));
    setEditText(item.text);
    setEditAmount(String(item.amount));
    setEditError("");
    setIsEditing(false);
  };

  const saveEditing = async () => {
    const text = editText.trim();
    const amount = Number(editAmount);

    if (editDate === "") {
      setEditError("Please select a date.");
      return;
    }

    if (editDate > today) {
      setEditError("Future dates are not allowed.");
      return;
    }

    if (text === "") {
      setEditError("Source is required.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setEditError("Amount must be greater than 0.");
      return;
    }

    setEditError("");
    setIsSaving(true);

    const saved = await onSave({
      ...item,
      date: editDate,
      text,
      amount,
    });

    setIsSaving(false);

    if (saved) {
      setIsEditing(false);
    } else {
      setEditError("Transaction could not be updated.");
    }
  };

  if (isEditing) {
    return (
      <div
        className={`statement-row ${
          item.type === "income"
            ? "income-statement"
            : "expense-statement"
        }`}
      >
        <input
          type="date"
          value={editDate}
          max={today}
          onChange={(event) =>
            setEditDate(event.target.value)
          }
        />

        <span className={`type-badge ${item.type}`}>
          {item.type === "income"
            ? "Income"
            : "Expense"}
        </span>

        <input
          type="text"
          value={editText}
          onChange={(event) =>
            setEditText(event.target.value)
          }
          placeholder="Source"
        />

        <input
          type="number"
          min="1"
          step="any"
          value={editAmount}
          onChange={(event) =>
            setEditAmount(event.target.value)
          }
          onWheel={(event) =>
            event.currentTarget.blur()
          }
          placeholder="Amount"
        />

        <div className="inline-edit-actions">
          <button
            type="button"
            onClick={() => void saveEditing()}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            onClick={cancelEditing}
            disabled={isSaving}
          >
            Cancel
          </button>
        </div>

        {editError && (
          <p className="form-error" role="alert">
            {editError}
          </p>
        )}
      </div>
    );
  }

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
        {item.type === "income"
          ? "Income"
          : "Expense"}
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

      <StatementActionButtons
        onEdit={startEditing}
        onDelete={() => onDelete(item)}
      />
    </div>
  );
}

export default StatementRow;