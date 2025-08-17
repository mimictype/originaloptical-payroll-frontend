import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import './pageStyles.css';
import { clearAllCache } from '../utils/cache';

const TopPage = () => {
  // Clear cache when TopPage is mounted
  useEffect(() => {
    console.log('TopPage mounted - clearing all cache');
    clearAllCache();
  }, []);

  return (
    <div className="top-page">
      <h1>Original Optical 薪資管理系統</h1>
      <div className="top-page-content">
        <p>薪資管理システムへようこそ</p>
        <div className="button-container">
          <Link to="/payroll-query" className="main-button">
            薪資發放明細査詢
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopPage;
