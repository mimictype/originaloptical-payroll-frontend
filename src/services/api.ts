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
// API服務的實現
import type { PayrollData, LeaveData, EmployeeData, EmployeeListData } from '../types/index';
import { getCache, setCache } from '../utils/cache';


// API URL
const API_URL = 'https://script.google.com/macros/s/AKfycbwP1du1w3CEPLMqTSsynBEjlj7mHTRfR4pdFay4BReJEFB0dy_Pp7INTeTM-Wl6qpW13Q/exec';

// Cache keys
export const CACHE_KEYS = {
  EMPLOYEES: 'employees',
  RECORDS: (year: number, month: number) => `records_${year}_${month}`,
  PAYROLL: (employeeId: string, year: number, month: number) => `payroll_${employeeId}_${year}_${month}`,
  LEAVE_DETAILS: (employeeId: string, year: number, month: number) => `leave_${employeeId}_${year}_${month}`,
};

// 従業員一覧を取得する関数
export const fetchEmployees = async (useCache = true): Promise<EmployeeData[]> => {
  try {
    // Check cache first if useCache is true
    if (useCache) {
      const cachedData = getCache<EmployeeData[]>(CACHE_KEYS.EMPLOYEES);
      if (cachedData) {
        console.log('Using cached employee data');
        return cachedData;
      }
    }
    
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
    
    // Store in cache
    setCache(CACHE_KEYS.EMPLOYEES, data.data);
    
    return data.data;
  } catch (error) {
    console.error('従業員一覧の取得に失敗しました', error);
    throw error;
  }
};

// 指定月の給与明細一覧を取得する関数（複数社員）
export const fetchRecords = async (rocYear?: number, month?: number, useCache = true): Promise<PayrollData[]> => {
  try {
    if (!rocYear || !month) {
      throw new Error('年月を指定してください');
    }
    
    // Check cache first if useCache is true
    if (useCache) {
      const cacheKey = CACHE_KEYS.RECORDS(rocYear, month);
      const cachedData = getCache<PayrollData[]>(cacheKey);
      if (cachedData) {
        console.log(`Using cached records data for ${rocYear}年${month}月`);
        return cachedData;
      }
    }
    
    // 月は2桁にパディング
    const monthStr = month.toString().padStart(2, '0');
    
    console.log(`Fetching records from API for ${rocYear}年${month}月`);
    // APIコール (民国年を使用)
    const response = await fetch(`${API_URL}?action=listRecords&year=${rocYear}&month=${monthStr}`, {
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
      throw new Error('Failed to fetch records');
    }
    
    // Store in cache
    const cacheKey = CACHE_KEYS.RECORDS(rocYear, month);
    setCache(cacheKey, data.data);
    
    // APIレスポンスはすでに民国年形式なので変換不要
    return data.data;
  } catch (error) {
    console.error('給与明細の取得に失敗しました', error);
    throw error;
  }
};

// 特定従業員の給与明細を取得する関数
export const fetchEmployeePayroll = async (employeeId: string, year: number, month: number, useCache = true): Promise<PayrollData> => {
  try {
    // Check cache first if useCache is true
    if (useCache) {
      const cacheKey = CACHE_KEYS.PAYROLL(employeeId, year, month);
      const cachedData = getCache<PayrollData>(cacheKey);
      if (cachedData) {
        console.log(`Using cached payroll data for ${employeeId} ${year}年${month}月`);
        return cachedData;
      }
    }
    
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
    
    // pay_dateが数値形式(例: 1140816)の場合、文字列形式(例: "114-08-16")に変換
    if (typeof record.pay_date === 'number') {
      const payDateStr = record.pay_date.toString();
      const year = payDateStr.substring(0, 3);
      const month = payDateStr.substring(3, 5);
      const day = payDateStr.substring(5, 7);
      record.pay_date = `${year}-${month}-${day}`;
    }
    
    // Store in cache
    const cacheKey = CACHE_KEYS.PAYROLL(employeeId, year, month);
    setCache(cacheKey, record);
    
    return record;
  } catch (error) {
    console.error(`従業員${employeeId}の給与明細取得に失敗しました`, error);
    throw error;
  }
};

// 特定従業員の休暇明細を取得する関数
export const fetchEmployeeLeave = async (employeeId: string, year: number, month: number, useCache = true): Promise<LeaveData> => {
  try {
    // Check cache first if useCache is true
    if (useCache) {
      const cacheKey = CACHE_KEYS.LEAVE_DETAILS(employeeId, year, month);
      const cachedData = getCache<LeaveData>(cacheKey);
      if (cachedData) {
        console.log(`Using cached leave data for ${employeeId} ${year}年${month}月`);
        return cachedData;
      }
    }
    
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
    
    // Store in cache
    const cacheKey = CACHE_KEYS.LEAVE_DETAILS(employeeId, year, month);
    setCache(cacheKey, leaveRecord);
    
    return leaveRecord;
  } catch (error) {
    console.error(`従業員${employeeId}の休暇明細取得に失敗しました`, error);
    throw error;
  }
};
