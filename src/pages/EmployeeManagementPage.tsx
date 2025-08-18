import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEmployees } from '../services/api';
import { setCache } from '../utils/cache';
import type { Employee } from '../types/employee';
import '../components/employeeStyles.css';
import './pageStyles.css';

const EmployeeManagementPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // 従業員データの読み込み
  useEffect(() => {
    const getEmployees = async () => {
      try {
        setLoading(true);
  const data = await fetchEmployees(true);
  setEmployees(data);
  setCache<Employee[]>("employees", data);
  setError(null);
      } catch (err) {
        setError('従業員データの取得に失敗しました。再読み込みをお試しください。');
      } finally {
        setLoading(false);
      }
    };
    getEmployees();
  }, []);

  // 従業員を選択した時の処理
  const handleEmployeeSelect = (employee: Employee) => {
    navigate(`/employee-management/${employee.employee_id}`);
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
        <h2>員工管理</h2>
        <button
          className="create-employee"
          onClick={() => navigate('/employee-management/create')}
        >
          新規作成
        </button>
      </div>
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
              <div className="employee-info">
                <div className="employee-id">{employee.employee_id}</div>
                <div className="employee-name">{employee.name}</div>
              </div>
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

export default EmployeeManagementPage;
