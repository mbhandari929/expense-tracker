type IncomeFormProps = {
  newIncomeSource: string;
  setNewIncomeSource: (value: string) => void;
  addIncomeSource: () => void;
  incomeText: string;
  setIncomeText: (value: string) => void;
  incomeAmount: string;
  setIncomeAmount: (value: string) => void;
  incomeSources: string[];
  addIncome: () => void;
  editIncomeId: string | null; 
};

function IncomeForm({
  newIncomeSource,
  setNewIncomeSource,
  addIncomeSource,
  incomeText,
  setIncomeText,
  incomeAmount,
  setIncomeAmount,
  incomeSources,
  addIncome,
  editIncomeId,
}: IncomeFormProps) {
  return (
    <div className="source-box income-form compact-card">
      <h2>Income</h2>

      <div className="inline-row">
        <input
          value={newIncomeSource}
          onChange={(e) => setNewIncomeSource(e.target.value)}
          placeholder="Add income source"
        />

        <button className="small-btn" onClick={addIncomeSource}>
          Add Source
        </button>
      </div>

      <div className="inline-row money-row">
        <select value={incomeText} onChange={(e) => setIncomeText(e.target.value)}>
          <option value="">Select income source</option>
          {incomeSources.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={incomeAmount}
          onChange={(e) => setIncomeAmount(e.target.value)}
          placeholder="Income amount"
        />
      </div>

      <button className="main-action-btn" onClick={addIncome}>
        {editIncomeId ? "Update Income" : "Add Income"}
      </button>
    </div>
  );
}

export default IncomeForm;
