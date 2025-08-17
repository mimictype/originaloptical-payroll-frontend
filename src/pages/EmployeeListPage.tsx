import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEmployees } from '../services/api';
import type { Employee } from '../types/employee';
import DateSelector from '../components/DateSelector';
import '../components/employeeStyles.css';
import './pageStyles.css';

const EmployeeListPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize with default values to avoid null state
  const now = new Date();
  const currentRocYear = now.getFullYear() - 1911;
  const currentMonth = now.getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState<number>(currentRocYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  
  const navigate = useNavigate();

  // 日期変更時の処理
  const handleDateChange = (year: number, month: number) => {
    console.log(`EmployeeList received date change: ${year}年 ${month}月`);
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  // 従業員データの読み込み
  useEffect(() => {
    const getEmployees = async () => {
      try {
        setLoading(true);
        // useCache=true to use cached data if available
        const data = await fetchEmployees(true);
        console.log(`Fetched ${data.length} employees`);
        setEmployees(data);
        setError(null);
      } catch (err) {
        console.error('従業員データの取得に失敗しました', err);
        setError('従業員データの取得に失敗しました。再読み込みをお試しください。');
      } finally {
        setLoading(false);
      }
    };

    getEmployees();
  }, []);

  // 従業員を選択した時の処理
  const handleEmployeeSelect = (employee: Employee) => {
    navigate(`/payroll/${employee.employee_id}/${selectedYear}/${selectedMonth}`);
  };

  return (
    <div className="employee-list-page">
      <div className="page-header">
        <button 
          className="back-to-top"
          onClick={() => navigate('/')}
        >
          ← 首頁
        </button>
        <h2>薪資發放明細査詢</h2>
      </div>
      
      {/* 年月選擇器 */}
      <DateSelector onDateChange={handleDateChange} />
      
      {loading && <p className="loading-message">載入中...</p>}
      
      {error && <div className="error-message">{error}</div>}
      
      {/* 従業員一覧 */}
      {!loading && employees.length > 0 && (
        <div className="employee-grid">
          {employees.map((employee) => (
            <div 
              key={employee.id} 
              className="employee-card"
              onClick={() => handleEmployeeSelect(employee)}
            >
              <div className="employee-id">{employee.employee_id}</div>
              <div className="employee-name">{employee.name}</div>
              <div className="employee-email">{employee.user_email}</div>
              <div className="employee-bank">
                <span>{employee.bank_name}</span>
                <span className="account-number">{employee.bank_account}</span>
              </div>
              <button className="view-payroll-button">明細を見る</button>
            </div>
          ))}
        </div>
      )}
      
      {!loading && employees.length === 0 && (
        <div className="no-employees">
          <p>従業員データはありません</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeListPage;
