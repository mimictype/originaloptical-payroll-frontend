import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import './components/styles.css'
import TopPage from './pages/TopPage'
import PayrollQueryPage from './pages/PayrollQueryPage'
import PayrollDetailPage from './pages/PayrollDetailPage'
import EmployeeManagementPage from './pages/EmployeeManagementPage'

function App() {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/payroll-query" element={<PayrollQueryPage />} />
          <Route path="/payroll/:employeeId/:year/:month" element={<PayrollDetailPage />} />
            <Route path="/employee-management" element={<EmployeeManagementPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
