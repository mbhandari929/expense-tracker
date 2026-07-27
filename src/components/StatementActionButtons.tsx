type StatementActionButtonsProps = {
  onEdit: () => void;
  onDelete: () => void;
};

function StatementActionButtons({
  onEdit,
  onDelete,
}: StatementActionButtonsProps) {
  const handleDelete = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (confirmed) {
      onDelete();
    }
  };

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
        onClick={handleDelete}
        aria-label="Delete transaction"
      >
        ×
      </button>
    </div>
  );
}

export default StatementActionButtons;