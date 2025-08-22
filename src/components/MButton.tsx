import React from 'react';
import './MButton.css';

interface MButtonProps {
  onClick?: () => void;
  name?: React.ReactNode;
  type?: 'delete' | 'confirm' | 'create';
}

const MButton: React.FC<MButtonProps> = ({ onClick, name, type }) => {
  let typeClass = '';
  switch (type) {
    case 'delete':
      typeClass = 'm-button-delete';
      break;
    case 'confirm':
      typeClass = 'm-button-confirm';
      break;
    case 'create':
      typeClass = 'm-button-create';
      break;
    default:
      typeClass = '';
  }
  return (
    <button className={`m-button ${typeClass}`} onClick={onClick}>
      {name || 'ボタン'}
    </button>
  );
};

export default MButton;
