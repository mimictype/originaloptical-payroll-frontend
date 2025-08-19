import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchEmployeePayroll, fetchEmployeeLeave, CACHE_KEYS } from '../services/api';
import { getCache } from '../utils/cache';
import type { Record, LeaveDetail } from '../types';
import type { Employee } from '../types/employee';
import './pageStyles.css';
import SalarySection from '../components/SalarySection';
import Section from '../components/Section';
import LoadingSpinner from '../components/LoadingSpinner';
import BackButton from '../components/BackButton';

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
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
          <BackButton label='薪資發放明細査詢' navigateTo='/payroll-query'/>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="error-container">
        <div className="error">給与明細が見つかりませんでした</div>
          <BackButton label='薪資發放明細査詢' navigateTo='/payroll-query'/>
      </div>
    );
  }

  return (
    <div className="payroll-detail-page">
      <div className="navigation-header">
        <BackButton label='薪資發放明細査詢' navigateTo='/payroll-query'/>
        <h1>傑夫眼鏡行</h1>
        <h2>{formatPayrollDate(record.pay_date)}薪資發放明細表</h2>
      </div>

      {/* 基本情報 セクション */}
      <div className="payroll-section">
        <h4 className="section-title">基本情報</h4>
        <div className="basic-info">
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

      {/* 薪資明細 セクション */}
      <Section title="薪資明細">
        <div className="salary-details">
          <SalarySection
            title="固定薪資結構"
            rows={[
              { label: '底薪', value: formatCurrency(record.base_salary) },
              { label: '伙食津貼', value: formatCurrency(record.meal_allowance) },
              ...(record.fixed_custom1_name ? [{ label: record.fixed_custom1_name, value: formatCurrency(record.fixed_custom1_amount) }] : []),
              ...(record.fixed_custom2_name ? [{ label: record.fixed_custom2_name, value: formatCurrency(record.fixed_custom2_amount) }] : []),
              ...(record.fixed_custom3_name ? [{ label: record.fixed_custom3_name, value: formatCurrency(record.fixed_custom3_amount) }] : []),
            ]}
            subtotalLabel="小計(A)"
            subtotalValue={formatCurrency(record.subtotal_A)}
          />
          <SalarySection
            title="非固定支付項目"
            rows={[
              { label: '平日加班費', value: formatCurrency(record.overtime_weekday) },
              { label: '休假日加班費', value: formatCurrency(record.overtime_holiday) },
              { label: '休息日加班費', value: formatCurrency(record.overtime_restday) },
              { label: '國定假日加班費', value: formatCurrency(record.overtime_national) },
              { label: '獎金', value: formatCurrency(record.bonus) },
              ...(record.variable_custom1_name ? [{ label: record.variable_custom1_name, value: formatCurrency(record.variable_custom1_amount) }] : []),
              ...(record.variable_custom2_name ? [{ label: record.variable_custom2_name, value: formatCurrency(record.variable_custom2_amount) }] : []),
              ...(record.variable_custom3_name ? [{ label: record.variable_custom3_name, value: formatCurrency(record.variable_custom3_amount) }] : []),
            ]}
            subtotalLabel="小計(B)"
            subtotalValue={formatCurrency(record.subtotal_B)}
          />
          <SalarySection
            title="應代扣項目"
            rows={[
              { label: '勞保費', value: formatCurrency(record.labor_insurance) },
              { label: '健保費', value: formatCurrency(record.health_insurance) },
              { label: '國保', value: formatCurrency(record.national_insurance) },
              { label: '事假扣款', value: formatCurrency(record.absence_deduction) },
              { label: '病假扣款', value: formatCurrency(record.sick_deduction) },
              ...(record.deduct_custom1_name ? [{ label: record.deduct_custom1_name, value: formatCurrency(record.deduct_custom1_amount) }] : []),
              ...(record.deduct_custom2_name ? [{ label: record.deduct_custom2_name, value: formatCurrency(record.deduct_custom2_amount) }] : []),
              ...(record.deduct_custom3_name ? [{ label: record.deduct_custom3_name, value: formatCurrency(record.deduct_custom3_amount) }] : []),
            ]}
            subtotalLabel="小計(C)"
            subtotalValue={formatCurrency(record.subtotal_C)}
          />
          <SalarySection
            title="合計"
            rows={[]}
            subtotalLabel="總計 (A+B-C)"
            subtotalValue={formatCurrency(calculateTotal(record))}
          />
        </div>
      </Section>

      {/* 休暇明細 セクション */}
      {leaveDetail && (
        <Section title="休假明細">
          <div className="leave-details">
            <SalarySection
              title="特別休假"
              rows={[ 
                { label: '請休期間開始', value: formatDate(leaveDetail.leave_start) },
                { label: '請休期間結束', value: formatDate(leaveDetail.leave_end) },
                { label: '經過遞延日數', value: `${leaveDetail.carryover_days}日` },
                { label: '今年可休日數', value: `${leaveDetail.granted_days}日` },
                { label: '今年已休日數', value: `${leaveDetail.used_days}日` },
                { label: '今年未休日數', value: `${leaveDetail.remaining_days}日` },
                ...(leaveDetail.thismonth_leave_days ? [{ label: '今月請休日', value: leaveDetail.thismonth_leave_days }] : [])
              ]}
            />
            <SalarySection
              title="加班補休"
              rows={[ 
                { label: '勞雇約定之補休期限', value: formatDate(leaveDetail.comp_expiry) },
                { label: '至上月底止休未補休時數(I)', value: `${leaveDetail.carryover_hours}小時` },
                { label: '本月選擇補休時數(II)', value: `${leaveDetail.granted_hours}小時` },
                { label: '本月已補休時數(III)', value: `${leaveDetail.used_hours}小時` },
                { label: '屆期未休補折發工資時數(IV)', value: `${leaveDetail.cashout_hours}小時` },
                { label: '至本月止休未休補休時數(I+II-III-IV)', value: `${leaveDetail.remaining_hours}小時` }
              ]}
            />
          </div>
        </Section>
      )}
    </div>
  );
};

export default PayrollDetailPage;
