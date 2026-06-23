type Props = {
  newIncomeSource: string;
  setNewIncomeSource: React.Dispatch<React.SetStateAction<string>>;
  addIncomeSource: () => void;
};

function IncomeForm({
  newIncomeSource,
  setNewIncomeSource,
  addIncomeSource,
}: Props) {
  return (
    <div className="source-box">
      <h2>Income Source</h2>
      <input
        value={newIncomeSource}
        onChange={(e) => setNewIncomeSource(e.target.value)}
        placeholder="Add income source"
      />
      <button onClick={addIncomeSource}>Add Source</button>
    </div>
  );
}

export default IncomeForm;