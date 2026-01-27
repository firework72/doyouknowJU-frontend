import React from 'react';
import './Alert.css';

const Alert = ({ type = 'info', title, children, className = '' }) => {
  return (
    <div className={`alert alert-${type} ${className}`} role="alert">
      {title && <h4 className="alert-title">{title}</h4>}
      <div className="alert-message">{children}</div>
    </div>
  );
};

export default Alert;
