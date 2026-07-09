type ExpenseFormProps = {
  newExpenseSource: string;
  setNewExpenseSource: (value: string) => void;
  addExpenseSource: () => void;
  expenseText: string;
  setExpenseText: (value: string) => void;
  expenseAmount: string;
  setExpenseAmount: (value: string) => void;
  expenseSources: string[];
  addExpense: () => void;
  editExpenseId: string | null;
};

function ExpenseForm({
  newExpenseSource,
  setNewExpenseSource,
  addExpenseSource,
  expenseText,
  setExpenseText,
  expenseAmount,
  setExpenseAmount,
  expenseSources,
  addExpense,
  editExpenseId,
}: ExpenseFormProps) {
  return (
    <div className="source-box expense-form compact-card">
      <h2>Expense</h2>

      <div className="inline-row">
        <input
          value={newExpenseSource}
          onChange={(e) => setNewExpenseSource(e.target.value)}
          placeholder="Add expense source"
        />

        <button className="small-btn" onClick={addExpenseSource}>
          Add Source
        </button>
      </div>

      <div className="inline-row money-row">
        <select
          value={expenseText}
          onChange={(e) => setExpenseText(e.target.value)}
        >
          <option value="">Select expense source</option>
          {expenseSources.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={expenseAmount}
          onChange={(e) => setExpenseAmount(e.target.value)}
          placeholder="Expense amount"
        />
      </div>

      <button className="main-action-btn" onClick={addExpense}>
        {editExpenseId ? "Update Expense" : "Add Expense"}
      </button>
    </div>
  );
}

export default ExpenseForm;