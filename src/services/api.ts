// API服務的實現
import type { Record } from '../types';

// 獲取薪資記錄的函數
export const fetchRecords = async (): Promise<Record[]> => {
  try {
    // 實際的API實現前，返回模擬數據
    // 將來替換為:
    // const API_BASE_URL = 'https://api.example.com';
    // const response = await fetch(`${API_BASE_URL}/records`);
    // const data = await response.json();
    // return data.data;
    
    // 模擬數據
    return getMockRecords();
  } catch (error) {
    console.error('獲取薪資記錄失敗', error);
    throw error;
  }
};

// 模擬薪資記錄數據
const getMockRecords = (): Record[] => {
  return [
    {
      id: "A124_1140816",
      employee_id: "A124",
      user_email: "a124@example.com",
      name: "山田太郎",
      bank_name: "三井住友銀行",
      bank_account: "1234567",
      pay_date: "114-08-16",

      base_salary: 300000,
      meal_allowance: 10000,
      fixed_custom1_name: "",
      fixed_custom1_amount: 0,
      fixed_custom2_name: "",
      fixed_custom2_amount: 0,
      fixed_custom3_name: "",
      fixed_custom3_amount: 0,
      subtotal_A: 310000,

      overtime_weekday: 20000,
      overtime_holiday: 0,
      overtime_restday: 0,
      overtime_national: 0,
      bonus: 50000,
      variable_custom1_name: "",
      variable_custom1_amount: 0,
      variable_custom2_name: "",
      variable_custom2_amount: 0,
      variable_custom3_name: "",
      variable_custom3_amount: 0,
      subtotal_B: 70000,

      labor_insurance: 15000,
      health_insurance: 20000,
      national_insurance: 0,
      absence_deduction: 0,
      sick_deduction: 0,
      deduct_custom1_name: "",
      deduct_custom1_amount: 0,
      deduct_custom2_name: "",
      deduct_custom2_amount: 0,
      deduct_custom3_name: "",
      deduct_custom3_amount: 0,
      subtotal_C: 35000
    },
    {
      id: "B347_1140816",
      employee_id: "B347",
      user_email: "b347@example.com",
      name: "佐藤花子",
      bank_name: "みずほ銀行",
      bank_account: "7654321",
      pay_date: "114-08-16",

      base_salary: 280000,
      meal_allowance: 8000,
      fixed_custom1_name: "交通手当",
      fixed_custom1_amount: 12000,
      fixed_custom2_name: "",
      fixed_custom2_amount: 0,
      fixed_custom3_name: "",
      fixed_custom3_amount: 0,
      subtotal_A: 300000,

      overtime_weekday: 15000,
      overtime_holiday: 5000,
      overtime_restday: 0,
      overtime_national: 0,
      bonus: 40000,
      variable_custom1_name: "繁忙期手当",
      variable_custom1_amount: 10000,
      variable_custom2_name: "",
      variable_custom2_amount: 0,
      variable_custom3_name: "",
      variable_custom3_amount: 0,
      subtotal_B: 70000,

      labor_insurance: 14000,
      health_insurance: 18000,
      national_insurance: 0,
      absence_deduction: 2000,
      sick_deduction: 0,
      deduct_custom1_name: "遅刻控除",
      deduct_custom1_amount: 1000,
      deduct_custom2_name: "",
      deduct_custom2_amount: 0,
      deduct_custom3_name: "",
      deduct_custom3_amount: 0,
      subtotal_C: 35000
    }
  ];
};
