type Props = {
  newIncomeSource: string;
  setNewIncomeSource: React.Dispatch<React.SetStateAction<string>>;
  addIncomeSource: () => void;
  deleteIncomeSource: (source: string) => void;
  editIncomeSource: (oldSource: string) => void;
  incomeText: string;
  setIncomeText: React.Dispatch<React.SetStateAction<string>>;
  incomeAmount: string;
  setIncomeAmount: React.Dispatch<React.SetStateAction<string>>;
  incomeSources: string[];
  addIncome: () => void;
  editIncomeId: string | null;
};


function IncomeForm({
  newIncomeSource,
  setNewIncomeSource,
  addIncomeSource,
  deleteIncomeSource,
  editIncomeSource,
  incomeText,
  setIncomeText,
  incomeAmount,
  setIncomeAmount,
  incomeSources,
  addIncome,
  editIncomeId,
}: Props) {
  return (
    <>
      <div className="source-box">
        <h2>Income Source</h2>
        <input
          value={newIncomeSource}
          onChange={(e) => setNewIncomeSource(e.target.value)}
          placeholder="Add income source"
        />
        <button onClick={addIncomeSource}>Add Source</button>
        <div style={{ marginTop: "10px" }}>
  {incomeSources.map((source) => (
    <div
      key={source}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "5px",
      }}
    >
      <span>{source}</span>

      <div>
        <button onClick={() => editIncomeSource(source)}>
          ✏️
        </button>
        <button onClick={() => deleteIncomeSource(source)}>
          🗑
        </button>
      </div>
    </div>
  ))}
</div>
      </div>

      <div className="form-box income-form">
        <h2>{editIncomeId ? "Edit Income" : "Add Income"}</h2>

        <select
          value={incomeText}
          onChange={(e) => setIncomeText(e.target.value)}
        >
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

        <button onClick={addIncome}>
          {editIncomeId ? "Update Income" : "Add Income"}
        </button>
      </div>
    </>
  );
}

export default IncomeForm;