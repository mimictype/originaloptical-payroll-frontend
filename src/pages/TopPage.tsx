import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import './pageStyles.css';
import MButton from '../components/MButton';
import EmployeeInfo from '../components/EmployeeInfo';
// import { clearAllCache } from '../utils/cache';

const TopPage = () => {
  // キャッシュクリア処理を一時的にコメントアウト
  // useEffect(() => {
  //   console.log('TopPage mounted - clearing all cache');
  //   clearAllCache();
  // }, []);

  return (
    <div className="top-page">
      <h1>Original Optical 人資管理系統</h1>
      <div className="top-page-content">
        <Link to="/payroll-query" className="button-block">
          薪資發放明細査詢
        </Link>
        <Link to="/employee-management" className="button-block">
          員工管理
        </Link>
        <Link to="/payroll-management" className="button-block">
          薪資管理
        </Link>
        <MButton name="GGG" />
        <MButton name="新增" type="create" />
  <MButton name="刪除" type="delete" />
  <MButton name="確定" type="confirm" />
      </div>
      <EmployeeInfo employee={{ id: 9, employee_id: '123', name: 'John Doe', user_email: 'john.doe@example.com', bank_name: 'Original Bank', bank_account: 1234567890 }} />
    </div>
  );
};

export default TopPage;
