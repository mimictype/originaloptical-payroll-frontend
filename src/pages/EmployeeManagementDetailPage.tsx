import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Employee } from '../types/employee';
import '../components/employeeStyles.css';
import './pageStyles.css';
import { createEmployee, updateEmployee, deleteEmployee } from '../services/api';

const defaultEmployee: Partial<Employee> = {
  employee_id: '',
  name: '',
  user_email: '',
  bank_name: '',
  bank_account: 0,
};

const EmployeeManagementDetailPage = () => {
  const navigate = useNavigate();
  const { employee_id } = useParams<{ employee_id?: string }>();
  const [employee, setEmployee] = useState<Partial<Employee>>(defaultEmployee);
  const mode: 'create' | 'edit' = employee_id ? 'edit' : 'create';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (mode === 'edit' && employee_id) {
        setLoading(true);
        setError(null);
        try {
          // fetchEmployeesで全件取得し、該当IDを探す
          const employees = await import('../services/api').then(mod => mod.fetchEmployees(false));
          const found = employees.find(e => e.employee_id === employee_id);
          if (found) {
            setEmployee(found);
          } else {
            setError('従業員が見つかりません');
          }
        } catch (err) {
          setError('従業員情報の取得に失敗しました');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchDetail();
  }, [employee_id, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await createEmployee(employee);
      if (res.status === 'success') {
        setSuccess('作成しました');
        navigate('/employee-management');
      } else {
        setError(res.error || '作成に失敗しました');
      }
    } catch (err) {
      setError('作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await updateEmployee(employee);
      if (res.status === 'success') {
        setSuccess('更新しました');
        navigate('/employee-management');
      } else {
        setError(res.error || '更新に失敗しました');
      }
    } catch (err) {
      setError('更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!employee.employee_id) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await deleteEmployee(employee.employee_id);
      if (res.status === 'success') {
        setSuccess('削除しました');
        navigate('/employee-management');
      } else {
        setError(res.error || '削除に失敗しました');
      }
    } catch (err) {
      setError('削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-detail-page">
      <div className="page-header">
        <button className="back-to-top" onClick={() => navigate('/employee-management')}>← 員工管理</button>
        <h2>員工詳細</h2>
      </div>
      <form className="employee-form" onSubmit={e => e.preventDefault()}>
        <label>
          員工ID
    <input name="employee_id" value={employee.employee_id || ''} onChange={handleChange} />
        </label>
        <label>
          氏名
          <input name="name" value={employee.name || ''} onChange={handleChange} />
        </label>
        <label>
          メール
          <input name="user_email" value={employee.user_email || ''} onChange={handleChange} />
        </label>
        <label>
          銀行名
          <input name="bank_name" value={employee.bank_name || ''} onChange={handleChange} />
        </label>
        <label>
          銀行口座
          <input name="bank_account" value={employee.bank_account || ''} onChange={handleChange} />
        </label>
        <div className="form-actions">
          {mode === 'create' ? (
            <button type="button" onClick={handleCreate} disabled={loading}>作成</button>
          ) : (
            <>
              <button type="button" onClick={handleUpdate} disabled={loading}>更新</button>
              <button type="button" onClick={handleDelete} disabled={loading}>削除</button>
            </>
          )}
        </div>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </form>
    </div>
  );
};

export default EmployeeManagementDetailPage;
