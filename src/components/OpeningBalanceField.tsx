type OpeningBalanceFieldProps = {
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
};

function OpeningBalanceField({
  value,
  onChange,
  onBlur,
}: OpeningBalanceFieldProps) {
  return (
    <div className="opening-balance-field">
      <label htmlFor="opening-balance">
        Base Opening Balance
      </label>

      <div className="opening-balance-input">
        <span>¥</span>

        <input
          id="opening-balance"
          type="number"
          min="0"
          value={value || ""}
          placeholder="Enter amount"
          onChange={(event) =>
            onChange(Number(event.target.value))
          }
          onBlur={onBlur}
        />
      </div>
    </div>
  );
}

export default OpeningBalanceField;