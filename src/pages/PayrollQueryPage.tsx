import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeSelect from '../components/EmployeeSelect';
import { fetchEmployees } from '../services/api';
import type { Employee } from '../types/employee';
import DateSelector from '../components/DateSelector';
import './pageStyles.css';

const PayrollQueryPage = () => {
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

    // 従業員一覧の取得
    useEffect(() => {
      const fetchData = async () => {
        try {
          const data = await fetchEmployees();
          setEmployees(data);
          setLoading(false);
        } catch (err: any) {
          setError('従業員データの取得に失敗しました');
          setLoading(false);
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

  // 従業員データの読み込み
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
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
              <path d="M12 15L7 10L12 5" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            首頁
          </span>
        </button>
        <h2>薪資發放明細査詢</h2>
      </div>
      
      {/* 年月選擇器 */}
      <DateSelector onDateChange={handleDateChange} />
      
      {loading && <p className="loading-message">載入中...</p>}
      
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
