// API服務的實現
import type { PayrollData, LeaveData, EmployeeData, EmployeeListData } from '../types/index';

// API URL
const API_URL = 'https://script.google.com/macros/s/AKfycbwP1du1w3CEPLMqTSsynBEjlj7mHTRfR4pdFay4BReJEFB0dy_Pp7INTeTM-Wl6qpW13Q/exec';

// 従業員の作成
export const createEmployee = async (payload: Partial<EmployeeData>) => {
  const params = new URLSearchParams();
  params.append('action', 'createemployee');
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) params.append(key, String(value));
  });
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
    body: params,
  });
  return await response.json();
};

// 従業員の更新
export const updateEmployee = async (payload: Partial<EmployeeData>) => {
  const params = new URLSearchParams();
  params.append('action', 'updateemployee');
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) params.append(key, String(value));
  });
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
    body: params,
  });
  return await response.json();
};

// 従業員の削除
export const deleteEmployee = async (employee_id: string) => {
  const params = new URLSearchParams();
  params.append('action', 'deleteemployee');
  params.append('employee_id', employee_id);
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
    body: params,
  });
  return await response.json();
};

// 従業員一覧を取得する関数
export const fetchEmployees = async (): Promise<EmployeeData[]> => {
  try {
    console.log('Fetching employees from API');
    const response = await fetch(`${API_URL}?action=listEmployees`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data: EmployeeListData = await response.json();
    if (data.status !== 'success') {
      throw new Error('Failed to fetch employees');
    }
    return data.data;
  } catch (error) {
    console.error('従業員一覧の取得に失敗しました', error);
    throw error;
  }
};

// 特定従業員の給与明細を取得する関数
export const fetchEmployeePayroll = async (employeeId: string, year: number, month: number): Promise<PayrollData> => {
  try {
    // 月は2桁にパディング
    const monthStr = month.toString().padStart(2, '0');
    console.log(`Fetching payroll from API for ${employeeId} ${year}年${month}月`);
    // API呼び出し - 従業員ID_YYMM形式 (民国年を使用)
    const response = await fetch(`${API_URL}?action=getPayroll&id=${employeeId}_${year}${monthStr}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    if (data.status !== 'success') {
      throw new Error(`Failed to fetch payroll for employee ${employeeId}`);
    }
    // APIレスポンスはすでに民国年形式なので変換不要
    // 注意: レスポンスでは "record" キーにデータが格納されている
    const record = data.record;
    return record;
  } catch (error) {
    console.error(`従業員${employeeId}の給与明細取得に失敗しました`, error);
    throw error;
  }
};

// 特定従業員の休暇明細を取得する関数
export const fetchEmployeeLeave = async (employeeId: string, year: number, month: number): Promise<LeaveData> => {
  try {
    // 月は2桁にパディング
    const monthStr = month.toString().padStart(2, '0');
    console.log(`Fetching leave from API for ${employeeId} ${year}年${month}月`);
    // API呼び出し - 従業員ID_YYMM形式 (民国年を使用)
    const response = await fetch(`${API_URL}?action=getleave&id=${employeeId}_${year}${monthStr}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    if (data.status !== 'success') {
      throw new Error(`Failed to fetch leave for employee ${employeeId}`);
    }
    // APIレスポンスでは "record" キーにデータが格納されている
    const leaveRecord = data.record;
    return leaveRecord;
  } catch (error) {
    console.error(`従業員${employeeId}の休暇明細取得に失敗しました`, error);
    throw error;
  }
};
