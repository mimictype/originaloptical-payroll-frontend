// API服務的實現
import type { Record } from '../types';
import type { Employee, EmployeeListResponse } from '../types/employee';

// 従業員一覧を取得する関数
export const fetchEmployees = async (): Promise<Employee[]> => {
  try {
    const API_URL = 'https://script.google.com/macros/s/AKfycbxbgH1F99F6wSIIDKW1CjRRHNCVJzZghjfLuOKeweJxT-uU-y877LgTE7TuYNQyxeG1/exec';
    const response = await fetch(`${API_URL}?action=listEmployees`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data: EmployeeListResponse = await response.json();
    
    if (data.status !== 'success') {
      throw new Error('Failed to fetch employees');
    }
    
    return data.data;
  } catch (error) {
    console.error('従業員一覧の取得に失敗しました', error);
    throw error;
  }
};

// 獲取薪資記錄的函數
export const fetchRecords = async (rocYear?: number, month?: number): Promise<Record[]> => {
  try {
    // 實際的API實現前，返回模擬數據
    // 將來替換為:
    // const API_BASE_URL = 'https://api.example.com';
    // const response = await fetch(`${API_BASE_URL}/records?year=${rocYear}&month=${month}`);
    // const data = await response.json();
    // return data.data;
    
    // 模擬數據
    return getMockRecords(rocYear, month);
  } catch (error) {
    console.error('獲取薪資記錄失敗', error);
    throw error;
  }
};

// 模擬薪資記錄數據
const getMockRecords = (rocYear?: number, month?: number): Record[] => {
  // 所有模擬數據
  const allRecords = [
    // 114年8月データ
    {
      id: "A124_1140816",
      employee_id: "A124",
      user_email: "a124@example.com",
      name: "山田太郎",
      bank_name: "三井住友銀行",
      bank_account: "1112223",
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
      id: "A777_1140816",
      employee_id: "A777",
      user_email: "c567@example.com",
      name: "鈴木一郎",
      bank_name: "りそな銀行",
      bank_account: "9876543",
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
    },
    
    // 114年7月データ
    {
      id: "A124_1140716",
      employee_id: "A124",
      user_email: "a124@example.com",
      name: "山田太郎",
      bank_name: "三井住友銀行",
      bank_account: "1112223",
      pay_date: "114-07-16",

      base_salary: 300000,
      meal_allowance: 10000,
      fixed_custom1_name: "",
      fixed_custom1_amount: 0,
      fixed_custom2_name: "",
      fixed_custom2_amount: 0,
      fixed_custom3_name: "",
      fixed_custom3_amount: 0,
      subtotal_A: 310000,

      overtime_weekday: 15000,
      overtime_holiday: 0,
      overtime_restday: 0,
      overtime_national: 0,
      bonus: 30000,
      variable_custom1_name: "",
      variable_custom1_amount: 0,
      variable_custom2_name: "",
      variable_custom2_amount: 0,
      variable_custom3_name: "",
      variable_custom3_amount: 0,
      subtotal_B: 45000,

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
      id: "A777_1140716",
      employee_id: "A777",
      user_email: "c567@example.com",
      name: "鈴木一郎",
      bank_name: "りそな銀行",
      bank_account: "9876543",
      pay_date: "114-07-16",

      base_salary: 280000,
      meal_allowance: 8000,
      fixed_custom1_name: "交通手当",
      fixed_custom1_amount: 12000,
      fixed_custom2_name: "",
      fixed_custom2_amount: 0,
      fixed_custom3_name: "",
      fixed_custom3_amount: 0,
      subtotal_A: 300000,

      overtime_weekday: 10000,
      overtime_holiday: 0,
      overtime_restday: 0,
      overtime_national: 0,
      bonus: 0,
      variable_custom1_name: "",
      variable_custom1_amount: 0,
      variable_custom2_name: "",
      variable_custom2_amount: 0,
      variable_custom3_name: "",
      variable_custom3_amount: 0,
      subtotal_B: 10000,

      labor_insurance: 14000,
      health_insurance: 18000,
      national_insurance: 0,
      absence_deduction: 0,
      sick_deduction: 0,
      deduct_custom1_name: "",
      deduct_custom1_amount: 0,
      deduct_custom2_name: "",
      deduct_custom2_amount: 0,
      deduct_custom3_name: "",
      deduct_custom3_amount: 0,
      subtotal_C: 32000
    },
    
    // 114年9月データ
    {
      id: "A124_1140916",
      employee_id: "A124",
      user_email: "a124@example.com",
      name: "山田太郎",
      bank_name: "三井住友銀行",
      bank_account: "1234567",
      pay_date: "114-09-16",

      base_salary: 300000,
      meal_allowance: 10000,
      fixed_custom1_name: "",
      fixed_custom1_amount: 0,
      fixed_custom2_name: "",
      fixed_custom2_amount: 0,
      fixed_custom3_name: "",
      fixed_custom3_amount: 0,
      subtotal_A: 310000,

      overtime_weekday: 30000,
      overtime_holiday: 10000,
      overtime_restday: 5000,
      overtime_national: 0,
      bonus: 0,
      variable_custom1_name: "業績達成手当",
      variable_custom1_amount: 20000,
      variable_custom2_name: "",
      variable_custom2_amount: 0,
      variable_custom3_name: "",
      variable_custom3_amount: 0,
      subtotal_B: 65000,

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
      id: "B347_1140916",
      employee_id: "B347",
      user_email: "b347@example.com",
      name: "佐藤花子",
      bank_name: "みずほ銀行",
      bank_account: "7654321",
      pay_date: "114-09-16",

      base_salary: 280000,
      meal_allowance: 8000,
      fixed_custom1_name: "交通手当",
      fixed_custom1_amount: 12000,
      fixed_custom2_name: "",
      fixed_custom2_amount: 0,
      fixed_custom3_name: "",
      fixed_custom3_amount: 0,
      subtotal_A: 300000,

      overtime_weekday: 18000,
      overtime_holiday: 6000,
      overtime_restday: 0,
      overtime_national: 0,
      bonus: 30000,
      variable_custom1_name: "繁忙期手当",
      variable_custom1_amount: 15000,
      variable_custom2_name: "",
      variable_custom2_amount: 0,
      variable_custom3_name: "",
      variable_custom3_amount: 0,
      subtotal_B: 69000,

      labor_insurance: 14000,
      health_insurance: 18000,
      national_insurance: 0,
      absence_deduction: 0,
      sick_deduction: 0,
      deduct_custom1_name: "",
      deduct_custom1_amount: 0,
      deduct_custom2_name: "",
      deduct_custom2_amount: 0,
      deduct_custom3_name: "",
      deduct_custom3_amount: 0,
      subtotal_C: 32000
    },
    {
      id: "C567_1140916",
      employee_id: "C567",
      user_email: "c567@example.com",
      name: "鈴木一郎",
      bank_name: "三菱UFJ銀行",
      bank_account: "9876543",
      pay_date: "114-09-16",

      base_salary: 320000,
      meal_allowance: 10000,
      fixed_custom1_name: "役職手当",
      fixed_custom1_amount: 30000,
      fixed_custom2_name: "住宅手当",
      fixed_custom2_amount: 20000,
      fixed_custom3_name: "",
      fixed_custom3_amount: 0,
      subtotal_A: 380000,

      overtime_weekday: 12000,
      overtime_holiday: 0,
      overtime_restday: 0,
      overtime_national: 0,
      bonus: 40000,
      variable_custom1_name: "",
      variable_custom1_amount: 0,
      variable_custom2_name: "",
      variable_custom2_amount: 0,
      variable_custom3_name: "",
      variable_custom3_amount: 0,
      subtotal_B: 52000,

      labor_insurance: 16000,
      health_insurance: 22000,
      national_insurance: 0,
      absence_deduction: 0,
      sick_deduction: 5000,
      deduct_custom1_name: "",
      deduct_custom1_amount: 0,
      deduct_custom2_name: "",
      deduct_custom2_amount: 0,
      deduct_custom3_name: "",
      deduct_custom3_amount: 0,
      subtotal_C: 43000
    },
    
    // 115年1月データ
    {
      id: "A124_1150116",
      employee_id: "A124",
      user_email: "a124@example.com",
      name: "山田太郎",
      bank_name: "三井住友銀行",
      bank_account: "1234567",
      pay_date: "115-01-16",

      base_salary: 310000, // 昇給
      meal_allowance: 10000,
      fixed_custom1_name: "資格手当",
      fixed_custom1_amount: 5000,
      fixed_custom2_name: "",
      fixed_custom2_amount: 0,
      fixed_custom3_name: "",
      fixed_custom3_amount: 0,
      subtotal_A: 325000,

      overtime_weekday: 10000,
      overtime_holiday: 0,
      overtime_restday: 0,
      overtime_national: 15000, // 元旦出勤
      bonus: 100000, // 年始ボーナス
      variable_custom1_name: "",
      variable_custom1_amount: 0,
      variable_custom2_name: "",
      variable_custom2_amount: 0,
      variable_custom3_name: "",
      variable_custom3_amount: 0,
      subtotal_B: 125000,

      labor_insurance: 15500,
      health_insurance: 21000,
      national_insurance: 0,
      absence_deduction: 0,
      sick_deduction: 0,
      deduct_custom1_name: "",
      deduct_custom1_amount: 0,
      deduct_custom2_name: "",
      deduct_custom2_amount: 0,
      deduct_custom3_name: "",
      deduct_custom3_amount: 0,
      subtotal_C: 36500
    },
    {
      id: "B347_1150116",
      employee_id: "B347",
      user_email: "b347@example.com",
      name: "佐藤花子",
      bank_name: "みずほ銀行",
      bank_account: "7654321",
      pay_date: "115-01-16",

      base_salary: 290000, // 昇給
      meal_allowance: 8000,
      fixed_custom1_name: "交通手当",
      fixed_custom1_amount: 12000,
      fixed_custom2_name: "",
      fixed_custom2_amount: 0,
      fixed_custom3_name: "",
      fixed_custom3_amount: 0,
      subtotal_A: 310000,

      overtime_weekday: 5000,
      overtime_holiday: 0,
      overtime_restday: 0,
      overtime_national: 12000, // 元旦出勤
      bonus: 80000, // 年始ボーナス
      variable_custom1_name: "",
      variable_custom1_amount: 0,
      variable_custom2_name: "",
      variable_custom2_amount: 0,
      variable_custom3_name: "",
      variable_custom3_amount: 0,
      subtotal_B: 97000,

      labor_insurance: 14500,
      health_insurance: 19000,
      national_insurance: 0,
      absence_deduction: 0,
      sick_deduction: 0,
      deduct_custom1_name: "",
      deduct_custom1_amount: 0,
      deduct_custom2_name: "",
      deduct_custom2_amount: 0,
      deduct_custom3_name: "",
      deduct_custom3_amount: 0,
      subtotal_C: 33500
    },
    {
      id: "C567_1150116",
      employee_id: "C567",
      user_email: "c567@example.com",
      name: "鈴木一郎",
      bank_name: "三菱UFJ銀行",
      bank_account: "9876543",
      pay_date: "115-01-16",

      base_salary: 330000, // 昇給
      meal_allowance: 10000,
      fixed_custom1_name: "役職手当",
      fixed_custom1_amount: 35000, // 増額
      fixed_custom2_name: "住宅手当",
      fixed_custom2_amount: 20000,
      fixed_custom3_name: "",
      fixed_custom3_amount: 0,
      subtotal_A: 395000,

      overtime_weekday: 0,
      overtime_holiday: 0,
      overtime_restday: 0,
      overtime_national: 20000, // 元旦出勤
      bonus: 150000, // 年始ボーナス
      variable_custom1_name: "特別功労金",
      variable_custom1_amount: 50000,
      variable_custom2_name: "",
      variable_custom2_amount: 0,
      variable_custom3_name: "",
      variable_custom3_amount: 0,
      subtotal_B: 220000,

      labor_insurance: 16500,
      health_insurance: 23000,
      national_insurance: 0,
      absence_deduction: 0,
      sick_deduction: 0,
      deduct_custom1_name: "",
      deduct_custom1_amount: 0,
      deduct_custom2_name: "",
      deduct_custom2_amount: 0,
      deduct_custom3_name: "",
      deduct_custom3_amount: 0,
      subtotal_C: 39500
    },
    
    // 115年8月データ
    {
      id: "A124_1150816",
      employee_id: "A124",
      user_email: "a124@example.com",
      name: "山田太郎",
      bank_name: "三井住友銀行",
      bank_account: "1234567",
      pay_date: "115-08-16",

      base_salary: 310000,
      meal_allowance: 10000,
      fixed_custom1_name: "資格手当",
      fixed_custom1_amount: 5000,
      fixed_custom2_name: "",
      fixed_custom2_amount: 0,
      fixed_custom3_name: "",
      fixed_custom3_amount: 0,
      subtotal_A: 325000,

      overtime_weekday: 25000,
      overtime_holiday: 8000,
      overtime_restday: 0,
      overtime_national: 0,
      bonus: 60000, // 夏季ボーナス
      variable_custom1_name: "プロジェクト手当",
      variable_custom1_amount: 30000,
      variable_custom2_name: "",
      variable_custom2_amount: 0,
      variable_custom3_name: "",
      variable_custom3_amount: 0,
      subtotal_B: 123000,

      labor_insurance: 15500,
      health_insurance: 21000,
      national_insurance: 0,
      absence_deduction: 0,
      sick_deduction: 0,
      deduct_custom1_name: "",
      deduct_custom1_amount: 0,
      deduct_custom2_name: "",
      deduct_custom2_amount: 0,
      deduct_custom3_name: "",
      deduct_custom3_amount: 0,
      subtotal_C: 36500
    },
    {
      id: "B347_1150816",
      employee_id: "B347",
      user_email: "b347@example.com",
      name: "佐藤花子",
      bank_name: "みずほ銀行",
      bank_account: "7654321",
      pay_date: "115-08-16",

      base_salary: 290000,
      meal_allowance: 8000,
      fixed_custom1_name: "交通手当",
      fixed_custom1_amount: 12000,
      fixed_custom2_name: "",
      fixed_custom2_amount: 0,
      fixed_custom3_name: "",
      fixed_custom3_amount: 0,
      subtotal_A: 310000,

      overtime_weekday: 20000,
      overtime_holiday: 7000,
      overtime_restday: 0,
      overtime_national: 0,
      bonus: 45000, // 夏季ボーナス
      variable_custom1_name: "繁忙期手当",
      variable_custom1_amount: 12000,
      variable_custom2_name: "",
      variable_custom2_amount: 0,
      variable_custom3_name: "",
      variable_custom3_amount: 0,
      subtotal_B: 84000,

      labor_insurance: 14500,
      health_insurance: 19000,
      national_insurance: 0,
      absence_deduction: 3000,
      sick_deduction: 0,
      deduct_custom1_name: "",
      deduct_custom1_amount: 0,
      deduct_custom2_name: "",
      deduct_custom2_amount: 0,
      deduct_custom3_name: "",
      deduct_custom3_amount: 0,
      subtotal_C: 36500
    },
    {
      id: "C567_1150816",
      employee_id: "C567",
      user_email: "c567@example.com",
      name: "鈴木一郎",
      bank_name: "三菱UFJ銀行",
      bank_account: "9876543",
      pay_date: "115-08-16",

      base_salary: 330000,
      meal_allowance: 10000,
      fixed_custom1_name: "役職手当",
      fixed_custom1_amount: 35000,
      fixed_custom2_name: "住宅手当",
      fixed_custom2_amount: 20000,
      fixed_custom3_name: "",
      fixed_custom3_amount: 0,
      subtotal_A: 395000,

      overtime_weekday: 10000,
      overtime_holiday: 0,
      overtime_restday: 0,
      overtime_national: 0,
      bonus: 80000, // 夏季ボーナス
      variable_custom1_name: "管理職手当",
      variable_custom1_amount: 25000,
      variable_custom2_name: "",
      variable_custom2_amount: 0,
      variable_custom3_name: "",
      variable_custom3_amount: 0,
      subtotal_B: 115000,

      labor_insurance: 16500,
      health_insurance: 23000,
      national_insurance: 0,
      absence_deduction: 0,
      sick_deduction: 0,
      deduct_custom1_name: "",
      deduct_custom1_amount: 0,
      deduct_custom2_name: "",
      deduct_custom2_amount: 0,
      deduct_custom3_name: "",
      deduct_custom3_amount: 0,
      subtotal_C: 39500
    },
    {
      id: "D789_1150816", // 新入社員
      employee_id: "D789",
      user_email: "d789@example.com",
      name: "高橋雅子",
      bank_name: "りそな銀行",
      bank_account: "2468013",
      pay_date: "115-08-16",

      base_salary: 270000,
      meal_allowance: 8000,
      fixed_custom1_name: "",
      fixed_custom1_amount: 0,
      fixed_custom2_name: "",
      fixed_custom2_amount: 0,
      fixed_custom3_name: "",
      fixed_custom3_amount: 0,
      subtotal_A: 278000,

      overtime_weekday: 15000,
      overtime_holiday: 0,
      overtime_restday: 0,
      overtime_national: 0,
      bonus: 20000, // 初回ボーナス
      variable_custom1_name: "",
      variable_custom1_amount: 0,
      variable_custom2_name: "",
      variable_custom2_amount: 0,
      variable_custom3_name: "",
      variable_custom3_amount: 0,
      subtotal_B: 35000,

      labor_insurance: 13500,
      health_insurance: 17000,
      national_insurance: 0,
      absence_deduction: 0,
      sick_deduction: 0,
      deduct_custom1_name: "",
      deduct_custom1_amount: 0,
      deduct_custom2_name: "",
      deduct_custom2_amount: 0,
      deduct_custom3_name: "",
      deduct_custom3_amount: 0,
      subtotal_C: 30500
    }
  ];

  // 如果沒有指定年月，返回所有記錄
  if (!rocYear || !month) {
    return allRecords;
  }

  // デバッグ情報
  console.log(`Filtering for ROC year: ${rocYear}, month: ${month}`);
  
  // 根據年月過濾記錄
  const filteredRecords = allRecords.filter(record => {
    // 形式例: "114-08-16" (民国年-月-日)
    const parts = record.pay_date.split('-');
    const recordYear = parseInt(parts[0], 10);
    const recordMonth = parseInt(parts[1], 10);
    
    console.log(`Record date: ${record.pay_date}, parsed as year: ${recordYear}, month: ${recordMonth}`);
    
    return recordYear === rocYear && recordMonth === month;
  });
  
  console.log(`Found ${filteredRecords.length} records matching year ${rocYear} and month ${month}`);
  
  return filteredRecords;
};
