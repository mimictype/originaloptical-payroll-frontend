// API服務的實現
import type { Record } from '../types';
import type { Employee, EmployeeListResponse } from '../types/employee';

// 西暦から民国年への変換
export const convertToROCYear = (westernYear: number): number => {
  return westernYear - 1911;
};

// 民国年から西暦への変換
export const convertToWesternYear = (rocYear: number): number => {
  return rocYear + 1911;
};

// API URL
const API_URL = 'https://script.google.com/macros/s/AKfycby2fCuLqOpK4FQBixl2Wl9aD4cwtSfRXYo66qHUgjKiPegnrgNYztYSabB9b17yPhU1eA/exec';

// 従業員一覧を取得する関数
export const fetchEmployees = async (): Promise<Employee[]> => {
  try {
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

// 指定月の給与明細一覧を取得する関数（複数社員）
export const fetchRecords = async (rocYear?: number, month?: number): Promise<Record[]> => {
  try {
    if (!rocYear || !month) {
      throw new Error('年月を指定してください');
    }
    
    // 月は2桁にパディング
    const monthStr = month.toString().padStart(2, '0');
    
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
    
    // APIレスポンスはすでに民国年形式なので変換不要
    return data.data;
  } catch (error) {
    console.error('給与明細の取得に失敗しました', error);
    throw error;
  }
};

// 特定従業員の給与明細を取得する関数
export const fetchEmployeePayroll = async (employeeId: string, year: number, month: number): Promise<Record> => {
  try {    
    // 月は2桁にパディング
    const monthStr = month.toString().padStart(2, '0');
    
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
    
    return record;
  } catch (error) {
    console.error(`従業員${employeeId}の給与明細取得に失敗しました`, error);
    throw error;
  }
};
