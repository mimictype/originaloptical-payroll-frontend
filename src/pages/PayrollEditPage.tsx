import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { LeaveData, PayrollData } from '../types/index';
import EditableSalarySection from '../components/EditableSalarySection';
import SalarySection from '../components/SalarySection';
import Section from '../components/Section';
import BackButton from '../components/BackButton';
import './pageStyles.css';
import { getEmployeePayroll, getEmployeeLeave } from '../services/getData';
import LoadingSpinner from '../components/LoadingSpinner';

const PayrollEditPage: React.FC = () => {
  // URLパラメータから従業員ID・年月取得
  const { employeeId, year, month } = useParams<{
    employeeId: string;
    year: string;
    month: string;
  }>();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // APIから取得したデータ
  const [record, setRecord] = useState<PayrollData | null>(null);

  const [leaveDetail, setLeaveDetail] = useState<LeaveData | null>(null);

  // データ取得処理
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
        // getData.tsの関数を利用
        const payrollData = await getEmployeePayroll(employeeId, yearNum, monthNum);
        const leaveData = await getEmployeeLeave(employeeId, yearNum, monthNum);
        setRecord(payrollData);
        setLeaveDetail(leaveData);
        setError(null);
      } catch (err) {
        setError('データの取得に失敗しました。再読み込みをお試しください。');
      } finally {
        setLoading(false);
      }
    };
    getPayrollDetail();
  }, [employeeId, year, month]);
  // 休暇明細編集時のコールバック
  const handleLeaveChange = (rows: Array<{ label: string; value: string }>) => {
    setLeaveDetail(prev => prev ? {
      ...prev,
      carryover_days: Number(rows[2]?.value) || 0,
      granted_days: Number(rows[3]?.value) || 0,
      used_days: Number(rows[4]?.value) || 0,
      // 他の項目も必要なら追加
    } : prev);
  };


  // EditableSalarySectionのonChange用コールバック
  const handleFixedChange = (rows: Array<{ label: string; value: string }>) => {
    setRecord(prev => prev ? ({
      ...prev,
      base_salary: Number(rows[0]?.value) || 0,
      meal_allowance: Number(rows[1]?.value) || 0,
      fixed_custom1_amount: Number(rows[2]?.value) || 0,
      fixed_custom2_amount: Number(rows[3]?.value) || 0,
      fixed_custom3_amount: Number(rows[4]?.value) || 0,
    }) : prev);
  };

  const handleVariableChange = (rows: Array<{ label: string; value: string }>) => {
    setRecord(prev => prev ? ({
      ...prev,
      overtime_weekday: Number(rows[0]?.value) || 0,
      overtime_holiday: Number(rows[1]?.value) || 0,
      overtime_restday: Number(rows[2]?.value) || 0,
      overtime_national: Number(rows[3]?.value) || 0,
      bonus: Number(rows[4]?.value) || 0,
      variable_custom1_amount: Number(rows[5]?.value) || 0,
      variable_custom2_amount: Number(rows[6]?.value) || 0,
      variable_custom3_amount: Number(rows[7]?.value) || 0,
    }) : prev);
  };

  const handleDeductChange = (rows: Array<{ label: string; value: string }>) => {
    setRecord(prev => prev ? ({
      ...prev,
      labor_insurance: Number(rows[0]?.value) || 0,
      health_insurance: Number(rows[1]?.value) || 0,
      national_insurance: Number(rows[2]?.value) || 0,
      absence_deduction: Number(rows[3]?.value) || 0,
      sick_deduction: Number(rows[4]?.value) || 0,
      deduct_custom1_amount: Number(rows[5]?.value) || 0,
      deduct_custom2_amount: Number(rows[6]?.value) || 0,
      deduct_custom3_amount: Number(rows[7]?.value) || 0,
    }) : prev);
  };

  // 固定給 editable rows（カスタム項目は必ず表示）
  const fixedRows = record ? [
    { label: '底薪', value: String(record.base_salary), editableLabel: false },
    { label: '伙食津貼', value: String(record.meal_allowance), editableLabel: false },
    { label: record.fixed_custom1_name || '', value: String(record.fixed_custom1_amount || ''), editableLabel: true },
    { label: record.fixed_custom2_name || '', value: String(record.fixed_custom2_amount || ''), editableLabel: true },
    { label: record.fixed_custom3_name || '', value: String(record.fixed_custom3_amount || ''), editableLabel: true },
  ] : [];
  const fixedTotal = record ? (
    record.base_salary +
    record.meal_allowance +
    (record.fixed_custom1_amount || 0) +
    (record.fixed_custom2_amount || 0) +
    (record.fixed_custom3_amount || 0)
  ) : 0;

  // 非固定 editable rows（カスタム項目は必ず表示）
  const variableRows = record ? [
    { label: '平日加班費', value: String(record.overtime_weekday), editableLabel: false },
    { label: '休假日加班費', value: String(record.overtime_holiday), editableLabel: false },
    { label: '休息日加班費', value: String(record.overtime_restday), editableLabel: false },
    { label: '國定假日加班費', value: String(record.overtime_national), editableLabel: false },
    { label: '獎金', value: String(record.bonus), editableLabel: false },
    { label: record.variable_custom1_name || '', value: String(record.variable_custom1_amount || ''), editableLabel: true },
    { label: record.variable_custom2_name || '', value: String(record.variable_custom2_amount || ''), editableLabel: true },
    { label: record.variable_custom3_name || '', value: String(record.variable_custom3_amount || ''), editableLabel: true },
  ] : [];
  const variableTotal = record ? (
    record.overtime_weekday +
    record.overtime_holiday +
    record.overtime_restday +
    record.overtime_national +
    record.bonus +
    (record.variable_custom1_amount || 0) +
    (record.variable_custom2_amount || 0) +
    (record.variable_custom3_amount || 0)
  ) : 0;

  // 控除 editable rows（カスタム項目は必ず表示）
  const deductRows = record ? [
    { label: '勞保費', value: String(record.labor_insurance), editableLabel: false },
    { label: '健保費', value: String(record.health_insurance), editableLabel: false },
    { label: '國保', value: String(record.national_insurance), editableLabel: false },
    { label: '事假扣款', value: String(record.absence_deduction), editableLabel: false },
    { label: '病假扣款', value: String(record.sick_deduction), editableLabel: false },
    { label: record.deduct_custom1_name || '', value: String(record.deduct_custom1_amount || ''), editableLabel: true },
    { label: record.deduct_custom2_name || '', value: String(record.deduct_custom2_amount || ''), editableLabel: true },
    { label: record.deduct_custom3_name || '', value: String(record.deduct_custom3_amount || ''), editableLabel: true },
  ] : [];
  const deductTotal = record ? (
    record.labor_insurance +
    record.health_insurance +
    record.national_insurance +
    record.absence_deduction +
    record.sick_deduction +
    (record.deduct_custom1_amount || 0) +
    (record.deduct_custom2_amount || 0) +
    (record.deduct_custom3_amount || 0)
  ) : 0;


  // 日付フォーマット関数
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

  // 今年未休日數合計を自動計算
  const remainingDaysTotal = React.useMemo(() => {
    if (!leaveDetail) return '';
    return String(
      Number(leaveDetail.carryover_days || 0) +
      Number(leaveDetail.granted_days || 0) -
      Number(leaveDetail.used_days || 0)
    );
  }, [leaveDetail]);

  if (loading) {
        return <LoadingSpinner />;
  }
  if (error) {
    return (
      <div className="payroll-edit-page">
        <div className="error-container">
          <div className="error">{error}</div>
          <BackButton label="薪資管理" navigateTo="/payroll-management" />
        </div>
      </div>
    );
  }
  if (!record) {
    return (
      <div className="payroll-edit-page">
        <div className="error-container">
          <div className="error">給与明細が見つかりませんでした</div>
          <BackButton label="薪資管理" navigateTo="/payroll-management" />
        </div>
      </div>
    );
  }
  return (
    <div className="payroll-edit-page">
      <div className="navigation-header">
        <BackButton label="薪資管理" navigateTo="/payroll-management" />
        <h1>{record.pay_date}</h1>
        <h2>薪資發放明細修改</h2>
      </div>

      <Section title="薪資明細">
        <EditableSalarySection
          title="固定薪資結構"
          rows={fixedRows}
          showTotal
          totalLabel="小計(A)"
          totalValue={String(fixedTotal)}
          onChange={handleFixedChange}
        />
        <EditableSalarySection
          title="非固定支付項目"
          rows={variableRows}
          showTotal
          totalLabel="小計(B)"
          totalValue={String(variableTotal)}
          onChange={handleVariableChange}
        />
        <EditableSalarySection
          title="應代扣項目"
          rows={deductRows}
          showTotal
          totalLabel="小計(C)"
          totalValue={String(deductTotal)}
          onChange={handleDeductChange}
        />
        <SalarySection
          title="合計"
          rows={[]}
          subtotalLabel="總計 (A+B-C)"
          subtotalValue={String(fixedTotal + variableTotal - deductTotal)}
        />
      </Section>

      {/* 休暇明細 セクション（可編集） */}
      {leaveDetail && (
        <Section title="休假明細">
          <div className="leave-details">
            <EditableSalarySection
              title="特別休假"
              rows={[ 
                { label: '請休期間開始', value: formatDate(leaveDetail.leave_start), editableLabel: false },
                { label: '請休期間結束', value: formatDate(leaveDetail.leave_end), editableLabel: false },
                { label: '經過遞延日數', value: String(leaveDetail.carryover_days), editableLabel: false },
                { label: '今年可休日數', value: String(leaveDetail.granted_days), editableLabel: false },
                { label: '今年已休日數', value: String(leaveDetail.used_days), editableLabel: false },
                { label: '今年未休日數', value: remainingDaysTotal, editableLabel: false, editableValue: false },
                ...(leaveDetail.thismonth_leave_days ? [{ label: '今月請休日', value: leaveDetail.thismonth_leave_days, editableLabel: false }] : [])
              ]}
              onChange={handleLeaveChange}
            />
            <EditableSalarySection
              title="加班補休"
              rows={[ 
                { label: '勞雇約定之補休期限', value: formatDate(leaveDetail.comp_expiry), editableLabel: false },
                { label: '至上月底止休未補休時數', value: String(leaveDetail.carryover_hours), editableLabel: false },
                { label: '本月選擇補休時數', value: String(leaveDetail.granted_hours), editableLabel: false },
                { label: '本月已補休時數', value: String(leaveDetail.used_hours), editableLabel: false },
                { label: '屆期未休補折發工資時數', value: String(leaveDetail.cashout_hours), editableLabel: false },
                { label: '至本月止休未休補休時數', value: String(leaveDetail.remaining_hours), editableLabel: false },
              ]}
            />
          </div>
        </Section>
      )}
    </div>
  );
};

export default PayrollEditPage;
