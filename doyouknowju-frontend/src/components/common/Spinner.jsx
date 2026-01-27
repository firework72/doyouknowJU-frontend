import React from 'react';
import './Spinner.css';

const Spinner = ({ size = 'md', className = '' }) => {
  return <div className={`spinner spinner-${size} ${className}`} role="status"></div>;
};

export default Spinner;
