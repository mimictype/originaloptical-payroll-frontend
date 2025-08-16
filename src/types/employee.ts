// 従業員情報の型定義
export interface Employee {
  id: number;
  employee_id: string;
  user_email: string;
  name: string;
  bank_name: string;
  bank_account: number;
}

// 従業員一覧APIのレスポンス型
export interface EmployeeListResponse {
  status: string;
  data: Employee[];
}
