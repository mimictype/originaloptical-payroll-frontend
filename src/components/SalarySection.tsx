import React from 'react';
import './SalarySection.css';

interface SalarySectionProps {
  title: string;
  rows: Array<{ label: string; value: React.ReactNode }>; // label/value pairs for table rows
  subtotalLabel?: string;
  subtotalValue?: React.ReactNode;
}

const SalarySection: React.FC<SalarySectionProps> = ({ title, rows, subtotalLabel, subtotalValue }) => (
  <div className="salary-section">
    <h5>{title}</h5>
    <table className="payroll-table">
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx}>
            <td>{row.label}</td>
            <td>{row.value}</td>
          </tr>
        ))}
        {subtotalLabel && (
          <tr>
            <td><strong>{subtotalLabel}</strong></td>
            <td><strong>{subtotalValue}</strong></td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default SalarySection;
