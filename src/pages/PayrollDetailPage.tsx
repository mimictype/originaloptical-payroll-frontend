import { getEmployeePayroll, getEmployeeLeave, getEmployee } from '../services/getData';
import { useState, useEffect } from 'react';
import { useParams} from 'react-router-dom';
import type { PayrollData, LeaveData, EmployeeData} from '../types/index';
import './pageStyles.css';
import SalarySection from '../components/SalarySection';
import Section from '../components/Section';
import LoadingSpinner from '../components/LoadingSpinner';
import BackButton from '../components/BackButton';
import EmployeeInfo from '../components/EmployeeInfo';

const PayrollDetailPage = () => {
  const { employeeId, year, month } = useParams<{
    employeeId: string;
    year: string;
    month: string;
  }>();

  const [record, setRecord] = useState<PayrollData | null>(null);
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [leaveDetail, setLeaveDetail] = useState<LeaveData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getPayrollDetail = async () => {
      if (!employeeId || !year || !month) {
        setError('未指定員工ID與年月');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const yearNum = parseInt(year, 10);
        const monthNum = parseInt(month, 10);
        // 給与明細・休暇明細を並行して取得
        const [payrollData, leaveData] = await Promise.all([
          getEmployeePayroll(employeeId, yearNum, monthNum),
          getEmployeeLeave(employeeId, yearNum, monthNum)
        ]);
        setRecord(payrollData);
        setLeaveDetail(leaveData);
        // 従業員情報を取得
        const employee = await getEmployee(employeeId);
        if (employee) {
          setEmployee(employee);
        } else {
          console.warn('無法取得員工資訊');
          setEmployee(null);
        }
        setError(null);
      } catch (err) {
        console.error('資料取得失敗', err);
        setError('資料取得失敗，請再試一次。');
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

  const formatPayrollDate = (pay_date: number) => {
    const dateStr = pay_date.toString();
    // 民国年7桁 (例: 1140816)
    if (dateStr.length === 7) {
      const year = dateStr.substring(0, 3);
      const month = dateStr.substring(3, 5).replace(/^0/, '');
      return `${year}年${month}月`;
    }
    return pay_date;
  };

  const calculateTotal = (record: PayrollData) => {
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
        <div className="error">找不到薪資明細</div>
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
        <h5>發薪日期: {formatDate(record.pay_date)}</h5>
      </div>
      {/* 基本情報 セクション */}
      {employee ? <EmployeeInfo employee={employee} showEmail={false}/> : <div>無法取得員工資訊</div>}

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
                { label: '經過遞延日數', value: `${leaveDetail.carryover_days}` },
                { label: '今年可休日數', value: `${leaveDetail.granted_days}` },
                { label: '今年已休日數', value: `${leaveDetail.used_days}` },
                { label: '今年未休日數', value: `${leaveDetail.remaining_days}` },
                ...(leaveDetail.thismonth_leave_days ? [{ label: '今月請休日', value: leaveDetail.thismonth_leave_days }] : [])
              ]}
            />
            <SalarySection
              title="加班補休"
              rows={[ 
                { label: '勞雇約定之補休期限', value: formatDate(leaveDetail.comp_expiry) },
                { label: '至上月底止休未補休時數(I)', value: `${leaveDetail.carryover_hours}` },
                { label: '本月選擇補休時數(II)', value: `${leaveDetail.granted_hours}` },
                { label: '本月已補休時數(III)', value: `${leaveDetail.used_hours}` },
                { label: '未休補折發工資時數(IV)', value: `${leaveDetail.cashout_hours}` },
                { label: '休未休補休時數(I+II-III-IV)', value: `${leaveDetail.remaining_hours}` }
              ]}
            />
          </div>
        </Section>
      )}
    </div>
  );
};

export default PayrollDetailPage;
