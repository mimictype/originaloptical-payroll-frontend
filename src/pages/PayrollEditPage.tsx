import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import type { LeaveData, PayrollData } from '../types/index';
import EditableSalarySection from '../components/EditableSalarySection';
import SalarySection from '../components/SalarySection';
import Section from '../components/Section';
import BackButton from '../components/BackButton';
import './pageStyles.css';
import { getEmployeePayroll, getEmployeeLeave } from '../services/getData';
import { updatePayroll, updateLeave, deletePayroll, deleteLeave } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import MButton from '../components/MButton';

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

  const rocDateRegex = /^\d{7}$/;
  const toRocNumber = (value: string | number | undefined | null) => {
    const normalized = String(value ?? '').replace(/-/g, '');
    return rocDateRegex.test(normalized) ? Number(normalized) : undefined;
  };

  const payrollId = useMemo(() => {
    return employeeId && year && month ? `${employeeId}_${String(year)}${String(month).padStart(2, '0')}` : '';
  }, [employeeId, year, month]);

  // 保存ボタン押下時の処理
  const handleSave = async () => {
    if (!record || !leaveDetail) return;
    if (validationErrors.length > 0) return;
    setLoading(true);
    setError(null);
    try {
      // 給与明細更新
      const payrollRes = await updatePayroll({ ...record, pay_date: payDateRoc ?? record.pay_date });
      // 休暇明細更新
      const leaveRes = await updateLeave({
        ...leaveDetail,
        ...(leaveStartRoc !== undefined ? { leave_start: leaveStartRoc } : {}),
        ...(leaveEndRoc !== undefined ? { leave_end: leaveEndRoc } : {}),
        ...(compExpiryRoc !== undefined ? { comp_expiry: compExpiryRoc } : {}),
      });
      if (payrollRes.status !== 'success' || leaveRes.status !== 'success') {
        setError('儲存失敗。');
      } else {
        alert('修改成功');
        window.location.href = '/originaloptical-payroll-frontend';
      }
    } catch (err) {
      setError('儲存失敗。');
    } finally {
      setLoading(false);
    }
  };
      // 給与明細・休暇明細の削除処理
  const handleDelete = async () => {
    if (!record || !leaveDetail || !employeeId || !year || !month) return;
    setLoading(true);
    setError(null);
    try {
      // API設計に合わせてIDを生成（getPayroll/getleaveと同じ形式）
      const monthNum = parseInt(month, 10);
      const monthStr = monthNum.toString().padStart(2, '0');
      const deleteId = `${employeeId}_${year}${monthStr}`;
      // 給与明細削除
      const payrollRes = await deletePayroll(deleteId);
      // 休暇明細削除
      const leaveRes = await deleteLeave(deleteId);
      if (payrollRes.status !== 'success' || leaveRes.status !== 'success') {
        setError('刪除失敗。');
      } else {
        alert('刪除成功');
        // 削除後は一覧ページへ遷移
        window.location.href = '/originaloptical-payroll-frontend';
      }
    } catch (err) {
      setError('刪除失敗。');
    } finally {
      setLoading(false);
    }
  };
  // データ取得処理
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
        // getData.tsの関数を利用
        const payrollData = await getEmployeePayroll(employeeId, yearNum, monthNum);
        const leaveData = await getEmployeeLeave(employeeId, yearNum, monthNum);
        setRecord(payrollData);
        setLeaveDetail(leaveData);
        setError(null);
      } catch (err) {
        setError('資料取得失敗，請再試一次。');
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
      // 0: leave_start, 1: leave_end, 2: carryover_days, 3: granted_days, 4: used_days, 5: remaining_days, 6: thismonth_leave_days
      leave_start: rows[0]?.value ? Number(rows[0].value.replace(/-/g, '')) : 0,
      leave_end: rows[1]?.value ? Number(rows[1].value.replace(/-/g, '')) : 0,
      carryover_days: Number(rows[2]?.value) || 0,
      granted_days: Number(rows[3]?.value) || 0,
      used_days: Number(rows[4]?.value) || 0,
      remaining_days: Number(rows[5]?.value) || (prev.carryover_days + prev.granted_days - prev.used_days),
      thismonth_leave_days: rows[6]?.value || '',
    } : prev);
  };
  // 加班補休編集時のコールバック
  const handleCompLeaveChange = (rows: Array<{ label: string; value: string }>) => {
    setLeaveDetail(prev => prev ? {
      ...prev,
      // 0: comp_expiry, 1: carryover_hours, 2: granted_hours, 3: used_hours, 4: cashout_hours, 5: remaining_hours
      comp_expiry: rows[0]?.value ? Number(rows[0].value.replace(/-/g, '')) : 0,
      carryover_hours: Number(rows[1]?.value) || 0,
      granted_hours: Number(rows[2]?.value) || 0,
      used_hours: Number(rows[3]?.value) || 0,
      cashout_hours: Number(rows[4]?.value) || 0,
      remaining_hours: Number(rows[5]?.value) || (prev.carryover_hours + prev.granted_hours - prev.used_hours - prev.cashout_hours),
    } : prev);
  };

  // EditableSalarySectionのonChange用コールバック
  const handleFixedChange = (rows: Array<{ label: string; value: string }>) => {
    setRecord(prev => prev ? ({
      ...prev,
      base_salary: Number(rows[0]?.value) || 0,
      meal_allowance: Number(rows[1]?.value) || 0,
      fixed_custom1_name: rows[2]?.label || '',
      fixed_custom1_amount: Number(rows[2]?.value) || 0,
      fixed_custom2_name: rows[3]?.label || '',
      fixed_custom2_amount: Number(rows[3]?.value) || 0,
      fixed_custom3_name: rows[4]?.label || '',
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
      variable_custom1_name: rows[5]?.label || '',
      variable_custom1_amount: Number(rows[5]?.value) || 0,
      variable_custom2_name: rows[6]?.label || '',
      variable_custom2_amount: Number(rows[6]?.value) || 0,
      variable_custom3_name: rows[7]?.label || '',
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
      deduct_custom1_name: rows[5]?.label || '',
      deduct_custom1_amount: Number(rows[5]?.value) || 0,
      deduct_custom2_name: rows[6]?.label || '',
      deduct_custom2_amount: Number(rows[6]?.value) || 0,
      deduct_custom3_name: rows[7]?.label || '',
      deduct_custom3_amount: Number(rows[7]?.value) || 0,
    }) : prev);
  };

  // 発薪日期編集用コールバック
  const handlePayDateChange = (rows: Array<{ label: string; value: string }>) => {
    setRecord(prev => prev ? ({
      ...prev,
      pay_date: rows[0]?.value ? Number(rows[0].value.replace(/-/g, '')) : 0,
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

  const payDateRoc = toRocNumber(record?.pay_date);
  const leaveStartRoc = toRocNumber(leaveDetail?.leave_start);
  const leaveEndRoc = toRocNumber(leaveDetail?.leave_end);
  const compExpiryRoc = toRocNumber(leaveDetail?.comp_expiry);

  const validationErrors = useMemo(() => {
    const messages: string[] = [];
    if (!payrollId) messages.push('員工ID與年月資訊不足。');
    if (!record) messages.push('尚未取得薪資資料。');
    if (!leaveDetail) messages.push('尚未取得休假資料。');
    if (record && !payDateRoc) messages.push('請以民國年月日(YYYMMDD)7位數輸入發薪日期。');
    if (leaveDetail && leaveDetail.leave_start && !leaveStartRoc) messages.push('請以民國年(YYYMMDD)7位數輸入請假起始日。');
    if (leaveDetail && leaveDetail.leave_end && !leaveEndRoc) messages.push('請以民國年(YYYMMDD)7位數輸入請假結束日。');
    if (leaveDetail && leaveDetail.comp_expiry && !compExpiryRoc) messages.push('請以民國年(YYYMMDD)7位數輸入勞雇約定之補休期限。');
    return messages;
  }, [payrollId, record, leaveDetail, payDateRoc, leaveStartRoc, leaveEndRoc, compExpiryRoc]);

  const isSaveDisabled = validationErrors.length > 0 || loading;

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
          <div className="error">找不到薪資明細</div>
          <BackButton label="薪資管理" navigateTo="/payroll-management" />
        </div>
      </div>
    );
  }
  return (
    <div className="payroll-edit-page">
      <div className="navigation-header">
        <BackButton label="薪資管理" navigateTo="/payroll-management" />
        <h1>{year}年{month}月</h1>
        <h2>薪資發放明細修改</h2>
      </div>

      <Section title="薪資明細">
          <EditableSalarySection
            title=""
            rows={[ 
              { label: '發薪日期', value: String(formatDate(record.pay_date))},
            ]}
            onChange={handlePayDateChange}
          />
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
                { label: '今月請休日', value: leaveDetail.thismonth_leave_days || '', editableLabel: false }
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
              onChange={handleCompLeaveChange}
            />
          </div>
        </Section>
      )}
      {validationErrors.length > 0 && (
        <div className="error-container">
          {validationErrors.map(msg => (
            <div className="error" key={msg}>{msg}</div>
          ))}
        </div>
      )}
        <div>
          <MButton name="修改" type='confirm' onClick={handleSave} disabled={isSaveDisabled} />
        </div>
        <div className="delete-action-center">

          <MButton name="刪除" type='delete' onClick={() => {
                if (window.confirm('確定要刪除嗎？此操作無法復原。')) {
                  handleDelete();
                }
              }} />
        </div>
    </div>
  );
};

export default PayrollEditPage;
