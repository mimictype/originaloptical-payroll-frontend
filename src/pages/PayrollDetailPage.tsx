import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchEmployeePayroll, fetchEmployeeLeave, CACHE_KEYS } from '../services/api';
import { getCache } from '../utils/cache';
import type { Record, LeaveDetail } from '../types';
import type { Employee } from '../types/employee';
import './pageStyles.css';

const PayrollDetailPage = () => {
  const { employeeId, year, month } = useParams<{
    employeeId: string;
    year: string;
    month: string;
  }>();

  const [record, setRecord] = useState<Record | null>(null);
  const [leaveDetail, setLeaveDetail] = useState<LeaveDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // キャッシュから従業員基本情報を取得する関数
  const getEmployeeFromCache = (employeeId: string): Employee | null => {
    const cachedEmployees = getCache<Employee[]>(CACHE_KEYS.EMPLOYEES);
    if (cachedEmployees) {
      return cachedEmployees.find(emp => emp.employee_id === employeeId) || null;
    }
    return null;
  };

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
        
        // キャッシュから従業員の基本情報を取得（あれば）
        const cachedEmployee = getEmployeeFromCache(employeeId);
        
        // 給与明細と休暇明細を並行して取得
        const [payrollData, leaveData] = await Promise.allSettled([
          fetchEmployeePayroll(employeeId, yearNum, monthNum, true),
          fetchEmployeeLeave(employeeId, yearNum, monthNum, true)
        ]);
        
        // 給与明細の処理
        if (payrollData.status === 'fulfilled') {
          // もしキャッシュから基本情報が取得できた場合、APIから返された給与明細にマージ
          let payrollRecord = payrollData.value;
          
          // キャッシュに従業員の基本情報があれば、そのデータで上書き
          if (cachedEmployee) {
            console.log('Using cached employee data for basic info');
            // 基本情報をキャッシュから補完（nameやemailなど）
            payrollRecord = {
              ...payrollRecord,
              employee_id: cachedEmployee.employee_id,
              name: payrollRecord.name || cachedEmployee.name,
              user_email: payrollRecord.user_email || cachedEmployee.user_email,
              bank_name: payrollRecord.bank_name || cachedEmployee.bank_name,
              bank_account: payrollRecord.bank_account || cachedEmployee.bank_account.toString()
            };
          }
          
          setRecord(payrollRecord);
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

  const formatPayrollDate = (pay_date: string) => {
    const match = pay_date.match(/(\d{3})-(\d{2})/);
    if (match) {
      const [, year, month] = match;
      return `${year}年${parseInt(month)}月`;
    }
    return pay_date;
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
        <Link to="/payroll-query" className="back-button">
          ← 薪資發放明細査詢
        </Link>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="error-container">
        <div className="error">給与明細が見つかりませんでした</div>
        <Link to="/payroll-query" className="back-button">
          ← 薪資發放明細査詢
        </Link>
      </div>
    );
  }

  return (
    <div className="payroll-detail-page">
      <div className="navigation-header">
        <Link to="/payroll-query" className="back-button">
          ← 薪資發放明細査詢
        </Link>
        <h1>傑夫眼鏡行</h1>
        <h2>{formatPayrollDate(record.pay_date)}薪資發放明細表</h2>
      </div>

      {/* 基本情報 セクション */}
      <div className="payroll-section">
        <h4 className="section-title">基本情報</h4>
        <div className="basic-info">
          <div className="payroll-section">
            <table className="payroll-table">
              <tbody>
                <tr>
                  <td>員工ID</td>
                  <td>{record.employee_id}</td>
                </tr>
                <tr>
                  <td>姓名</td>
                  <td>{record.name}</td>
                </tr>
                <tr>
                  <td>Email</td>
                  <td>{record.user_email}</td>
                </tr>
                <tr>
                  <td>發薪日期</td>
                  <td>{record.pay_date}</td>
                </tr>
                <tr>
                  <td>銀行</td>
                  <td>{record.bank_name}</td>
                </tr>
                <tr>
                  <td>帳號</td>
                  <td>{record.bank_account}</td>
                </tr>
                </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 薪資明細 セクション */}
      <div className="payroll-section">
        <h4 className="section-title">薪資明細</h4>
        <div className="salary-details">
          {/* 固定薪資結構 */}
          <div className="salary-section">
            <h5>固定薪資結構</h5>
            <table className="payroll-table">
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
                
                <tr>
                  <td><strong>小計(A)</strong></td>
                  <td><strong>{formatCurrency(record.subtotal_A)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 非固定支付項目 */}
          <div className="salary-section">
            <h5>非固定支付項目</h5>
            <table className="payroll-table">
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
                
                <tr>
                  <td><strong>小計(B)</strong></td>
                  <td><strong>{formatCurrency(record.subtotal_B)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 應代扣項目 */}
          <div className="salary-section">
            <h5>應代扣項目</h5>
            <table className="payroll-table">
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
                
                <tr>
                  <td><strong>小計(C)</strong></td>
                  <td><strong>{formatCurrency(record.subtotal_C)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 合計 */}
          <div className="salary-section">
            <h5>合計</h5>
            <table className="payroll-table">
              <tbody>
                <tr>
                  <td><strong>總計 (A+B-C)</strong></td>
                  <td><strong>{formatCurrency(calculateTotal(record))}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 休暇明細 セクション */}
      {leaveDetail && (
        <div className="payroll-section">
          <h4 className="section-title">休假明細</h4>
          <div className="leave-details">
            {/* 特別休暇セクション */}
            <div className="leave-section">
              <h5>特別休假</h5>
              <table className="payroll-table">
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
                  <tr>
                    <td>今年未休的特別休假日數</td>
                    <td>{leaveDetail.remaining_days}日</td>
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

            {/* 代休セクション */}
            <div className="leave-section">
              <h5>加班補休</h5>
              <table className="payroll-table">
                <tbody>
                  <tr>
                    <td>勞雇雙方的定之補休期限</td>
                    <td>{formatDate(leaveDetail.comp_expiry)}</td>
                  </tr>
                  <tr>
                    <td>至上月底止休未補休時數（I）</td>
                    <td>{leaveDetail.carryover_hours}時間</td>
                  </tr>
                  <tr>
                    <td>本月選擇補休時數（II）</td>
                    <td>{leaveDetail.granted_hours}時間</td>
                  </tr>
                  <tr>
                    <td>本月已補休時數（III）</td>
                    <td>{leaveDetail.used_hours}時間</td>
                  </tr>
                  <tr>
                    <td>屆期未休補折發工資時數（IV）</td>
                    <td>{leaveDetail.cashout_hours}時間</td>
                  </tr>
                  <tr>
                    <td>至本月止休未休補休時數（I+II-III-IV）</td>
                    <td>{leaveDetail.remaining_hours}時間</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollDetailPage;
