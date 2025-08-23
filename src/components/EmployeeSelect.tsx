import React from 'react';
import type { EmployeeData } from '../types/index';
import './styles.css';
import './EmployeeSelect.css';
import LoadingSpinner from './LoadingSpinner';

interface EmployeeSelectProps {
  employees: EmployeeData[];
  onSelectEmployee: (employee: EmployeeData) => void;
}

const EmployeeSelect: React.FC<EmployeeSelectProps> = ({ employees, onSelectEmployee }) => {
  if (employees.length === 0) {
    return <LoadingSpinner />;
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
