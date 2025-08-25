// import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import '../App.css';
import './pageStyles.css';
import GoogleLogin from '../components/GoogleLogin';
// import { clearAllCache } from '../utils/cache';

const TopPage = () => {
  // ログイン状態をuseStateで管理
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('id_token'));

  // Googleログイン時のidToken取得コールバック
  const handleGoogleLogin = (idToken: string) => {
    localStorage.setItem('id_token', idToken);
    setIsLoggedIn(true); // ログイン状態を更新
    console.log('Google idToken:', idToken);
  };

  return (
    <div className="top-page">
      <h1>Original Optical 人資管理系統</h1>
      {!isLoggedIn ? (
        <div className="top-page-login">
          <GoogleLogin onLogin={handleGoogleLogin} />
        </div>
      ) : (
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
        </div>
      )}
    </div>
  );
};

export default TopPage;
