import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchEmployeePayroll, fetchEmployeeLeave } from '../services/api';
import type { Record, LeaveDetail } from '../types';
import './pageStyles.css';

const PayrollDetail = () => {
  const { employeeId, year, month } = useParams<{
    employeeId: string;
    year: string;
    month: string;
  }>();

  const [record, setRecord] = useState<Record | null>(null);
  const [leaveDetail, setLeaveDetail] = useState<LeaveDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getPayrollDetail = async () => {
      if (!employeeId || !year || !month) {
        setError('従業員IDと年月が指定されていません');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const yearNum = parseInt(year, 10);
        const monthNum = parseInt(month, 10);
        
        // 給与明細と休暇明細を並行して取得
        const [payrollData, leaveData] = await Promise.allSettled([
          fetchEmployeePayroll(employeeId, yearNum, monthNum, true),
          fetchEmployeeLeave(employeeId, yearNum, monthNum, true)
        ]);
        
        // 給与明細の処理
        if (payrollData.status === 'fulfilled') {
          setRecord(payrollData.value);
        } else {
          console.error('給与明細の取得に失敗しました', payrollData.reason);
          throw new Error('給与明細の取得に失敗しました');
        }
        
        // 休暇明細の処理（失敗してもエラーにしない）
        if (leaveData.status === 'fulfilled') {
          setLeaveDetail(leaveData.value);
        } else {
          console.warn('休暇明細の取得に失敗しました', leaveData.reason);
          setLeaveDetail(null);
        }
        
        setError(null);
      } catch (err) {
        console.error('データの取得に失敗しました', err);
        setError('データの取得に失敗しました。再読み込みをお試しください。');
      } finally {
        setLoading(false);
      }
    };

    getPayrollDetail();
  }, [employeeId, year, month]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateNum: number) => {
    const dateStr = dateNum.toString();
    if (dateStr.length === 7) {
      // Format: YYYMMDD (民国年)
      const year = dateStr.substring(0, 3);
      const month = dateStr.substring(3, 5);
      const day = dateStr.substring(5, 7);
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  };

  const calculateTotal = (record: Record) => {
    return record.subtotal_A + record.subtotal_B - record.subtotal_C;
  };

  if (loading) {
    return <div className="loading">明細を読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <Link to="/employees" className="back-button">
          従業員一覧に戻る
        </Link>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="error-container">
        <div className="error">給与明細が見つかりませんでした</div>
        <Link to="/employees" className="back-button">
          従業員一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="payroll-detail-page">
      <div className="navigation-header">
        <Link to="/employees" className="back-button">
          ← 従業員一覧に戻る
        </Link>
        <h2>{record.name} の薪資詳細資料 ({record.pay_date})</h2>
      </div>

      {/* 基本情報 セクション */}
      <div className="payroll-section">
        <h4 className="section-title">基本情報</h4>
        <div className="basic-info">
          <div className="info-item">
            <span className="label">員工ID：</span>
            <span className="value">{record.employee_id}</span>
          </div>
          <div className="info-item">
            <span className="label">姓名：</span>
            <span className="value">{record.name}</span>
          </div>
          <div className="info-item">
            <span className="label">Email：</span>
            <span className="value">{record.user_email}</span>
          </div>
          <div className="info-item">
            <span className="label">發薪日期：</span>
            <span className="value">{record.pay_date}</span>
          </div>
          <div className="info-item">
            <span className="label">銀行：</span>
            <span className="value">{record.bank_name}</span>
          </div>
          <div className="info-item">
            <span className="label">帳號：</span>
            <span className="value">{record.bank_account}</span>
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
              <td>{formatCurrency(record.base_salary)}</td>
            </tr>
            <tr>
              <td>伙食津貼</td>
              <td>{formatCurrency(record.meal_allowance)}</td>
            </tr>
            
            {record.fixed_custom1_name && (
              <tr>
                <td>{record.fixed_custom1_name}</td>
                <td>{formatCurrency(record.fixed_custom1_amount)}</td>
              </tr>
            )}
            
            {record.fixed_custom2_name && (
              <tr>
                <td>{record.fixed_custom2_name}</td>
                <td>{formatCurrency(record.fixed_custom2_amount)}</td>
              </tr>
            )}
            
            {record.fixed_custom3_name && (
              <tr>
                <td>{record.fixed_custom3_name}</td>
                <td>{formatCurrency(record.fixed_custom3_amount)}</td>
              </tr>
            )}
            
            <tr className="subtotal">
              <td><strong>小計(A)</strong></td>
              <td><strong>{formatCurrency(record.subtotal_A)}</strong></td>
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
              <td>{formatCurrency(record.overtime_weekday)}</td>
            </tr>
            
            <tr>
              <td>休假日加班費</td>
              <td>{formatCurrency(record.overtime_holiday)}</td>
            </tr>
            
            <tr>
              <td>休息日加班費</td>
              <td>{formatCurrency(record.overtime_restday)}</td>
            </tr>
            
            <tr>
              <td>國定假日加班費</td>
              <td>{formatCurrency(record.overtime_national)}</td>
            </tr>
            
            <tr>
              <td>獎金</td>
              <td>{formatCurrency(record.bonus)}</td>
            </tr>
            
            {record.variable_custom1_name && (
              <tr>
                <td>{record.variable_custom1_name}</td>
                <td>{formatCurrency(record.variable_custom1_amount)}</td>
              </tr>
            )}
            
            {record.variable_custom2_name && (
              <tr>
                <td>{record.variable_custom2_name}</td>
                <td>{formatCurrency(record.variable_custom2_amount)}</td>
              </tr>
            )}
            
            {record.variable_custom3_name && (
              <tr>
                <td>{record.variable_custom3_name}</td>
                <td>{formatCurrency(record.variable_custom3_amount)}</td>
              </tr>
            )}
            
            <tr className="subtotal">
              <td><strong>小計(B)</strong></td>
              <td><strong>{formatCurrency(record.subtotal_B)}</strong></td>
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
              <td>{formatCurrency(record.labor_insurance)}</td>
            </tr>
            
            <tr>
              <td>健保費</td>
              <td>{formatCurrency(record.health_insurance)}</td>
            </tr>
            
            <tr>
              <td>國保</td>
              <td>{formatCurrency(record.national_insurance)}</td>
            </tr>
            
            <tr>
              <td>事假扣款</td>
              <td>{formatCurrency(record.absence_deduction)}</td>
            </tr>
            
            <tr>
              <td>病假扣款</td>
              <td>{formatCurrency(record.sick_deduction)}</td>
            </tr>
            
            {record.deduct_custom1_name && (
              <tr>
                <td>{record.deduct_custom1_name}</td>
                <td>{formatCurrency(record.deduct_custom1_amount)}</td>
              </tr>
            )}
            
            {record.deduct_custom2_name && (
              <tr>
                <td>{record.deduct_custom2_name}</td>
                <td>{formatCurrency(record.deduct_custom2_amount)}</td>
              </tr>
            )}
            
            {record.deduct_custom3_name && (
              <tr>
                <td>{record.deduct_custom3_name}</td>
                <td>{formatCurrency(record.deduct_custom3_amount)}</td>
              </tr>
            )}
            
            <tr className="subtotal">
              <td><strong>小計(C)</strong></td>
              <td><strong>{formatCurrency(record.subtotal_C)}</strong></td>
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
              <td><strong>{formatCurrency(calculateTotal(record))}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 休暇明細 セクション */}
      {leaveDetail && (
        <div className="payroll-section">
          <h4 className="section-title">休暇明細</h4>
          <div className="leave-details">
            <div className="leave-section">
              <h5>休暇日数</h5>
              <table className="payroll-table">
                <thead>
                  <tr>
                    <th>項目</th>
                    <th>日数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>經過遞延的特別休假日數</td>
                    <td>{leaveDetail.carryover_days}日</td>
                  </tr>
                  <tr>
                    <td>今年可休的特別休假日數</td>
                    <td>{leaveDetail.granted_days}日</td>
                  </tr>
                  <tr>
                    <td>今年已休的特別休假日數</td>
                    <td>{leaveDetail.used_days}日</td>
                  </tr>
                  <tr className="subtotal">
                    <td><strong>今年未休的特別休假日數</strong></td>
                    <td><strong>{leaveDetail.remaining_days}日</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="leave-section">
              <h5>代休時間</h5>
              <table className="payroll-table">
                <thead>
                  <tr>
                    <th>項目</th>
                    <th>時間</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>至上月底止休未補休時數</td>
                    <td>{leaveDetail.carryover_hours}時間</td>
                  </tr>
                  <tr>
                    <td>本月選擇補休時數</td>
                    <td>{leaveDetail.granted_hours}時間</td>
                  </tr>
                  <tr>
                    <td>本月已補休時數</td>
                    <td>{leaveDetail.used_hours}時間</td>
                  </tr>
                  <tr>
                    <td>屆期未休補折發工資時數</td>
                    <td>{leaveDetail.cashout_hours}時間</td>
                  </tr>
                  <tr className="subtotal">
                    <td><strong>至本月止休未休補休時數</strong></td>
                    <td><strong>{leaveDetail.remaining_hours}時間</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="leave-section">
              <h5>期間・予定</h5>
              <table className="payroll-table">
                <thead>
                  <tr>
                    <th>項目</th>
                    <th>内容</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>請休期間開始</td>
                    <td>{formatDate(leaveDetail.leave_start)}</td>
                  </tr>
                  <tr>
                    <td>請休期間結束</td>
                    <td>{formatDate(leaveDetail.leave_end)}</td>
                  </tr>
                  <tr>
                    <td>勞雇雙方的定之補休期限</td>
                    <td>{formatDate(leaveDetail.comp_expiry)}</td>
                  </tr>
                  {leaveDetail.thismonth_leave_days && (
                    <tr>
                      <td>今月特別休假的請休日</td>
                      <td>{leaveDetail.thismonth_leave_days}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollDetail;
