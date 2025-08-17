import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import './components/styles.css'
import TopPage from './pages/TopPage'
import EmployeeListPage from './pages/EmployeeListPage'
import PayrollDetail from './pages/PayrollDetail'

function App() {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/employees" element={<EmployeeListPage />} />
          <Route path="/payroll/:employeeId/:year/:month" element={<PayrollDetail />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
