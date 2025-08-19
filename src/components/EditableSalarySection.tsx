import React, { useState } from 'react';
import './EditableSalarySection.css';

interface EditableSalarySectionProps {
  title: string;
  rows: Array<{ label: string; value: string; editableLabel?: boolean }>; // label/value pairs for table rows, editableLabel for editable label
  // ...existing code...
  onChange?: (rows: Array<{ label: string; value: string }>) => void;
}

const EditableSalarySection: React.FC<EditableSalarySectionProps> = ({ title, rows, onChange }) => {
  const [editRows, setEditRows] = useState(rows);

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
    <div className="salary-section">
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
                  <input
                    type="text"
                    className="value-input"
                    value={row.value}
                    onChange={e => handleValueChange(idx, e.target.value)}
                  />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EditableSalarySection;
