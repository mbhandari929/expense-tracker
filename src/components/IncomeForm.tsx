function IncomeForm() {
  return (
    <div>
      <h2>Income Form</h2>

      <input
        type="text"
        placeholder="Income Source"
      />

      <input
        type="number"
        placeholder="Amount"
      />

      <button>Add Income</button>
    </div>
  );
}

export default IncomeForm;