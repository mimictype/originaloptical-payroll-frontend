import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeSelect from '../components/EmployeeSelect';
import { fetchEmployees } from '../services/api';
import type { EmployeeData } from '../types/index';
import DateSelector from '../components/DateSelector';
import BackButton from '../components/BackButton';
import './pageStyles.css';

const PayrollQueryPage = () => {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const now = new Date();
  const currentRocYear = now.getFullYear() - 1911;
  const currentMonth = now.getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState<number>(currentRocYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  
  const navigate = useNavigate();

    // 従業員一覧の取得
    useEffect(() => {
      const fetchData = async () => {
        try {
          const data = await fetchEmployees();
          setEmployees(data);
        } catch (err: any) {
          setError('従業員データの取得に失敗しました');
        }
      };
      fetchData();
    }, []);

  // 日期変更時の処理
  const handleDateChange = (year: number, month: number) => {
    console.log(`PayrollQuery received date change: ${year}年 ${month}月`);
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  // 従業員を選択した時の処理
  const handleEmployeeSelect = (employee: EmployeeData) => {
    navigate(`/payroll/${employee.employee_id}/${selectedYear}/${selectedMonth}`);
  };

  return (
    <div className="employee-list-page">
      <div className="page-header">
        <BackButton label="首頁" navigateTo="/" />
        <h2>薪資發放明細査詢</h2>
      </div>
      {/* 年月選擇器 */}
      <DateSelector onDateChange={handleDateChange} />
      {error && <div className="error-message">{error}</div>}
      {/* 従業員選択コンポーネント */}
      <EmployeeSelect
        employees={employees}
        onSelectEmployee={handleEmployeeSelect}
      />
    </div>
  );
};

export default PayrollQueryPage;
