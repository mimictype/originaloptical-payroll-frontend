import React from 'react';
import BackButton from '../components/BackButton';
import '../App.css';
import './pageStyles.css';

const PayrollManagementPage = () => {
  return (
    <div className="payroll-management-page">
      <BackButton label="首頁" navigateTo="/" />
      <h2>給与管理ページ</h2>
      <p>ここで給与管理の機能を実装します。</p>
    </div>
  );
};

export default PayrollManagementPage;
