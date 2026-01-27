import React from 'react';
import './Input.css';

const Input = ({ 
  label, 
  error, 
  id, 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const inputId = id || props.name || Math.random().toString(36).substr(2, 9);

  return (
    <div className={`input-wrapper ${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && <label htmlFor={inputId} className="input-label">{label}</label>}
      <input 
        id={inputId} 
        className={`input-field ${error ? 'input-error' : ''}`} 
        {...props} 
      />
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};

export default Input;
