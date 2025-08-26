import { useState, useEffect, useMemo, type FC } from 'react';
import { useParams } from 'react-router-dom';
import type { LeaveData, PayrollData } from '../types/index';
import EditableSalarySection from '../components/EditableSalarySection';
import SalarySection from '../components/SalarySection';
import Section from '../components/Section';
import BackButton from '../components/BackButton';
import './pageStyles.css';
import { getEmployeePayroll, getEmployeeLeave } from '../services/getData';
import LoadingSpinner from '../components/LoadingSpinner';
import MButton from '../components/MButton';
import { createLeave, createPayroll } from '../services/api';

const PayrollCreatePage: FC = () => {
  // 特別休暇データ
  const [leaveDetail, setLeaveDetail] = useState<LeaveData | null>(null);

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

    // 登錄ボタン押下時の処理
    const handleCreate = async () => {
      if (!record || !leaveDetail) return;
      setLoading(true);
      setError(null);
      try {
        // previewRowsからAPI型にマッピング
        const payrollPayload: Partial<PayrollData> = {
          id: employeeId && year && month ? `${employeeId}_${year}${month.padStart(2, '0')}` : undefined,
          pay_date: record.pay_date,
          // 固定項目
          base_salary: Number(previewFixedRows.find(r => r.label === '底薪')?.value || 0),
          meal_allowance: Number(previewFixedRows.find(r => r.label === '伙食津貼')?.value || 0),
          // カスタム項目（ラベルが空ならセットしない）
          ...(previewFixedRows.find(r => r.editableLabel && r.label)
            ? {
                fixed_custom1_name: previewFixedRows.find(r => r.editableLabel && r.label)?.label,
                fixed_custom1_amount: Number(previewFixedRows.find(r => r.editableLabel && r.label)?.value || 0),
              }
            : {}),
          ...(previewFixedRows.filter(r => r.editableLabel && r.label).length > 1
            ? {
                fixed_custom2_name: previewFixedRows.filter(r => r.editableLabel && r.label)[1]?.label,
                fixed_custom2_amount: Number(previewFixedRows.filter(r => r.editableLabel && r.label)[1]?.value || 0),
              }
            : {}),
          ...(previewFixedRows.filter(r => r.editableLabel && r.label).length > 2
            ? {
                fixed_custom3_name: previewFixedRows.filter(r => r.editableLabel && r.label)[2]?.label,
                fixed_custom3_amount: Number(previewFixedRows.filter(r => r.editableLabel && r.label)[2]?.value || 0),
              }
            : {}),
          // 非固定項目
          overtime_weekday: Number(previewVariableRows.find(r => r.label === '平日加班費')?.value || 0),
          overtime_holiday: Number(previewVariableRows.find(r => r.label === '休假日加班費')?.value || 0),
          overtime_restday: Number(previewVariableRows.find(r => r.label === '休息日加班費')?.value || 0),
          overtime_national: Number(previewVariableRows.find(r => r.label === '國定假日加班費')?.value || 0),
          bonus: Number(previewVariableRows.find(r => r.label === '獎金')?.value || 0),
          // 非固定カスタム項目（ラベルが空ならセットしない）
          ...(previewVariableRows.find(r => r.editableLabel && r.label)
            ? {
                variable_custom1_name: previewVariableRows.find(r => r.editableLabel && r.label)?.label,
                variable_custom1_amount: Number(previewVariableRows.find(r => r.editableLabel && r.label)?.value || 0),
              }
            : {}),
          ...(previewVariableRows.filter(r => r.editableLabel && r.label).length > 1
            ? {
                variable_custom2_name: previewVariableRows.filter(r => r.editableLabel && r.label)[1]?.label,
                variable_custom2_amount: Number(previewVariableRows.filter(r => r.editableLabel && r.label)[1]?.value || 0),
              }
            : {}),
          ...(previewVariableRows.filter(r => r.editableLabel && r.label).length > 2
            ? {
                variable_custom3_name: previewVariableRows.filter(r => r.editableLabel && r.label)[2]?.label,
                variable_custom3_amount: Number(previewVariableRows.filter(r => r.editableLabel && r.label)[2]?.value || 0),
              }
            : {}),
          // 控除項目
          labor_insurance: Number(previewDeductRows.find(r => r.label === '勞保費')?.value || 0),
          health_insurance: Number(previewDeductRows.find(r => r.label === '健保費')?.value || 0),
          national_insurance: Number(previewDeductRows.find(r => r.label === '國保')?.value || 0),
          absence_deduction: Number(previewDeductRows.find(r => r.label === '事假扣款')?.value || 0),
          sick_deduction: Number(previewDeductRows.find(r => r.label === '病假扣款')?.value || 0),
          // 控除カスタム項目（ラベルが空ならセットしない）
          ...(previewDeductRows.find(r => r.editableLabel && r.label)
            ? {
                deduct_custom1_name: previewDeductRows.find(r => r.editableLabel && r.label)?.label,
                deduct_custom1_amount: Number(previewDeductRows.find(r => r.editableLabel && r.label)?.value || 0),
              }
            : {}),
          ...(previewDeductRows.filter(r => r.editableLabel && r.label).length > 1
            ? {
                deduct_custom2_name: previewDeductRows.filter(r => r.editableLabel && r.label)[1]?.label,
                deduct_custom2_amount: Number(previewDeductRows.filter(r => r.editableLabel && r.label)[1]?.value || 0),
              }
            : {}),
          ...(previewDeductRows.filter(r => r.editableLabel && r.label).length > 2
            ? {
                deduct_custom3_name: previewDeductRows.filter(r => r.editableLabel && r.label)[2]?.label,
                deduct_custom3_amount: Number(previewDeductRows.filter(r => r.editableLabel && r.label)[2]?.value || 0),
              }
            : {}),
        };

        // 休暇明細ペイロード作成
        const leavePayload: Partial<LeaveData> = {
          // IDは従業員ID_年月（民国年+月）形式で生成（URLパラメータのyearとmonthを使用）
          id: employeeId && year && month ? `${employeeId}_${year}${month.padStart(2, '0')}` : undefined,
          leave_start: previewLeaveRows.find(r => r.label === '請休期間開始')?.value
            ? Number(previewLeaveRows.find(r => r.label === '請休期間開始')!.value.replace(/-/g, ''))
            : 0,
          leave_end: previewLeaveRows.find(r => r.label === '請休期間結束')?.value
            ? Number(previewLeaveRows.find(r => r.label === '請休期間結束')!.value.replace(/-/g, ''))
            : 0,
          carryover_days: Number(previewLeaveRows.find(r => r.label === '經過遞延日數')?.value || 0),
          granted_days: Number(previewLeaveRows.find(r => r.label === '今年可休日數')?.value || 0),
          used_days: Number(previewLeaveRows.find(r => r.label === '今年已休日數')?.value || 0),
          remaining_days: Number(previewLeaveRows.find(r => r.label === '今年未休日數')?.value || 0),
          thismonth_leave_days: previewLeaveRows.find(r => r.label === '今月請休日')?.value || '',
          comp_expiry: previewOvertimeRows.find(r => r.label === '勞雇約定之補休期限')?.value
            ? Number(previewOvertimeRows.find(r => r.label === '勞雇約定之補休期限')!.value.replace(/-/g, ''))
            : 0,
          carryover_hours: Number(previewOvertimeRows.find(r => r.label === '至上月底止休未補休時數')?.value || 0),
          granted_hours: Number(previewOvertimeRows.find(r => r.label === '本月選擇補休時數')?.value || 0),
          used_hours: Number(previewOvertimeRows.find(r => r.label === '本月已補休時數')?.value || 0),
          cashout_hours: Number(previewOvertimeRows.find(r => r.label === '屆期未休補折發工資時數')?.value || 0),
          remaining_hours: Number(previewOvertimeRows.find(r => r.label === '至本月止休未休補休時數')?.value || 0),
        };

        // 給与明細作成
        const payrollRes = await createPayroll(payrollPayload);
        // 休暇明細作成
        const leaveRes = await createLeave(leavePayload);
        if (payrollRes.status !== 'success' || leaveRes.status !== 'success') {
          setError(
            `作成に失敗しました。\n給与: ${payrollRes.error || JSON.stringify(payrollRes)}\n休暇: ${leaveRes.error || JSON.stringify(leaveRes)}`
          );
        } else {
          alert('登錄成功');
          window.location.href = '/originaloptical-payroll-frontend/PayrollManagement';
        }
      } catch (err) {
        setError('作成に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

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
        let yearNum = parseInt(year, 10);
        let monthNum = parseInt(month, 10);
        // 前月に変換（1月なら前年12月）
        if (monthNum === 1) {
          yearNum -= 1;
          monthNum = 12;
        } else {
          monthNum -= 1;
        }
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

  // 固定項目
  const [fixedRows, setFixedRows] = useState([
    { label: '底薪', value: '', editableLabel: false },
    { label: '伙食津貼', value: '', editableLabel: false },
    { label: '', value: '', editableLabel: true },
    { label: '', value: '', editableLabel: true },
    { label: '', value: '', editableLabel: true },
  ]);
  useEffect(() => {
    if (record) {
      const newRows = [
        { label: '底薪', value: '', editableLabel: false },
        { label: '伙食津貼', value: '', editableLabel: false },
        { label: record.fixed_custom1_name ? record.fixed_custom1_name : '', value: record.fixed_custom1_name ? String(record.fixed_custom1_amount || '') : '', editableLabel: true },
        { label: record.fixed_custom2_name ? record.fixed_custom2_name : '', value: record.fixed_custom2_name ? String(record.fixed_custom2_amount || '') : '', editableLabel: true },
        { label: record.fixed_custom3_name ? record.fixed_custom3_name : '', value: record.fixed_custom3_name ? String(record.fixed_custom3_amount || '') : '', editableLabel: true },
      ];
      setFixedRows(newRows);
    }
  }, [record]);
  const fixedTotal = useMemo(() => fixedRows.reduce((sum, row) => sum + Number(row.value), 0), [fixedRows]);

  // 控除項目
  const [deductRows, setDeductRows] = useState([
    { label: '勞保費', value: '', editableLabel: false },
    { label: '健保費', value: '', editableLabel: false },
    { label: '國保', value: '', editableLabel: false },
    { label: '事假扣款', value: '', editableLabel: false },
    { label: '病假扣款', value: '', editableLabel: false },
    { label: '', value: '', editableLabel: true },
    { label: '', value: '', editableLabel: true },
    { label: '', value: '', editableLabel: true },
  ]);
  useEffect(() => {
    if (record) {
      const newRows = [
        { label: '勞保費', value: '', editableLabel: false },
        { label: '健保費', value: '', editableLabel: false },
        { label: '國保', value: '', editableLabel: false },
        { label: '事假扣款', value: '', editableLabel: false },
        { label: '病假扣款', value: '', editableLabel: false },
        { label: record.deduct_custom1_name ? record.deduct_custom1_name : '', value: record.deduct_custom1_name ? String(record.deduct_custom1_amount || '') : '', editableLabel: true },
        { label: record.deduct_custom2_name ? record.deduct_custom2_name : '', value: record.deduct_custom2_name ? String(record.deduct_custom2_amount || '') : '', editableLabel: true },
        { label: record.deduct_custom3_name ? record.deduct_custom3_name : '', value: record.deduct_custom3_name ? String(record.deduct_custom3_amount || '') : '', editableLabel: true },
      ];
      setDeductRows(newRows);
    }
  }, [record]);
  const deductTotal = useMemo(() => deductRows.reduce((sum, row) => sum + Number(row.value), 0), [deductRows]);

  // 先月分データ SalarySection用
  const lastMonthDeductRows = record ? [
    { label: '勞保費', value: String(record.labor_insurance), editableLabel: false },
    { label: '健保費', value: String(record.health_insurance), editableLabel: false },
    { label: '國保', value: String(record.national_insurance), editableLabel: false },
    { label: '事假扣款', value: String(record.absence_deduction), editableLabel: false },
    { label: '病假扣款', value: String(record.sick_deduction), editableLabel: false },
    ...(record.deduct_custom1_name ? [{ label: record.deduct_custom1_name, value: String(record.deduct_custom1_amount || ''), editableLabel: true }] : []),
    ...(record.deduct_custom2_name ? [{ label: record.deduct_custom2_name, value: String(record.deduct_custom2_amount || ''), editableLabel: true }] : []),
    ...(record.deduct_custom3_name ? [{ label: record.deduct_custom3_name, value: String(record.deduct_custom3_amount || ''), editableLabel: true }] : []),
  ] : [];
  const lastMonthDeductTotal = lastMonthDeductRows.reduce((sum, row) => sum + Number(row.value), 0);

  // 本月發放預覽（上月實發＋本月調整額）
  const previewDeductRows = useMemo(() => {
    const resultRows: Array<{ label: string; value: string; editableLabel: boolean }> = [];
    deductRows.forEach(row => {
      if (row.label !== '') {
        if (row.editableLabel === false) {
          const lastMonthRow = lastMonthDeductRows.find(lmRow => lmRow.label === row.label && lmRow.editableLabel === false);
          const lastMonthValue = lastMonthRow ? Number(lastMonthRow.value) : 0;
          const currentValue = Number(row.value) || 0;
          resultRows.push({
            label: row.label,
            value: String(lastMonthValue + currentValue),
            editableLabel: false
          });
        } else {
          resultRows.push({
            label: row.label,
            value: row.value,
            editableLabel: true
          });
        }
      }
    });
    return resultRows;
  }, [lastMonthDeductRows, deductRows]);
  const previewDeductTotal = useMemo(() => {
    return previewDeductRows.reduce((sum, row) => sum + Number(row.value), 0);
  }, [lastMonthDeductRows, deductRows]);
  const [variableRows, setVariableRows] = useState([
    { label: '平日加班費', value: '', editableLabel: false },
    { label: '休假日加班費', value: '', editableLabel: false },
    { label: '休息日加班費', value: '', editableLabel: false },
    { label: '國定假日加班費', value: '', editableLabel: false },
    { label: '獎金', value: '', editableLabel: false },
    { label: '', value: '', editableLabel: true },
    { label: '', value: '', editableLabel: true },
    { label: '', value: '', editableLabel: true },
  ]);
  useEffect(() => {
    if (record) {
      const newRows = [
        { label: '平日加班費', value: '', editableLabel: false },
        { label: '休假日加班費', value: '', editableLabel: false },
        { label: '休息日加班費', value: '', editableLabel: false },
        { label: '國定假日加班費', value: '', editableLabel: false },
        { label: '獎金', value: '', editableLabel: false },
        { label: record.variable_custom1_name ? record.variable_custom1_name : '', value: record.variable_custom1_name ? String(record.variable_custom1_amount || '') : '', editableLabel: true },
        { label: record.variable_custom2_name ? record.variable_custom2_name : '', value: record.variable_custom2_name ? String(record.variable_custom2_amount || '') : '', editableLabel: true },
        { label: record.variable_custom3_name ? record.variable_custom3_name : '', value: record.variable_custom3_name ? String(record.variable_custom3_amount || '') : '', editableLabel: true },
      ];
      setVariableRows(newRows);
    }
  }, [record]);
  const variableTotal = useMemo(() => variableRows.reduce((sum, row) => sum + Number(row.value), 0), [variableRows]);

  // 先月分データ SalarySection用
  const lastMonthVariableRows = record ? [
    { label: '平日加班費', value: String(record.overtime_weekday), editableLabel: false },
    { label: '休假日加班費', value: String(record.overtime_holiday), editableLabel: false },
    { label: '休息日加班費', value: String(record.overtime_restday), editableLabel: false },
    { label: '國定假日加班費', value: String(record.overtime_national), editableLabel: false },
    { label: '獎金', value: String(record.bonus), editableLabel: false },
    ...(record.variable_custom1_name ? [{ label: record.variable_custom1_name, value: String(record.variable_custom1_amount || ''), editableLabel: true }] : []),
    ...(record.variable_custom2_name ? [{ label: record.variable_custom2_name, value: String(record.variable_custom2_amount || ''), editableLabel: true }] : []),
    ...(record.variable_custom3_name ? [{ label: record.variable_custom3_name, value: String(record.variable_custom3_amount || ''), editableLabel: true }] : []),
  ] : [];
  const lastMonthVariableTotal = lastMonthVariableRows.reduce((sum, row) => sum + Number(row.value), 0);

  // 本月發放預覽（上月實發＋本月調整額）
  const previewVariableRows = useMemo(() => {
    const resultRows: Array<{ label: string; value: string; editableLabel: boolean }> = [];
    variableRows.forEach(row => {
      if (row.label !== '') {
        if (row.editableLabel === false) {
          const lastMonthRow = lastMonthVariableRows.find(lmRow => lmRow.label === row.label && lmRow.editableLabel === false);
          const lastMonthValue = lastMonthRow ? Number(lastMonthRow.value) : 0;
          const currentValue = Number(row.value) || 0;
          resultRows.push({
            label: row.label,
            value: String(lastMonthValue + currentValue),
            editableLabel: false
          });
        } else {
          resultRows.push({
            label: row.label,
            value: row.value,
            editableLabel: true
          });
        }
      }
    });
    return resultRows;
  }, [lastMonthVariableRows, variableRows]);
  const previewVariableTotal = useMemo(() => {
    return previewVariableRows.reduce((sum, row) => sum + Number(row.value), 0);
  }, [lastMonthVariableRows, variableRows]);


  // 先月分データ SalarySection用
  const lastMonthFixedRows = record ? [
  { label: '底薪', value: String(record.base_salary), editableLabel: false },
  { label: '伙食津貼', value: String(record.meal_allowance), editableLabel: false },
  ...(record.fixed_custom1_name ? [{ label: record.fixed_custom1_name, value: String(record.fixed_custom1_amount || ''), editableLabel: true }] : []),
  ...(record.fixed_custom2_name ? [{ label: record.fixed_custom2_name, value: String(record.fixed_custom2_amount || ''), editableLabel: true }] : []),
  ...(record.fixed_custom3_name ? [{ label: record.fixed_custom3_name, value: String(record.fixed_custom3_amount || ''), editableLabel: true }] : []),
  ] : [];
  const lastMonthFixedTotal = lastMonthFixedRows.reduce((sum, row) => sum + Number(row.value), 0);

  // 本月發放預覽（上月実發＋本月調整額）
  const previewFixedRows = useMemo(() => {
    // ラベル: fixedRowsのrow.label !== ''のみ抽出
    // 固定項目の値: lastMonthFixedRows+fixedRowsで合算
    // カスタム項目の値: fixedRowsから取得
    const resultRows: Array<{ label: string; value: string; editableLabel: boolean }> = [];
    fixedRows.forEach(row => {
      if (row.label !== '') {
        if (row.editableLabel === false) {
          // 固定項目はlastMonthFixedRowsとfixedRowsの値を合算
          const lastMonthRow = lastMonthFixedRows.find(lmRow => lmRow.label === row.label && lmRow.editableLabel === false);
          const lastMonthValue = lastMonthRow ? Number(lastMonthRow.value) : 0;
          const currentValue = Number(row.value) || 0;
          resultRows.push({
            label: row.label,
            value: String(lastMonthValue + currentValue),
            editableLabel: false
          });
        } else {
          // カスタム項目はfixedRowsから値を取得
          resultRows.push({
            label: row.label,
            value: row.value,
            editableLabel: true
          });
        }
      }
    });
    return resultRows;
  }, [lastMonthFixedRows, fixedRows]);
  const previewFixedTotal = useMemo(() => {
  return previewFixedRows.reduce((sum, row) => sum + Number(row.value), 0);
  }, [lastMonthFixedTotal, fixedRows]);
// memo


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

  // 発薪日期編集用コールバック
  const handlePayDateChange = (rows: Array<{ label: string; value: string }>) => {
    setRecord(prev => prev ? ({
      ...prev,
      pay_date: rows[0]?.value ? Number(rows[0].value.replace(/-/g, '')) : prev.pay_date,
    }) : prev);
  };

  // 特別休暇調整額 rows
  const [leaveAdjustmentRows, setLeaveAdjustmentRows] = useState([
    { label: '請休期間開始', value: '', editableLabel: false },
    { label: '請休期間結束', value: '', editableLabel: false },
    { label: '經過遞延日數', value: '', editableLabel: false },
    { label: '今月已休日數', value: '', editableLabel: false },
    { label: '今月請休日', value: '', editableLabel: false }
  ]);
  useEffect(() => {
    if (leaveDetail) {
      setLeaveAdjustmentRows([
        { label: '請休期間開始', value: formatDate(leaveDetail.leave_start), editableLabel: false },
        { label: '請休期間結束', value: formatDate(leaveDetail.leave_end), editableLabel: false },
        { label: '經過遞延日數', value: '', editableLabel: false },
        { label: '今月已休日數', value: '', editableLabel: false },
        { label: '今月請休日', value: '', editableLabel: false }
      ]);
    }
  }, [leaveDetail]);
    
  // 特別休暇 上月実績 rows を const で定義
  const lastMonthLeaveRows = leaveDetail ? [
    { label: '請休期間開始', value: formatDate(leaveDetail.leave_start) },
    { label: '請休期間結束', value: formatDate(leaveDetail.leave_end) },
    { label: '經過遞延日數', value: `${leaveDetail.carryover_days}` },
    { label: '今年可休日數', value: `${leaveDetail.granted_days}` },
    { label: '今年已休日數', value: `${leaveDetail.used_days}` },
    { label: '今年未休日數', value: `${leaveDetail.remaining_days}` },
    ...(leaveDetail.thismonth_leave_days ? [{ label: '今月請休日', value: leaveDetail.thismonth_leave_days }] : [])
  ] : [];
  // previewLeaveRows: ラベルごとにlastMonthLeaveRowsとleaveAdjustmentRowsを使い分けるロジック
  const previewLeaveRows = useMemo(() => {
    const resultRows: Array<{ label: string; value: string }> = [];
    let grantedValue: number | null = null;
    let usedValue: number | null = null;

    lastMonthLeaveRows.forEach(row => {
      if (row.label === '請休期間開始' || row.label === '請休期間結束' || row.label === '今月請休日') {
        resultRows.push({ label: row.label, value: String(leaveAdjustmentRows.find(r => r.label === row.label)?.value) });
      } else if (row.label === '經過遞延日數') {
        resultRows.push({ label: row.label, value: String(leaveAdjustmentRows.find(r => r.label === row.label)?.value) || '0' });
      } else if (row.label === '今年可休日數') {
        const adjustmentRow = leaveAdjustmentRows.find(r => r.label === '經過遞延日數');
        const value = adjustmentRow ? String(Number(row.value) + Number(adjustmentRow.value)) : row.value;
        resultRows.push({ label: row.label, value });
        grantedValue = Number(value);
      } else if (row.label === '今年已休日數') {
        const adjustmentRow = leaveAdjustmentRows.find(r => r.label === '今月已休日數');
        const value = adjustmentRow ? String(Number(row.value) + Number(adjustmentRow.value)) : row.value;
        resultRows.push({ label: row.label, value });
        usedValue = Number(value);
      } else if (row.label === '今年未休日數') {
        resultRows.push({ label: row.label, value: '0'});
      }
    });
    // 今年未休日數を追加
    if (grantedValue !== null && usedValue !== null) {
      resultRows.find(r => r.label === '今年未休日數')!.value = String(grantedValue - usedValue);
    }
    return resultRows;
  }, [lastMonthLeaveRows, leaveAdjustmentRows]);

  // 加班補休
  const lastMonthOvertimeRows = leaveDetail ? [
    { label: '勞雇約定之補休期限', value: formatDate(leaveDetail.comp_expiry) },
    { label: '至上月底止休未補休時數', value: leaveDetail.carryover_hours },
    { label: '本月選擇補休時數', value: `${leaveDetail.granted_hours}` },
    { label: '本月已補休時數', value: `${leaveDetail.used_hours}` },
    { label: '屆期未休補折發工資時數', value: `${leaveDetail.cashout_hours}` },
    { label: '至本月止休未休補休時數', value: `${leaveDetail.remaining_hours}` },
  ] : [];

  const [adjustedOvertimeRows, setAdjustedOvertimeRows] = useState([
    { label: '勞雇約定之補休期限', value: '', editableLabel: false },
    { label: '至上月底止休未補休時數', value: '', editableLabel: false },
    { label: '本月選擇補休時數', value: '', editableLabel: false },
    { label: '本月已補休時數', value: '', editableLabel: false },
    { label: '屆期未休補折發工資時數', value: '', editableLabel: false },
    { label: '至本月止休未休補休時數', value: '', editableLabel: false }
  ]);
  useEffect(() => {
    if (leaveDetail) {
      setAdjustedOvertimeRows([
        { label: '勞雇約定之補休期限', value: formatDate(leaveDetail.comp_expiry), editableLabel: false },
        { label: '至上月底止休未補休時數', value: '', editableLabel: false },
        { label: '本月選擇補休時數', value: ``, editableLabel: false },
        { label: '本月已補休時數', value: ``, editableLabel: false },
        { label: '屆期未休補折發工資時數', value: ``, editableLabel: false },
        { label: '至本月止休未休補休時數', value: ``, editableLabel: false }
      ]);
    }
  }, [leaveDetail]);

  const previewOvertimeRows = useMemo(() => {
    return adjustedOvertimeRows.map(row => ({
      ...row,
      value: String(row.value)
    }));
  }, [adjustedOvertimeRows]);

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
        <h1>{year}年{month}月</h1>
        <h2>薪資發放明細登錄</h2>
      </div>
          <EditableSalarySection
            title=""
            rows={[ 
              { label: '發薪日期', value: String(formatDate(record.pay_date))},
            ]}
            onChange={handlePayDateChange}
          />
  {/* 固定薪資結構：上月→今月→調整額 */}
      <Section title="固定薪資結構">
        <SalarySection
          title="上月實發"
          rows={lastMonthFixedRows}
          subtotalLabel="小計(A)"
          subtotalValue={String(lastMonthFixedTotal)}
        />
        <SalarySection
          title="本月發放預覽"
          rows={previewFixedRows}
          subtotalLabel="小計(A)"
          subtotalValue={String(previewFixedTotal)}
        />
        <EditableSalarySection
          title="本月調整額"
          rows={fixedRows}
          showTotal
          totalLabel="小計(A)"
          totalValue={String(fixedTotal)}
          onChange={rows => {
            const updatedRows = rows.map((row, idx) => ({
              ...row,
              editableLabel: fixedRows[idx]?.editableLabel ?? false
            }));
            setFixedRows(updatedRows);
          }}
        />
      </Section>

      {/* 非固定給与セクション：上月→今月→調整額 */}
      <Section title="非固定支付項目">
        <SalarySection
          title="上月實發"
          rows={lastMonthVariableRows}
          subtotalLabel="小計(B)"
          subtotalValue={String(lastMonthVariableTotal)}
        />
        <SalarySection
          title="本月發放預覽"
          rows={previewVariableRows}
          subtotalLabel="小計(B)"
          subtotalValue={String(previewVariableTotal)}
        />
        <EditableSalarySection
          title="本月調整額"
          rows={variableRows}
          showTotal
          totalLabel="小計(B)"
          totalValue={String(variableTotal)}
          onChange={rows => {
            const updatedRows = rows.map((row, idx) => ({
              ...row,
              editableLabel: variableRows[idx]?.editableLabel ?? false
            }));
            setVariableRows(updatedRows);
          }}
        />
      </Section>
      {/* 控除（應代扣項目）セクション：上月→今月→調整額 */}
      <Section title="應代扣項目">
        <SalarySection
          title="上月實扣"
          rows={lastMonthDeductRows}
          subtotalLabel="小計(C)"
          subtotalValue={String(lastMonthDeductTotal)}
        />
        <SalarySection
          title="本月代扣預覽"
          rows={previewDeductRows}
          subtotalLabel="小計(C)"
          subtotalValue={String(previewDeductTotal)}
        />
        <EditableSalarySection
          title="本月調整額"
          rows={deductRows}
          showTotal
          totalLabel="小計(C)"
          totalValue={String(deductTotal)}
          onChange={rows => {
            const updatedRows = rows.map((row, idx) => ({
              ...row,
              editableLabel: deductRows[idx]?.editableLabel ?? false
            }));
            setDeductRows(updatedRows);
          }}
        />
      </Section>
      {/* 給与合計セクション：上月→今月→調整額 */}
      <Section title="總計">
        <SalarySection
          title="上月實發"
          rows={[]}
          subtotalLabel="總計 (A+B-C)"
          subtotalValue={String(lastMonthFixedTotal + lastMonthVariableTotal - lastMonthDeductTotal)}
        />
        <SalarySection
          title="本月發放預覽"
          rows={[]}
          subtotalLabel="總計 (A+B-C)"
          subtotalValue={String(previewFixedTotal + previewVariableTotal - previewDeductTotal)}
        />
        <SalarySection
          title="本月發放差額"
          rows={[]}
          subtotalLabel="本月預定-上月實發"
          subtotalValue={String(previewFixedTotal + previewVariableTotal - previewDeductTotal - (lastMonthFixedTotal + lastMonthVariableTotal - lastMonthDeductTotal))}
        />
      </Section>
      {leaveDetail && (
        <>
      <Section title="特別休假">
        <SalarySection
          title="上月實績"
          rows={lastMonthLeaveRows}
          />
        <SalarySection
          title="本月預覽"
          rows={previewLeaveRows}
          />
        <EditableSalarySection
          title="本月調整"
          rows={leaveAdjustmentRows}
          onChange={
            (rows) => {
              const updatedRows = rows.map((row, idx) => ({
                ...row,
                editableLabel: leaveAdjustmentRows[idx]?.editableLabel ?? false
              }));
              setLeaveAdjustmentRows(updatedRows);
            }
          }
          />
      </Section>
      <Section title="加班補休">
        <SalarySection
          title="上月實績"
          rows={lastMonthOvertimeRows}
        />
        <SalarySection
          title="本月預覽"
          rows={previewOvertimeRows}
        />
        <EditableSalarySection
          title="本月調整"
          rows={adjustedOvertimeRows}
          onChange={
            (rows) => {
              const updatedRows = rows.map((row, idx) => ({
                ...row,
                editableLabel: adjustedOvertimeRows[idx]?.editableLabel ?? false
              }));
              setAdjustedOvertimeRows(updatedRows);
            }
          }
        />
      </Section>
        </>
      )}
      <div>
        <MButton name="登錄" type='confirm' onClick={handleCreate} />
      </div>
    </div>
  );
};

export default PayrollCreatePage;
