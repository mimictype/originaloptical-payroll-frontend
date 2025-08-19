import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Employee } from '../types/employee';
import BackButton from '../components/BackButton';
import '../components/EmployeeManagementDetailPage.css';
import './pageStyles.css';
import { createEmployee, updateEmployee, deleteEmployee } from '../services/api';
import { getCache } from '../utils/cache';

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
        // まずキャッシュから取得
        const cachedEmployees = getCache<Employee[]>("employees");
        let found: Employee | undefined;
        if (cachedEmployees) {
          found = cachedEmployees.find(e => e.employee_id === employee_id);
        }
        if (found) {
          setEmployee(found);
          setLoading(false);
          return;
        }
        // キャッシュにない場合はAPI
        try {
          const employees = await import('../services/api').then(mod => mod.fetchEmployees(false));
          const foundApi = employees.find(e => e.employee_id === employee_id);
          if (foundApi) {
            setEmployee(foundApi);
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
        <BackButton label="員工管理" navigateTo="/employee-management" />
        <h2>員工詳細</h2>
      </div>
      <form className="employee-form detail-form" onSubmit={e => e.preventDefault()}>
        <div className="detail-fields">
          <div className="detail-field-row">
            <label htmlFor="employee_id">員工ID</label>
            <div className="detail-value">
              {mode === 'create' ? (
                <input id="employee_id" name="employee_id" value={employee.employee_id || ''} onChange={handleChange} />
              ) : (
                <span>{employee.employee_id}</span>
              )}
            </div>
          </div>
          <div className="detail-field-row">
            <label htmlFor="name">姓名</label>
            <div className="detail-value">
              <input id="name" name="name" value={employee.name || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="detail-field-row">
            <label htmlFor="user_email">Email</label>
            <div className="detail-value">
              <input id="user_email" name="user_email" value={employee.user_email || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="detail-field-row">
            <label htmlFor="bank_name">銀行</label>
            <div className="detail-value">
              <input id="bank_name" name="bank_name" value={employee.bank_name || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="detail-field-row">
            <label htmlFor="bank_account">帳號</label>
            <div className="detail-value">
              <input id="bank_account" name="bank_account" value={employee.bank_account || ''} onChange={handleChange} />
            </div>
          </div>
        </div>
        <div className="form-actions detail-actions">
          {mode === 'create' ? (
            <button type="button" onClick={handleCreate} disabled={loading}>作成</button>
          ) : (
            <>
              <button type="button" onClick={handleUpdate} disabled={loading}>更新</button>
            </>
          )}
        </div>
        {mode === 'edit' && (
          <div className="delete-action-center">
            <button
              type="button"
              className="delete-btn"
              onClick={() => {
                if (window.confirm('確定要刪除嗎？此操作無法復原。')) {
                  handleDelete();
                }
              }}
              disabled={loading}
            >削除</button>
          </div>
        )}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </form>
    </div>
  );
};

export default EmployeeManagementDetailPage;
