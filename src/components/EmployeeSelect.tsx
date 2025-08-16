import React from 'react';
import type { Employee } from '../types/employee';
import './styles.css';
import './employeeStyles.css';

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
      <h3>従業員一覧</h3>
      <div className="employee-grid">
        {employees.map(employee => (
          <div
            key={employee.id}
            className="employee-card"
            onClick={() => onSelectEmployee(employee)}
          >
            <div className="employee-id">{employee.employee_id}</div>
            <div className="employee-name">{employee.name}</div>
            <div className="employee-email">{employee.user_email}</div>
            <div className="employee-bank">
              {employee.bank_name}・{employee.bank_account}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeSelect;
