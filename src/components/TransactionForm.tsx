import type { TransactionType } from "../types/transaction";

type TransactionFormProps = {
  type: TransactionType;
  date: string;
  source: string;
  amount: string;
  newSource: string;
  sourceOptions: string[];
  isEditing: boolean;
  formError: string;
  onTypeChange: (type: TransactionType) => void;
  onDateChange: (date: string) => void;
  onSourceChange: (source: string) => void;
  onAmountChange: (amount: string) => void;
  onNewSourceChange: (source: string) => void;
  onAddSource: () => void;
  onSubmit: () => void;
  onCancel: () => void;
};

function TransactionForm({
  type,
  date,
  source,
  amount,
  newSource,
  sourceOptions,
  isEditing,
  formError,
  onTypeChange,
  onDateChange,
  onSourceChange,
  onAmountChange,
  onNewSourceChange,
  onAddSource,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const now = new Date();

  const today = `${now.getFullYear()}-${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;

  return (
    <div className="source-area compact-area single-transaction-area">
      <form
        className="transaction-form-card"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <h2>
          {isEditing
            ? "Edit Transaction"
            : "Add Transaction"}
        </h2>

        <label htmlFor="transaction-type">
          Transaction Type
        </label>

        <select
          id="transaction-type"
          value={type}
          disabled={isEditing}
          onChange={(event) =>
            onTypeChange(
              event.target.value as TransactionType,
            )
          }
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <label htmlFor="transaction-date">
          Transaction Date
        </label>

        <input
          id="transaction-date"
          type="date"
          value={date}
          max={today}
          required
          onChange={(event) =>
            onDateChange(event.target.value)
          }
        />

        <label htmlFor="new-source">
          {type === "income"
            ? "Add Income Source"
            : "Add Expense Source"}
        </label>

        <div className="source-input-row">
          <input
            id="new-source"
            type="text"
            value={newSource}
            onChange={(event) =>
              onNewSourceChange(event.target.value)
            }
            placeholder={
              type === "income"
                ? "Add income source"
                : "Add expense source"
            }
          />

          <button
            type="button"
            onClick={onAddSource}
          >
            {type === "income"
              ? "Add Income Source"
              : "Add Expense Source"}
          </button>
        </div>

        <label htmlFor="transaction-source">
          {type === "income"
            ? "Income Source"
            : "Expense Source"}
        </label>

        <select
          id="transaction-source"
          value={source}
          required
          onChange={(event) =>
            onSourceChange(event.target.value)
          }
        >
          <option value="">
            {type === "income"
              ? "Select income source"
              : "Select expense source"}
          </option>

          {sourceOptions.map((sourceOption) => (
            <option
              key={sourceOption}
              value={sourceOption}
            >
              {sourceOption}
            </option>
          ))}
        </select>

        <label htmlFor="transaction-amount">
          Amount
        </label>

        <input
          id="transaction-amount"
          type="number"
          min="1"
          step="any"
          value={amount}
          required
          onChange={(event) =>
            onAmountChange(event.target.value)
          }
          onWheel={(event) =>
            event.currentTarget.blur()
          }
          placeholder="Amount"
        />

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}

        <div className="transaction-form-actions">
          <button type="submit">
            {isEditing
              ? "Update Transaction"
              : "Add Transaction"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default TransactionForm;