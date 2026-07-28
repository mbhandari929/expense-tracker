import type { ChangeEvent } from "react";
type ActionButtonsProps = {
  onExportCSV: () => void;
  onBackupJSON: () => void;
  onImportJSON: (event: ChangeEvent<HTMLInputElement>) => void;
};

function ActionButtons({
  onExportCSV,
  onBackupJSON,
  onImportJSON,
}: ActionButtonsProps) {
  return (
    <div className="action-buttons">
      <button type="button" onClick={onExportCSV}>
        CSV Export
      </button>

      <button type="button" onClick={onBackupJSON}>
        JSON Backup
      </button>

      <label className="import-button">
        JSON Import
        <input
          type="file"
          accept=".json"
          onChange={onImportJSON}
          hidden
        />
      </label>
    </div>
  );
}

export default ActionButtons;