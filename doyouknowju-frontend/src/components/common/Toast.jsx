import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`toast toast-${type} slide-in`}>
      <span className="toast-message">{message}</span>
      <button onClick={onClose} className="toast-close">
        &times;
      </button>
    </div>
  );
};

export default Toast;
