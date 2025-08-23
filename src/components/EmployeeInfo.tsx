import { type FC } from 'react';
import './EmployeeInfo.css';
import Section from './Section';
import type { Employee } from '../types/employee';

interface EmployeeInfoProps {
  employee: Employee;
  editable?: boolean;
  showEmail?: boolean;
}

const EmployeeInfo: FC<EmployeeInfoProps> = ({ employee, editable = false, showEmail = true }) => (
  <Section title="基本資料">
    <div className="employee-info">
      <table className="employee-table">
        <tbody>
          <tr>
            <td>員工ID</td>
            <td>
              {editable ? (
                            <input
                              type="text"
                              defaultValue={employee.employee_id}
                              className="employee-input"
                            />
              ) : (
                employee.employee_id
              )}
            </td>
          </tr>
          <tr>
            <td>姓名</td>
            <td>
              {editable ? (
                            <input
                              type="text"
                              defaultValue={employee.name}
                              className="employee-input"
                            />
              ) : (
                employee.name
              )}
            </td>
          </tr>
          {showEmail && (
            <tr>
              <td>Email</td>
              <td>
                {editable ? (
                  <input
                    type="email"
                    defaultValue={employee.user_email}
                    className="employee-input"
                  />
                ) : (
                  employee.user_email
                )}
              </td>
            </tr>
          )}
          <tr>
            <td>銀行</td>
            <td>
              {editable ? (
                            <input
                              type="text"
                              defaultValue={employee.bank_name}
                              className="employee-input"
                            />
              ) : (
                employee.bank_name
              )}
            </td>
          </tr>
          <tr>
            <td>帳號</td>
            <td>
              {editable ? (
                            <input
                              type="text"
                              defaultValue={employee.bank_account}
                              className="employee-input"
                            />
              ) : (
                employee.bank_account
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </Section>
);

export default EmployeeInfo;
