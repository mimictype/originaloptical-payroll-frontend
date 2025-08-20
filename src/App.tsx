import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import './components/styles.css'
import TopPage from './pages/TopPage'
import PayrollQueryPage from './pages/PayrollQueryPage'
import PayrollDetailPage from './pages/PayrollDetailPage'
import EmployeeManagementPage from './pages/EmployeeManagementPage'
import EmployeeManagementDetailPage from './pages/EmployeeManagementDetailPage'
import PayrollManagementPage from './pages/PayrollManagementPage'
import PayrollEditPage from './pages/PayrollEditPage';
import PayrollCreatePage from './pages/PayrollCreatePage';

function App() {
  return (
    <Router>
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
    </Router>
  )
}

export default App
