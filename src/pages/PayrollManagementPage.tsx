import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import DateSelector from '../components/DateSelector';
import EmployeeSelect from '../components/EmployeeSelect';
import '../App.css';
import './pageStyles.css';

import { getEmployees, getEmployeePayroll } from '../services/getData';
import type { EmployeeData } from '../types/index';

const PayrollManagementPage = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear() - 1911);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployeesData = async () => {
      try {
        const data = await getEmployees();
        setEmployees(data);
        setError(null);
      } catch (err) {
        setError('取得員工資料失敗');
      }
    };
    fetchEmployeesData();
  }, []);

  const handleDateChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  const navigate = useNavigate();

  const handleSelectEmployee = async (employee: any) => {
    if (employee && employee.employee_id && selectedYear && selectedMonth) {
      try {
        // 給与データの有無をキャッシュ優先で確認
        const payroll = await getEmployeePayroll(employee.employee_id, selectedYear, selectedMonth);
        if (payroll) {
          navigate(`/payroll-edit/${employee.employee_id}/${selectedYear}/${selectedMonth}`);
        } else {
          navigate(`/payroll-create/${employee.employee_id}/${selectedYear}/${selectedMonth}`);
        }
      } catch (err) {
        // データがなければ作成ページへ
        navigate(`/payroll-create/${employee.employee_id}/${selectedYear}/${selectedMonth}`);
      }
    }
  };

  return (
    <div className="payroll-management-page">
      <BackButton label="首頁" navigateTo="/" />
      <h2>薪資管理</h2>
      <DateSelector onDateChange={handleDateChange} />
      {error && <div className="error-message">{error}</div>}
      <EmployeeSelect employees={employees} onSelectEmployee={handleSelectEmployee} />
    </div>
  );
};

export default PayrollManagementPage;
