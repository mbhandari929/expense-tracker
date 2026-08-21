type OpeningBalanceFieldProps = {
  value: number;
  onChange: (value: number) => void;
};

function OpeningBalanceField({
  value,
  onChange,
}: OpeningBalanceFieldProps) {
  return (
    <div className="opening-balance-field">
     <label htmlFor="opening-balance">Base Opening Balance</label> 

      <div className="opening-balance-input">
        <span>¥</span>

        <input
          id="opening-balance"
          type="number"
          min="0"
          value={value || ""}
          onChange={(event) => onChange(Number(event.target.value))}
          placeholder="Enter amount"
        />
      </div>
    </div>
  );
}

export default OpeningBalanceField;