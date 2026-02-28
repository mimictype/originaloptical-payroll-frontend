// API服務的實現
import type { PayrollData, LeaveData, EmployeeData, EmployeeListData } from '../types/index';
import { setCache, getCache, clearCache } from '../utils/cache';

// API URL
const API_URL = 'https://script.google.com/macros/s/AKfycbz4q5eVez44_qyRMfNs8zTRB-uaqMDWlgcjOcUN4zrORU5OnZOJBJ4VWxE94WtBdvj4sw/exec';

// 従業員の作成
export const createEmployee = async (payload: Partial<EmployeeData>, idToken?: string) => {
  if (!idToken) idToken = localStorage.getItem('id_token') || undefined;
  const params = new URLSearchParams();
  params.append('action', 'createemployee');
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) params.append(key, String(value));
  });
  if (idToken) params.append('id_token', idToken);
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
    body: params,
  });
  const result = await response.json();
  if (result.status === 'success' && result.record) {
    setCache(`employee_${result.record.employee_id}`, result.record);
    // 一覧キャッシュも追加
    const employees = getCache<EmployeeData[]>('employees') || [];
    setCache('employees', [...employees, result.record]);
  }
  return result;
};

// 従業員の更新
export const updateEmployee = async (payload: Partial<EmployeeData>, idToken?: string) => {
  if (!idToken) idToken = localStorage.getItem('id_token') || undefined;
  const params = new URLSearchParams();
  params.append('action', 'updateemployee');
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) params.append(key, String(value));
  });
  if (idToken) params.append('id_token', idToken);
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
    body: params,
  });
  const result = await response.json();
  if (result.status === 'success' && result.record) {
    setCache(`employee_${result.record.employee_id}`, result.record);
    // 一覧キャッシュも更新
    const employees = getCache<EmployeeData[]>('employees') || [];
    setCache('employees', employees.map(e => e.employee_id === result.record.employee_id ? result.record : e));
  }
  return result;
};

// 従業員の削除
export const deleteEmployee = async (employee_id: string, idToken?: string) => {
  if (!idToken) idToken = localStorage.getItem('id_token') || undefined;
  const params = new URLSearchParams();
  params.append('action', 'deleteemployee');
  params.append('employee_id', employee_id);
  if (idToken) params.append('id_token', idToken);
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
    body: params,
  });
  const result = await response.json();
  if (result.status === 'success') {
    clearCache(`employee_${employee_id}`);
    // 一覧キャッシュも削除
    const employees = getCache<EmployeeData[]>('employees') || [];
    setCache('employees', employees.filter(e => e.employee_id !== employee_id));
  }
  return result;
};

