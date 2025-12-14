import { useEffect } from 'react';
import '../../assets/css/home.css';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`toast ${type} show`} id="toast" style={{ display: 'flex' }}>
      <i className={`fas ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-circle' : 'fa-times-circle'}`}></i>
      <span>{message}</span>
    </div>
  );
};

export default Toast;
