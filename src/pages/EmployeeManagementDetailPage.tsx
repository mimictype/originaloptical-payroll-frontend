import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { EmployeeData} from '../types/index';
import BackButton from '../components/BackButton';
import EmployeeInfo from '../components/EmployeeInfo';
import '../components/EmployeeManagementDetailPage.css';
import './pageStyles.css';
import { createEmployee, updateEmployee, deleteEmployee } from '../services/api';
import { getEmployee } from '../services/getData';
import MButton from '../components/MButton';
import { getCache } from '../utils/cache';

const defaultEmployee: Partial<EmployeeData> = {
  employee_id: '',
  name: '',
  user_email: '',
  bank_name: '',
  bank_account: 0,
};

const EmployeeManagementDetailPage = () => {
  const navigate = useNavigate();
  const { employee_id } = useParams<{ employee_id?: string }>();
  const [employee, setEmployee] = useState<Partial<EmployeeData>>(defaultEmployee);
  const mode: 'create' | 'edit' = employee_id ? 'edit' : 'create';
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (mode === 'edit' && employee_id) {
        setError(null);
        // まずキャッシュから取得
        const cachedEmployees = getCache<EmployeeData[]>("employees");
        let found: EmployeeData | undefined;
        if (cachedEmployees) {
          found = cachedEmployees.find(e => e.employee_id === employee_id);
        }
        if (found) {
          setEmployee(found);
          return;
        }
        // キャッシュにない場合はAPI
        try {
          const employee = await getEmployee(employee_id);
          if (employee) {
            setEmployee(employee);
          } else {
            setError('找不到員工資料');
          }
        } catch (err) {
          setError('取得員工資訊失敗');
        } finally {
        }
      }
    };
    fetchDetail();
  }, [employee_id, mode]);

  const handleCreate = async () => {
    setError(null);
    setSuccess(null);
    try {
      const res = await createEmployee(employee);
      if (res.status === 'success') {
        setSuccess('作成しました');
        navigate('/employee-management');
      } else {
        setError(res.error || '建立失敗');
      }
    } catch (err) {
      setError('建立失敗');
    } finally {
    }
  };

  const handleUpdate = async () => {
    setError(null);
    setSuccess(null);
    try {
      const res = await updateEmployee(employee);
      if (res.status === 'success') {
        setSuccess('更新しました');
        navigate('/employee-management');
      } else {
        setError(res.error || '更新失敗');
      }
    } catch (err) {
      setError('更新失敗');
    } finally {
    }
  };

  const handleDelete = async () => {
    if (!employee.employee_id) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await deleteEmployee(employee.employee_id);
      if (res.status === 'success') {
        setSuccess('削除しました');
        navigate('/employee-management');
      } else {
        setError(res.error || '刪除失敗');
      }
    } catch (err) {
      setError('刪除失敗');
    } finally {
    }
  };

  const handleEmployeeChange = (field: keyof EmployeeData, value: string) => {
    setEmployee(prev => ({ ...prev, [field]: field === 'bank_account' ? Number(value) : value }));
  };

  return (
    <div className="employee-detail-page">
      <div className="page-header">
        <BackButton label="員工管理" navigateTo="/employee-management" />
        {mode === 'create' ? (
          <h2>新增員工</h2>
        ) : (
          <h2>修改員工資料</h2>
        )}
      </div>
      <form className="employee-form detail-form" onSubmit={e => e.preventDefault()}>
        <EmployeeInfo
          employee={employee as EmployeeData}
          editable={true}
          showEmail={true}
          onChange={handleEmployeeChange}
          employeeIdDisabled={mode === 'edit'}
        />
        <div className="form-actions detail-actions">
          {mode === 'create' ? (
            <MButton type="create" onClick={handleCreate} name="作成" />
          ) : (
            <MButton type="confirm" onClick={handleUpdate} name="更新" />
          )}
        </div>
        {mode === 'edit' && (
          <div className="delete-action-center">
            <MButton
              type="delete"
              onClick={() => {
                if (window.confirm('確定要刪除嗎？此操作無法復原。')) {
                  handleDelete();
                }
              }}
              name="削除"
            />
          </div>
        )}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </form>
    </div>
  );
};

export default EmployeeManagementDetailPage;
