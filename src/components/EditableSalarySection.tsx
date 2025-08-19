import React, { useState } from 'react';
import './EditableSalarySection.css';

interface EditableSalaryRow {
  label: string;
  value: string;
  editableLabel?: boolean;
  editableValue?: boolean; // この項目の値入力枠が編集可能か（デフォルト: true）
}

interface EditableSalarySectionProps {
  title: string;
  rows: EditableSalaryRow[];
  showTotal?: boolean; // 合計表示フラグ
  totalLabel?: string; // 合計ラベル（例: "合計"）
  totalValue?: number | string; // 外部から渡される合計値
  onChange?: (rows: Array<{ label: string; value: string }>) => void;
}

const EditableSalarySection: React.FC<EditableSalarySectionProps> = ({ title, rows, showTotal = false, totalLabel = '合計', totalValue, onChange }) => {
  const [editRows, setEditRows] = useState(rows);
  React.useEffect(() => {
    setEditRows(rows);
  }, [rows]);

  const handleValueChange = (idx: number, newValue: string) => {
    const updatedRows = editRows.map((row, i) =>
      i === idx ? { ...row, value: newValue } : row
    );
    setEditRows(updatedRows);
    if (onChange) onChange(updatedRows);
  };

  const handleLabelChange = (idx: number, newLabel: string) => {
    const updatedRows = editRows.map((row, i) =>
      i === idx ? { ...row, label: newLabel } : row
    );
    setEditRows(updatedRows);
    if (onChange) onChange(updatedRows);
  };


  return (
    <div className="editable-salary-section">
      <h5>{title}</h5>
      <table className="payroll-table">
        <tbody>
          {editRows.map((row, idx) => (
            <tr key={idx}>
              <td>
                  {row.editableLabel ? (
                    <input
                      type="text"
                      className="editable-label"
                      value={row.label}
                      onChange={e => handleLabelChange(idx, e.target.value)}
                    />
                  ) : (
                    <span className="readonly-label">{row.label}</span>
                  )}
              </td>
              <td>
                  {row.editableValue === false ? (
                    <span className="readonly-value">{row.value}</span>
                  ) : (
                    <input
                      type="text"
                      className="value-input"
                      value={row.value}
                      onChange={e => handleValueChange(idx, e.target.value)}
                    />
                  )}
              </td>
            </tr>
          ))}
          {showTotal && (
            <tr>
              <td><strong>{totalLabel}</strong></td>
              <td><strong>{totalValue}</strong></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EditableSalarySection;
