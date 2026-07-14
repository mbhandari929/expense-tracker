type ActionButtonsProps = {
  onEdit: () => void;
  onDelete: () => void;
};

function ActionButtons({ onEdit, onDelete }: ActionButtonsProps) {
  return (
    <div className="action-buttons">
      <button onClick={onEdit}>✏️</button>
      <button onClick={onDelete}>×</button>
    </div>
  );
}

export default ActionButtons;


