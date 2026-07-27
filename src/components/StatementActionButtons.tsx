type StatementActionButtonsProps = {
  onEdit: () => void;
  onDelete: () => void;
};

function StatementActionButtons({
  onEdit,
  onDelete,
}: StatementActionButtonsProps) {
  return (
    <div className="statement-actions">
      <button
        type="button"
        className="edit-button"
        onClick={onEdit}
        aria-label="Edit transaction"
      >
        ✏️
      </button>

      <button
        type="button"
        className="delete-button"
        onClick={onDelete}
        aria-label="Delete transaction"
      >
        ×
      </button>
    </div>
  );
}

export default StatementActionButtons;