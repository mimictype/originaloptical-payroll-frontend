
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackButton.css';

interface BackButtonProps {
  label?: string;
  navigateTo?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ label = '首頁', navigateTo = '/' }) => {
  const navigate = useNavigate();
  return (
    <div className="back-button-container">
      <button 
        className="back-button"
        onClick={() => navigate(navigateTo)}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
            <path d="M12 15L7 10L12 5" stroke="#ffffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {label}
        </span>
      </button>
    </div>
  );
};

export default BackButton;