// 従業員一覧を取得する関数
export const fetchEmployees = async (): Promise<EmployeeData[]> => {
  try {
    console.log('Fetching employees from API');
    const idToken = localStorage.getItem('id_token');
    const url = idToken ? `${API_URL}?action=listEmployees&id_token=${encodeURIComponent(idToken)}` : `${API_URL}?action=listEmployees`;
    const response = await fetch(url, {
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
    console.error('取得員工列表失敗', error);
    throw error;
  }
};

// 特定従業員の給与明細を取得する関数
export const fetchEmployeePayroll = async (employeeId: string, year: number, month: number): Promise<PayrollData> => {
  try {
    // 月は2桁にパディング
    const monthStr = month.toString().padStart(2, '0');
    console.log(`Fetching payroll from API for ${employeeId} ${year}年${month}月`);
    const idToken = localStorage.getItem('id_token');
    const url = idToken
      ? `${API_URL}?action=getPayroll&id=${employeeId}_${year}${monthStr}&id_token=${encodeURIComponent(idToken)}`
      : `${API_URL}?action=getPayroll&id=${employeeId}_${year}${monthStr}`;
    const response = await fetch(url, {
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
    console.error(`取得員工${employeeId}的薪資明細失敗`, error);
    throw error;
  }
};

// 特定従業員の休暇明細を取得する関数
export const fetchEmployeeLeave = async (employeeId: string, year: number, month: number): Promise<LeaveData> => {
  try {
    // 月は2桁にパディング
    const monthStr = month.toString().padStart(2, '0');
    console.log(`Fetching leave from API for ${employeeId} ${year}年${month}月`);
    const idToken = localStorage.getItem('id_token');
    const url = idToken
      ? `${API_URL}?action=getleave&id=${employeeId}_${year}${monthStr}&id_token=${encodeURIComponent(idToken)}`
      : `${API_URL}?action=getleave&id=${employeeId}_${year}${monthStr}`;
    const response = await fetch(url, {
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
    console.error(`取得員工${employeeId}的休假明細失敗`, error);
    throw error;
  }
};

// 給与明細の更新
export const updatePayroll = async (payload: Partial<PayrollData>, idToken?: string) => {
  if (!idToken) idToken = localStorage.getItem('id_token') || undefined;
  const params = new URLSearchParams();
  params.append('action', 'updatepayroll');
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) params.append(key, String(value));
  });
  if (idToken) params.append('id_token', idToken);
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
    body: params,
  });
  const result = await response.json();
  if (result.status === 'success' && result.data) {
    setCache(`payroll_${result.data.id}`, result.data);
  }
  return result;
};

// 休暇明細の更新
export const updateLeave = async (payload: Partial<LeaveData>, idToken?: string) => {
  if (!idToken) idToken = localStorage.getItem('id_token') || undefined;
  const params = new URLSearchParams();
  params.append('action', 'updateleave');
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) params.append(key, String(value));
  });
  if (idToken) params.append('id_token', idToken);
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
    body: params,
  });
  const result = await response.json();
  if (result.status === 'success' && result.data) {
    setCache(`leave_${result.data.id}`, result.data);
  }
  return result;
};

// 給与明細の削除
export const deletePayroll = async (id: string, idToken?: string) => {
  if (!idToken) idToken = localStorage.getItem('id_token') || undefined;
  const params = new URLSearchParams();
  params.append('action', 'deletepayroll');
  params.append('id', id);
  if (idToken) params.append('id_token', idToken);
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
    body: params,
  });
  const result = await response.json();
  if (result.status === 'success') {
    clearCache(`payroll_${id}`);
  }
  return result;
};

// 休暇明細の削除
export const deleteLeave = async (id: string, idToken?: string) => {
  if (!idToken) idToken = localStorage.getItem('id_token') || undefined;
  const params = new URLSearchParams();
  params.append('action', 'deleteleave');
  params.append('id', id);
  if (idToken) params.append('id_token', idToken);
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
    body: params,
  });
  const result = await response.json();
  if (result.status === 'success') {
    clearCache(`leave_${id}`);
  }
  return result;
};

// 給与明細の作成
export const createPayroll = async (payload: Partial<PayrollData>, idToken?: string) => {
  if (!idToken) idToken = localStorage.getItem('id_token') || undefined;
  const params = new URLSearchParams();
  params.append('action', 'createpayroll');
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) params.append(key, String(value));
  });
  if (idToken) params.append('id_token', idToken);
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
    body: params,
  });
  const result = await response.json();
  if (result.status === 'success' && result.data) {
    setCache(`payroll_${result.data.id}`, result.data);
  }
  return result;
};

// 休暇明細の作成
export const createLeave = async (payload: Partial<LeaveData>, idToken?: string) => {
  if (!idToken) idToken = localStorage.getItem('id_token') || undefined;
  const params = new URLSearchParams();
  params.append('action', 'createleave');
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) params.append(key, String(value));
  });
  if (idToken) params.append('id_token', idToken);
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
    body: params,
  });
  const result = await response.json();
  if (result.status === 'success' && result.data) {
    setCache(`leave_${result.data.id}`, result.data);
  }
  return result;
};
