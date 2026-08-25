type StatementActionButtonsProps = {
  onEdit: () => void;
  onDelete: () => void;
};

function StatementActionButtons({
  onEdit,
  onDelete,
}: StatementActionButtonsProps) {
  return (
    <div className="action-buttons">
      <button type="button" onClick={onEdit}>
        ✏️
      </button>

      <button type="button" onClick={onDelete}>
        ×
      </button>
    </div>
  );
}

export default StatementActionButtons;