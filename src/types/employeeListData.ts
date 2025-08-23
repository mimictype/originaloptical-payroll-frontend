import type { EmployeeData } from "./employeeData";

// 従業員一覧APIのレスポンス型
export interface EmployeeListData {
  status: string;
  data: EmployeeData[];
}
