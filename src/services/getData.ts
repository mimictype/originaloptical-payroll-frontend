
import { getCache, setCache } from '../utils/cache';
import { fetchEmployees, fetchEmployeePayroll, fetchEmployeeLeave } from './api';

/** 従業員一覧を取得（キャッシュ優先） */
export async function getEmployees(): Promise<any> {
	const cacheKey = 'employees';
	const cached = getCache<any>(cacheKey);
	if (cached) return cached;
	const data = await fetchEmployees();
	setCache(cacheKey, data);
	return data;
}
/** 特定従業員を取得（キャッシュ優先） */
export async function getEmployee(employeeId: string): Promise<any> {
	// 一覧キャッシュのみ利用し、個別キャッシュはしない
	const employees = await getEmployees();
	const found = employees.find((e: any) => e.employee_id === employeeId);
	return found || null;
}

/** 特定従業員の給与明細を取得（キャッシュ優先） */
export async function getEmployeePayroll(employeeId: string, year: number, month: number): Promise<any> {
	const cacheKey = `payroll_${employeeId}_${year}_${month}`;
	const cached = getCache<any>(cacheKey);
	if (cached) return cached;
	const data = await fetchEmployeePayroll(employeeId, year, month);
	setCache(cacheKey, data);
	return data;
}

/** 特定従業員の休暇明細を取得（キャッシュ優先） */
export async function getEmployeeLeave(employeeId: string, year: number, month: number): Promise<any> {
	const cacheKey = `leave_${employeeId}_${year}_${month}`;
	const cached = getCache<any>(cacheKey);
	if (cached) return cached;
	const data = await fetchEmployeeLeave(employeeId, year, month);
	setCache(cacheKey, data);
	return data;
}
