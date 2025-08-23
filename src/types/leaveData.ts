export interface LeaveData {
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
