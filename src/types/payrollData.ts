export interface PayrollData {
  pay_date: string;             // 發薪日期 (民國年-MM-DD)
  base_salary: number;          // 底薪
  meal_allowance: number;       // 伙食津貼
  fixed_custom1_name: string;   // 固定自訂項目1名稱
  fixed_custom1_amount: number;
  fixed_custom2_name: string;
  fixed_custom2_amount: number;
  fixed_custom3_name: string;
  fixed_custom3_amount: number;
  subtotal_A: number;           // 小計(A)
  overtime_weekday: number;     // 平日加班費
  overtime_holiday: number;     // 休假日加班費
  overtime_restday: number;     // 休息日加班費
  overtime_national: number;    // 國定假日加班費
  bonus: number;                // 獎金
  variable_custom1_name: string;
  variable_custom1_amount: number;
  variable_custom2_name: string;
  variable_custom2_amount: number;
  variable_custom3_name: string;
  variable_custom3_amount: number;
  subtotal_B: number;           // 小計(B)
  labor_insurance: number;      // 勞保費
  health_insurance: number;     // 健保費
  national_insurance: number;   // 國保
  absence_deduction: number;    // 事假扣款
  sick_deduction: number;       // 病假扣款
  deduct_custom1_name: string;
  deduct_custom1_amount: number;
  deduct_custom2_name: string;
  deduct_custom2_amount: number;
  deduct_custom3_name: string;
  deduct_custom3_amount: number;
  subtotal_C: number;           // 小計(C)
}
