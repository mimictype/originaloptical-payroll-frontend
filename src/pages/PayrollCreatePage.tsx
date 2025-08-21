import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { LeaveDetail } from '../types';
import EditableSalarySection from '../components/EditableSalarySection';
import SalarySection from '../components/SalarySection';
import Section from '../components/Section';
import BackButton from '../components/BackButton';
import './pageStyles.css';
import type { Record } from '../types';
import { fetchEmployeePayroll, fetchEmployeeLeave } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const PayrollCreatePage: React.FC = () => {
  // URLパラメータから従業員ID・年月取得
  const { employeeId, year, month } = useParams<{
    employeeId: string;
    year: string;
    month: string;
  }>();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // APIから取得したデータ
  const [record, setRecord] = useState<Record | null>(null);

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
        const [payrollData] = await Promise.allSettled([
          fetchEmployeePayroll(employeeId, yearNum, monthNum, true),
          fetchEmployeeLeave(employeeId, yearNum, monthNum, true)
        ]);
        if (payrollData.status === 'fulfilled') {
          setRecord(payrollData.value);
        } else {
          setError('給与明細の取得に失敗しました');
        }
        setError(null);
      } catch (err) {
        setError('データの取得に失敗しました。再読み込みをお試しください。');
      } finally {
        setLoading(false);
      }
    };
    getPayrollDetail();
  }, [employeeId, year, month]);


  // EditableSalarySectionは全て値0・カスタム項目名空で初期化（useState管理）
  const [fixedRows, setFixedRows] = useState([
  { label: '底薪', value: '', editableLabel: false },
  { label: '伙食津貼', value: '', editableLabel: false },
  { label: '', value: '', editableLabel: true },
  { label: '', value: '', editableLabel: true },
  { label: '', value: '', editableLabel: true },
  ]);

  // record取得後にカスタム項目をfixedRowsへ反映
  useEffect(() => {
    if (record) {
      const newRows = [
        { label: '底薪', value: '', editableLabel: false },
        { label: '伙食津貼', value: '', editableLabel: false }
      ];
      // 先月にカスタム項目が存在する場合は追加、無ければ空のままで追加
      newRows.push({
        label: record.fixed_custom1_name ? record.fixed_custom1_name : '',
        value: record.fixed_custom1_name ? String(record.fixed_custom1_amount || '') : '',
        editableLabel: true
      });
      newRows.push({
        label: record.fixed_custom2_name ? record.fixed_custom2_name : '',
        value: record.fixed_custom2_name ? String(record.fixed_custom2_amount || '') : '',
        editableLabel: true
      });
      newRows.push({
        label: record.fixed_custom3_name ? record.fixed_custom3_name : '',
        value: record.fixed_custom3_name ? String(record.fixed_custom3_amount || '') : '',
        editableLabel: true
      });
      setFixedRows(newRows);
    }
  }, [record]);
  const fixedTotal = React.useMemo(() => fixedRows.reduce((sum, row) => sum + Number(row.value), 0), [fixedRows]);


  // 先月分データ SalarySection用
  const lastMonthFixedRows = record ? [
  { label: '底薪', value: String(record.base_salary), editableLabel: false },
  { label: '伙食津貼', value: String(record.meal_allowance), editableLabel: false },
  ...(record.fixed_custom1_name ? [{ label: record.fixed_custom1_name, value: String(record.fixed_custom1_amount || ''), editableLabel: true }] : []),
  ...(record.fixed_custom2_name ? [{ label: record.fixed_custom2_name, value: String(record.fixed_custom2_amount || ''), editableLabel: true }] : []),
  ...(record.fixed_custom3_name ? [{ label: record.fixed_custom3_name, value: String(record.fixed_custom3_amount || ''), editableLabel: true }] : []),
  ] : [];
  const lastMonthFixedTotal = lastMonthFixedRows.reduce((sum, row) => sum + Number(row.value), 0);

  // 本月發放預覽（上月實發＋本月調整額）
  const previewFixedRows = React.useMemo(() => {
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
  const previewFixedTotal = React.useMemo(() => {
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
            // editableLabelを元のfixedRowsからコピー
            const updatedRows = rows.map((row, idx) => ({
              ...row,
              editableLabel: fixedRows[idx]?.editableLabel ?? false
            }));
            setFixedRows(updatedRows);
          }}
        />
      </Section>
    </div>
  );
};

export default PayrollCreatePage;
