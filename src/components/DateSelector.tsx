import { useState, useEffect } from 'react';

interface DateSelectorProps {
  onDateChange: (year: number, month: number) => void;
}

const DateSelector = ({ onDateChange }: DateSelectorProps) => {
  // Get current ROC year and month for default values
  const now = new Date();
  const currentRocYear = now.getFullYear() - 1911;
  const currentMonth = now.getMonth() + 1;
  
  // State for tracking the current selected year and month
  const [rocYear, setRocYear] = useState<number>(currentRocYear);
  const [month, setMonth] = useState<number>(currentMonth);
  
  // Years and months for dropdown selection
  // Show past 10 years + next year (12 years total), and filter years before ROC 114
  const years = Array.from({ length: 12 }, (_, i) => currentRocYear - 10 + i).filter(y => y >= 114 && y <= currentRocYear + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Dropdown visibility states
  const [yearDropdownVisible, setYearDropdownVisible] = useState<boolean>(false);
  const [monthDropdownVisible, setMonthDropdownVisible] = useState<boolean>(false);
  
  // Notify parent of initial date on component mount
  useEffect(() => {
    // Notify parent component of initial date
    onDateChange(rocYear, month);
    // This effect should run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Handle navigation to previous month
  const handlePrevMonth = () => {
    let newYear = rocYear;
    let newMonth = month - 1;
    
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    
    // Don't go below year 1
    if (newYear < 1) {
      newYear = 1;
      newMonth = 1;
    }
    
    console.log(`Moving to previous month: ${newYear}年 ${newMonth}月`);
    setRocYear(newYear);
    setMonth(newMonth);
    onDateChange(newYear, newMonth);
  };
  
  // Handle navigation to next month
  const handleNextMonth = () => {
    let newYear = rocYear;
    let newMonth = month + 1;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    
    console.log(`Moving to next month: ${newYear}年 ${newMonth}月`);
    setRocYear(newYear);
    setMonth(newMonth);
    onDateChange(newYear, newMonth);
  };
  
  // Handle year selection from dropdown
  const handleYearSelect = (year: number) => {
    setRocYear(year);
    setYearDropdownVisible(false);
    onDateChange(year, month);
  };
  
  // Handle month selection from dropdown
  const handleMonthSelect = (month: number) => {
    setMonth(month);
    setMonthDropdownVisible(false);
    onDateChange(rocYear, month);
  };
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click was outside the dropdown areas
      const target = event.target as HTMLElement;
      const isOutsideDropdown = !target.closest('.date-select-container');
      
      if (isOutsideDropdown) {
        setYearDropdownVisible(false);
        setMonthDropdownVisible(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="date-selector">
      <button 
        className="nav-button prev"
        onClick={(e) => {
          e.stopPropagation();
          handlePrevMonth();
        }}
        aria-label="上個月"
        type="button"
      >
        &lt;
      </button>
      
      <div className="date-display">
        <div className="date-select-container">
          <div 
            className="date-select"
            onClick={(e) => {
              e.stopPropagation();
              setYearDropdownVisible(!yearDropdownVisible);
              setMonthDropdownVisible(false);
            }}
          >
            <span className="date-value">{rocYear}</span>
            <span className="date-label">年</span>
            <span className="dropdown-arrow">▼</span>
          </div>
          
          {yearDropdownVisible && (
            <div className="date-dropdown">
              {years.map(year => (
                <div 
                  key={year} 
                  className={`dropdown-item ${year === rocYear ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleYearSelect(year);
                  }}
                >
                  {year}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="date-select-container">
          <div 
            className="date-select"
            onClick={(e) => {
              e.stopPropagation();
              setMonthDropdownVisible(!monthDropdownVisible);
              setYearDropdownVisible(false);
            }}
          >
            <span className="date-value">{month}</span>
            <span className="date-label">月</span>
            <span className="dropdown-arrow">▼</span>
          </div>
          
          {monthDropdownVisible && (
            <div className="date-dropdown">
              {months.map(m => (
                <div 
                  key={m} 
                  className={`dropdown-item ${m === month ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMonthSelect(m);
                  }}
                >
                  {m}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <button 
        className="nav-button next"
        onClick={(e) => {
          e.stopPropagation();
          handleNextMonth();
        }}
        aria-label="下個月"
        type="button"
      >
        &gt;
      </button>
    </div>
  );
};

export default DateSelector;
