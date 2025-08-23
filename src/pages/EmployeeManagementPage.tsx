import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEmployees } from '../services/api';
import { setCache } from '../utils/cache';
import type { EmployeeData } from '../types/index';
import EmployeeSelect from '../components/EmployeeSelect';
import BackButton from '../components/BackButton';
import './pageStyles.css';
import MButton from '../components/MButton';

const EmployeeManagementPage = () => {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // 従業員データの読み込み
  useEffect(() => {
    const getEmployees = async () => {
      try {
  const data = await fetchEmployees(true);
  setEmployees(data);
  setCache<EmployeeData[]>("employees", data);
  setError(null);
      } catch (err) {
        setError('従業員データの取得に失敗しました。再読み込みをお試しください。');
      } finally {
      }
    };
    getEmployees();
  }, []);

  // 従業員を選択した時の処理
  const handleEmployeeSelect = (employee: EmployeeData) => {
    navigate(`/employee-management/${employee.employee_id}`);
  };

  return (
    <div className="employee-list-page">
      <div className="page-header">
        <BackButton label="首頁" navigateTo="/" />
        <h2>員工管理</h2>
      </div>
      {error && <div className="error-message">{error}</div>}
      {/* 従業員選択コンポーネント */}
      <EmployeeSelect
        employees={employees}
        onSelectEmployee={handleEmployeeSelect}
      />
        <MButton name="新增" type="create" onClick={() => navigate('/employee-management/create')} />
    </div>
  );
};

export default EmployeeManagementPage;
