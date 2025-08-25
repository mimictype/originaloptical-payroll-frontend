import './EmployeeInfo.css';
import Section from './Section';
import type { EmployeeData } from '../types/index';

interface EmployeeInfoProps {
  employee: EmployeeData;
  editable?: boolean;
  showEmail?: boolean;
  onChange?: (field: keyof EmployeeData, value: string) => void;
}

function EmployeeInfo({ employee, editable = false, showEmail = true, onChange }: EmployeeInfoProps) {
  return (
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
                    value={employee.employee_id}
                    className="employee-input"
                    onChange={e => onChange && onChange('employee_id', e.target.value)}
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
                    value={employee.name}
                    className="employee-input"
                    onChange={e => onChange && onChange('name', e.target.value)}
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
                      value={employee.user_email}
                      className="employee-input"
                      onChange={e => onChange && onChange('user_email', e.target.value)}
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
                    value={employee.bank_name}
                    className="employee-input"
                    onChange={e => onChange && onChange('bank_name', e.target.value)}
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
                    value={employee.bank_account}
                    className="employee-input"
                    onChange={e => onChange && onChange('bank_account', e.target.value)}
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
}

export default EmployeeInfo;
