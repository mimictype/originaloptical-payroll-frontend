import React from 'react';
import type { Employee } from '../types/employee';
import './styles.css';
import './EmployeeSelect.css';

interface EmployeeSelectProps {
  employees: Employee[];
  onSelectEmployee: (employee: Employee) => void;
}

const EmployeeSelect: React.FC<EmployeeSelectProps> = ({ employees, onSelectEmployee }) => {
  if (employees.length === 0) {
    return <div className="loading">従業員データを読み込み中...</div>;
  }

  return (
    <div className="employee-select-container">
      <div className="employee-select-grid">
        {employees.map(employee => (
          <div
            key={employee.id}
            className="employee-select-card"
            onClick={() => onSelectEmployee(employee)}
          >
            <div className="employee-select-id-name-row">
              <div className="employee-select-id">{employee.employee_id}</div>
              <div className="employee-select-name">{employee.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeSelect;
