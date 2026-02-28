import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmployees } from '../services/getData';
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
    const fetchEmployeesData = async () => {
      try {
        const data = await getEmployees();
        setEmployees(data);
        setError(null);
      } catch (err) {
        setError('取得員工資料失敗，請重新整理後再試。');
      }
    };
    fetchEmployeesData();
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
