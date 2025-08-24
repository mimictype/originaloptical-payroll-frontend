import { Routes, Route } from 'react-router-dom'
import './App.css'
import './components/styles.css'
import TopPage from './pages/TopPage'
import PayrollQueryPage from './pages/PayrollQueryPage';
import PayrollCreatePage from './pages/PayrollCreatePage';
import PayrollDetailPage from './pages/PayrollDetailPage'
import EmployeeManagementPage from './pages/EmployeeManagementPage'
import EmployeeManagementDetailPage from './pages/EmployeeManagementDetailPage'
import PayrollManagementPage from './pages/PayrollManagementPage'
import PayrollEditPage from './pages/PayrollEditPage';

function App() {
  return (
    <div className="container">
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/payroll-query" element={<PayrollQueryPage />} />
        <Route path="/payroll/:employeeId/:year/:month" element={<PayrollDetailPage />} />
        <Route path="/employee-management" element={<EmployeeManagementPage />} />
        <Route path="/employee-management/create" element={<EmployeeManagementDetailPage />} />
        <Route path="/employee-management/:employee_id" element={<EmployeeManagementDetailPage />} />
        <Route path="/payroll-management" element={<PayrollManagementPage />} />
        <Route path="/payroll-edit/:employeeId/:year/:month" element={<PayrollEditPage />} />
        <Route path="/payroll-create/:employeeId/:year/:month" element={<PayrollCreatePage />} />
      </Routes>
    </div>
  );
}

export default App;
