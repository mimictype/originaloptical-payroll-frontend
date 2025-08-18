import { useState, useEffect } from 'react';
import { fetchEmployees, fetchEmployeePayroll } from '../services/api';
import type { Record } from '../types';
import type { Employee } from '../types/employee';
import DateSelector from './DateSelector';
import EmployeeSelect from './EmployeeSelect';

const EmployeeList = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  // Initialize with default values to avoid null state
  const now = new Date();
  const currentRocYear = now.getFullYear() - 1911;
  const currentMonth = now.getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState<number>(currentRocYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // 日期変更時の処理
  const handleDateChange = (year: number, month: number) => {
    console.log(`EmployeeList received date change: ${year}年 ${month}月`);
    setSelectedYear(year);
    setSelectedMonth(month);
    // 日付変更時に選択を解除
    setSelectedRecord(null);
  };

  // 従業員データの読み込み
  useEffect(() => {
    const getEmployees = async () => {
      try {
        setLoading(true);
        const data = await fetchEmployees();
        console.log(`Fetched ${data.length} employees`);
        setEmployees(data);
        setError(null);
      } catch (err) {
        console.error('従業員データの取得に失敗しました', err);
        setError('従業員データの取得に失敗しました。再読み込みをお試しください。');
      } finally {
        setLoading(false);
      }
    };

    getEmployees();
  }, []);

  // 従業員の給与明細を取得する関数
  const handleEmployeeSelect = async (employee: Employee) => {
    try {
      console.log(`Selected employee: ${employee.name}`);
      setLoadingDetails(true);
      setError(null);
      
      // 選択した従業員の給与明細を取得
      const record = await fetchEmployeePayroll(
        employee.employee_id, 
        selectedYear, 
        selectedMonth
      );
      
      setSelectedRecord(record);
      
      // 詳細までスクロール
      setTimeout(() => {
        document.querySelector('.payroll-details')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (err) {
      console.error(`給与明細取得エラー:`, err);
      setError(`${employee.name}の${selectedYear}年${selectedMonth}月の給与記録は見つかりませんでした。`);
      setSelectedRecord(null);
      
      // 3秒後にエラーメッセージを消す
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateTotal = (record: Record) => {
    return record.subtotal_A + record.subtotal_B - record.subtotal_C;
  };

  return (
    <div className="employee-list-container">
      <h2>薪資記錄列表</h2>
      
      {/* 年月選擇器 */}
      <DateSelector onDateChange={handleDateChange} />
      
      {loading && <p>載入中...</p>}
      
      {error && <div className="error">{error}</div>}
      
      {/* 従業員選択 */}
      {!loading && employees.length > 0 && (
        <EmployeeSelect
          employees={employees}
          onSelectEmployee={handleEmployeeSelect}
        />
      )}
      
      {loadingDetails && <p>明細を読み込み中...</p>}
      
      {selectedRecord && (
        <div className="payroll-details">
          <div className="payroll-details-header">
            <h3>{selectedRecord.name} の薪資詳細資料 ({selectedRecord.pay_date})</h3>
            <button 
              className="close-details"
              onClick={() => setSelectedRecord(null)}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
                  <path d="M12 15L7 10L12 5" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                返回列表
              </span>
            </button>
          </div>
          
          {/* 基本情報 セクション */}
          <div className="payroll-section">
            <h4 className="section-title">基本情報</h4>
            <div className="basic-info">
              <div className="info-item">
                <span className="label">員工ID：</span>
                <span className="value">{selectedRecord.employee_id}</span>
              </div>
              <div className="info-item">
                <span className="label">姓名：</span>
                <span className="value">{selectedRecord.name}</span>
              </div>
              <div className="info-item">
                <span className="label">Email：</span>
                <span className="value">{selectedRecord.user_email}</span>
              </div>
              <div className="info-item">
                <span className="label">發薪日期：</span>
                <span className="value">{selectedRecord.pay_date}</span>
              </div>
              <div className="info-item">
                <span className="label">銀行：</span>
                <span className="value">{selectedRecord.bank_name}</span>
              </div>
              <div className="info-item">
                <span className="label">帳號：</span>
                <span className="value">{selectedRecord.bank_account}</span>
              </div>
            </div>
          </div>
          
          {/* 固定薪資結構 セクション */}
          <div className="payroll-section">
            <h4 className="section-title">固定薪資結構</h4>
            <table className="payroll-table">
              <thead>
                <tr>
                  <th>項目</th>
                  <th>金額</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>底薪</td>
                  <td>{formatCurrency(selectedRecord.base_salary)}</td>
                </tr>
                <tr>
                  <td>伙食津貼</td>
                  <td>{formatCurrency(selectedRecord.meal_allowance)}</td>
                </tr>
                
                {selectedRecord.fixed_custom1_name && (
                  <tr>
                    <td>{selectedRecord.fixed_custom1_name}</td>
                    <td>{formatCurrency(selectedRecord.fixed_custom1_amount)}</td>
                  </tr>
                )}
                
                {selectedRecord.fixed_custom2_name && (
                  <tr>
                    <td>{selectedRecord.fixed_custom2_name}</td>
                    <td>{formatCurrency(selectedRecord.fixed_custom2_amount)}</td>
                  </tr>
                )}
                
                {selectedRecord.fixed_custom3_name && (
                  <tr>
                    <td>{selectedRecord.fixed_custom3_name}</td>
                    <td>{formatCurrency(selectedRecord.fixed_custom3_amount)}</td>
                  </tr>
                )}
                
                <tr className="subtotal">
                  <td><strong>小計(A)</strong></td>
                  <td><strong>{formatCurrency(selectedRecord.subtotal_A)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* 非固定支付項目 セクション */}
          <div className="payroll-section">
            <h4 className="section-title">非固定支付項目</h4>
            <table className="payroll-table">
              <thead>
                <tr>
                  <th>項目</th>
                  <th>金額</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>平日加班費</td>
                  <td>{formatCurrency(selectedRecord.overtime_weekday)}</td>
                </tr>
                
                <tr>
                  <td>休假日加班費</td>
                  <td>{formatCurrency(selectedRecord.overtime_holiday)}</td>
                </tr>
                
                <tr>
                  <td>休息日加班費</td>
                  <td>{formatCurrency(selectedRecord.overtime_restday)}</td>
                </tr>
                
                <tr>
                  <td>國定假日加班費</td>
                  <td>{formatCurrency(selectedRecord.overtime_national)}</td>
                </tr>
                
                <tr>
                  <td>獎金</td>
                  <td>{formatCurrency(selectedRecord.bonus)}</td>
                </tr>
                
                {selectedRecord.variable_custom1_name && (
                  <tr>
                    <td>{selectedRecord.variable_custom1_name}</td>
                    <td>{formatCurrency(selectedRecord.variable_custom1_amount)}</td>
                  </tr>
                )}
                
                {selectedRecord.variable_custom2_name && (
                  <tr>
                    <td>{selectedRecord.variable_custom2_name}</td>
                    <td>{formatCurrency(selectedRecord.variable_custom2_amount)}</td>
                  </tr>
                )}
                
                {selectedRecord.variable_custom3_name && (
                  <tr>
                    <td>{selectedRecord.variable_custom3_name}</td>
                    <td>{formatCurrency(selectedRecord.variable_custom3_amount)}</td>
                  </tr>
                )}
                
                <tr className="subtotal">
                  <td><strong>小計(B)</strong></td>
                  <td><strong>{formatCurrency(selectedRecord.subtotal_B)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* 應代扣項目 セクション */}
          <div className="payroll-section">
            <h4 className="section-title">應代扣項目</h4>
            <table className="payroll-table">
              <thead>
                <tr>
                  <th>項目</th>
                  <th>金額</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>勞保費</td>
                  <td>{formatCurrency(selectedRecord.labor_insurance)}</td>
                </tr>
                
                <tr>
                  <td>健保費</td>
                  <td>{formatCurrency(selectedRecord.health_insurance)}</td>
                </tr>
                
                <tr>
                  <td>國保</td>
                  <td>{formatCurrency(selectedRecord.national_insurance)}</td>
                </tr>
                
                <tr>
                  <td>事假扣款</td>
                  <td>{formatCurrency(selectedRecord.absence_deduction)}</td>
                </tr>
                
                <tr>
                  <td>病假扣款</td>
                  <td>{formatCurrency(selectedRecord.sick_deduction)}</td>
                </tr>
                
                {selectedRecord.deduct_custom1_name && (
                  <tr>
                    <td>{selectedRecord.deduct_custom1_name}</td>
                    <td>{formatCurrency(selectedRecord.deduct_custom1_amount)}</td>
                  </tr>
                )}
                
                {selectedRecord.deduct_custom2_name && (
                  <tr>
                    <td>{selectedRecord.deduct_custom2_name}</td>
                    <td>{formatCurrency(selectedRecord.deduct_custom2_amount)}</td>
                  </tr>
                )}
                
                {selectedRecord.deduct_custom3_name && (
                  <tr>
                    <td>{selectedRecord.deduct_custom3_name}</td>
                    <td>{formatCurrency(selectedRecord.deduct_custom3_amount)}</td>
                  </tr>
                )}
                
                <tr className="subtotal">
                  <td><strong>小計(C)</strong></td>
                  <td><strong>{formatCurrency(selectedRecord.subtotal_C)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* 合計 セクション */}
          <div className="payroll-section total-section">
            <h4 className="section-title">合計</h4>
            <table className="payroll-table">
              <tbody>
                <tr className="total">
                  <td><strong>總計 (A+B-C)</strong></td>
                  <td><strong>{formatCurrency(calculateTotal(selectedRecord))}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
