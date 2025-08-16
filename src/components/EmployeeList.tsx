import { useState, useEffect } from 'react';
import { fetchRecords, fetchEmployees } from '../services/api';
import type { Record } from '../types';
import type { Employee } from '../types/employee';
import DateSelector from './DateSelector';
import EmployeeSelect from './EmployeeSelect';

const EmployeeList = () => {
  const [records, setRecords] = useState<Record[]>([]);
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

  // 日期変更時の処理
  const handleDateChange = (year: number, month: number) => {
    console.log(`EmployeeList received date change: ${year}年 ${month}月`);
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  // レコード読み込み
  useEffect(() => {
    console.log(`Fetching records for: ${selectedYear}年 ${selectedMonth}月`);
    
    const getRecords = async () => {
      try {
        setLoading(true);
        const data = await fetchRecords(selectedYear, selectedMonth);
        console.log(`Fetched ${data.length} records for ${selectedYear}年 ${selectedMonth}月`);
        setRecords(data);
        setSelectedRecord(null); // 日付変更時に選択を解除
        setError(null);
      } catch (err) {
        setError('獲取薪資記錄失敗，請稍後再試。');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getRecords();
  }, [selectedYear, selectedMonth]);

  // 従業員データの読み込み
  useEffect(() => {
    const getEmployees = async () => {
      try {
        const data = await fetchEmployees();
        console.log(`Fetched ${data.length} employees`);
        setEmployees(data);
      } catch (err) {
        console.error('従業員データの取得に失敗しました', err);
        // エラーメッセージは表示しない（オプション）
      }
    };

    getEmployees();
  }, []);

  const handleRecordSelect = (record: Record) => {
    setSelectedRecord(record);
    // 選択後に詳細までスクロール
    setTimeout(() => {
      document.querySelector('.payroll-details')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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

  // テーブル列を従業員ID、名前、詳細ボタンのみに制限
  const tableColumns = [
    { key: 'employee_id', label: '員工ID' },
    { key: 'name', label: '姓名' },
    { key: 'action', label: '操作' }
  ];

  return (
    <div className="employee-list-container">
      <h2>薪資記錄列表</h2>
      
      {/* 年月選擇器 */}
      <DateSelector onDateChange={handleDateChange} />
      
      {/* 従業員選択 */}
      {employees.length > 0 && (
        <EmployeeSelect
          employees={employees}
          onSelectEmployee={(employee) => {
            console.log(`Selected employee: ${employee.name}`);
            // 選択した従業員の記録を探す
            const employeeRecord = records.find(record => record.employee_id === employee.employee_id);
            if (employeeRecord) {
              handleRecordSelect(employeeRecord);
            } else {
              // 選択した従業員の記録がない場合はメッセージを表示
              setError(`${employee.name}の${selectedYear}年${selectedMonth}月の給与記録は見つかりませんでした。`);
              setTimeout(() => setError(null), 3000); // 3秒後にエラーメッセージを消す
            }
          }}
        />
      )}
      
      {loading && <p>載入中...</p>}
      
      {error && <div className="error">{error}</div>}
      
      {!loading && !error && records.length === 0 && (
        <div className="empty-state">
          <p>該月份沒有薪資記錄</p>
        </div>
      )}
      
      {!loading && !error && records.length > 0 && !selectedRecord && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                {tableColumns.map(column => (
                  <th key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr 
                  key={record.id}
                  onClick={() => handleRecordSelect(record)}
                >
                  <td>{record.employee_id}</td>
                  <td>{record.name}</td>
                  <td>
                    <button 
                      className="detail-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRecordSelect(record);
                      }}
                    >
                      詳細
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedRecord && (
        <div className="payroll-details">
          <div className="payroll-details-header">
            <h3>{selectedRecord.name} 的薪資詳細資料 ({selectedRecord.pay_date})</h3>
            <button 
              className="close-details"
              onClick={() => setSelectedRecord(null)}
            >
              ← 返回列表
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
