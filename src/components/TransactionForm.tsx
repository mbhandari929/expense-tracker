type TransactionType = "income" | "expense";

type TransactionFormProps = {
  type: TransactionType;
  date: string;
  source: string;
  amount: string;
  newSource: string;
  sourceOptions: string[];
  isEditing: boolean;
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
  onTypeChange,
  onDateChange,
  onSourceChange,
  onAmountChange,
  onNewSourceChange,
  onAddSource,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  return (
    <div className="source-area compact-area single-transaction-area">
      <form
        className="transaction-form-card"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <h2>{isEditing ? "Edit Transaction" : "Add Transaction"}</h2>

        <label htmlFor="transaction-type">Transaction Type</label>
        <select
     id="transaction-type"
    value={type}
    disabled={isEditing}
    onChange={(event) =>
    onTypeChange(event.target.value as TransactionType)
    }
 >
    
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <label htmlFor="transaction-date">Transaction Date</label>
        <input
          id="transaction-date"
          type="date"
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
        />

        <label htmlFor="new-source">Add New Source</label>
        <div className="source-input-row">
          <input
            id="new-source"
            type="text"
            value={newSource}
            onChange={(event) => onNewSourceChange(event.target.value)}
            placeholder={
              type === "income"
                ? "Add income source"
                : "Add expense source"
            }
          />

          <button type="button" onClick={onAddSource}>
            Add Source
          </button>
        </div>

        <label htmlFor="transaction-source">Source</label>
        <select
          id="transaction-source"
          value={source}
          onChange={(event) => onSourceChange(event.target.value)}
        >
          <option value="">Select source</option>

          {sourceOptions.map((sourceOption) => (
            <option key={sourceOption} value={sourceOption}>
              {sourceOption}
            </option>
          ))}
        </select>

        <label htmlFor="transaction-amount">Amount</label>
        <input
          id="transaction-amount"
          type="number"
          min="0"
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          placeholder="Amount"
        />

        <div className="transaction-form-actions">
          <button type="submit">
            {isEditing ? "Update Transaction" : "Add Transaction"}
          </button>

          {isEditing && (
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default TransactionForm;