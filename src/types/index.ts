// 資料結構的型別定義

// 薪資記錄的型別
export interface Record {
  id: string;                   // 記錄ID
  employee_id: string;          // 員工ID
  user_email: string;           // 員工Email
  name: string;                 // 姓名
  bank_name: string;            // 銀行名稱
  bank_account: string;         // 銀行帳號
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
  subtotal_C: number            // 小計(C)
}

// 休暇明細の型別
export interface LeaveDetail {
  id: string;                   // 記錄ID（員工ID + 發薪日，例: "A124_11408"）
  leave_start: number;          // 請休期間開始（ROC yyyMMdd形式、例: 1140101）
  leave_end: number;            // 請休期間結束（ROC yyyMMdd形式、例: 1141231）
  carryover_days: number;       // 經過遞延的特別休假日數（有給の繰越日数）
  granted_days: number;         // 今年可休的特別休假日數（当年付与日数）
  used_days: number;            // 今年已休的特別休假日數（当年取得済み日数）
  remaining_days: number;       // 今年未休的特別休假日數（残日数）
  thismonth_leave_days: string; // 今月特別休假的請休日（今月の予定取得日、例: "8/20,8/5"）
  comp_expiry: number;          // 勞雇雙方的定之補休期限（代休の消化期限、ROC yyyMMdd形式）
  carryover_hours: number;      // 至上月底止休未補休時數（代休の月初繰入時間）
  granted_hours: number;        // 本月選擇補休時數（今月、残業代→代休に振替した時間）
  used_hours: number;           // 本月已補休時數（今月消化した代休時間）
  cashout_hours: number;        // 屆期未休補折發工資時數（期限切れで賃金精算に回した時間）
  remaining_hours: number;      // 至本月止休未休補休時數（代休残時間）
}

// API回應的型別
export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
}
