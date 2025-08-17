// API服務的實現
import type { Record } from '../types';
import type { Employee, EmployeeListResponse } from '../types/employee';
import { getCache, setCache } from '../utils/cache';


// API URL
const API_URL = 'https://script.google.com/macros/s/AKfycby2fCuLqOpK4FQBixl2Wl9aD4cwtSfRXYo66qHUgjKiPegnrgNYztYSabB9b17yPhU1eA/exec';

// Cache keys
export const CACHE_KEYS = {
  EMPLOYEES: 'employees',
  RECORDS: (year: number, month: number) => `records_${year}_${month}`,
  PAYROLL: (employeeId: string, year: number, month: number) => `payroll_${employeeId}_${year}_${month}`,
};

// 従業員一覧を取得する関数
export const fetchEmployees = async (useCache = true): Promise<Employee[]> => {
  try {
    // Check cache first if useCache is true
    if (useCache) {
      const cachedData = getCache<Employee[]>(CACHE_KEYS.EMPLOYEES);
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
    
    const data: EmployeeListResponse = await response.json();
    
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
export const fetchRecords = async (rocYear?: number, month?: number, useCache = true): Promise<Record[]> => {
  try {
    if (!rocYear || !month) {
      throw new Error('年月を指定してください');
    }
    
    // Check cache first if useCache is true
    if (useCache) {
      const cacheKey = CACHE_KEYS.RECORDS(rocYear, month);
      const cachedData = getCache<Record[]>(cacheKey);
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
export const fetchEmployeePayroll = async (employeeId: string, year: number, month: number, useCache = true): Promise<Record> => {
  try {
    // Check cache first if useCache is true
    if (useCache) {
      const cacheKey = CACHE_KEYS.PAYROLL(employeeId, year, month);
      const cachedData = getCache<Record>(cacheKey);
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
