import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ value, max = 100, color = 'primary', showLabel = false, height = 'md', className = '' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`progress-container ${className}`}>
      {showLabel && (
        <div className="progress-label">
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className={`progress-track height-${height}`}>
        <div 
          className={`progress-fill color-${color}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
