import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import DateSelector from '../components/DateSelector';
import EmployeeSelect from '../components/EmployeeSelect';
import '../App.css';
import './pageStyles.css';


const dummyEmployees = [
  { id: 1, employee_id: 'A001', name: '山田太郎' },
  { id: 2, employee_id: 'A002', name: '佐藤花子' },
  { id: 3, employee_id: 'A003', name: '鈴木一郎' },
];

const PayrollManagementPage = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear() - 1911);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  const handleDateChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  const navigate = useNavigate();

  const handleSelectEmployee = (employee: any) => {
    // 編集ページへ遷移
    if (employee && employee.employee_id && selectedYear && selectedMonth) {
      navigate(`/payroll-edit/${employee.employee_id}/${selectedYear}/${selectedMonth}`);
    }
    // 必要な情報がない場合は何もしない
  };

  return (
    <>
      <div className="payroll-management-page">
        <BackButton label="首頁" navigateTo="/" />
        <h2>給与管理ページ</h2>
        <p>ここで給与管理の機能を実装します。</p>
          <DateSelector onDateChange={handleDateChange} />
          <EmployeeSelect employees={dummyEmployees} onSelectEmployee={handleSelectEmployee} />
      </div>
    </>
  );
};

export default PayrollManagementPage;
