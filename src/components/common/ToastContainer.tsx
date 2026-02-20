import React, { useEffect } from 'react';
import { ToastContainer as ReactToastContainer, toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { toastSelector } from '../../store/slices/toastSlice';
import 'react-toastify/dist/ReactToastify.css';

const ToastContainer: React.FC = () => {
  const { message, type } = useSelector((state: RootState) => toastSelector(state));

  useEffect(() => {
    if (message && type) {
      switch (type) {
        case 'success':
          toast.success(message);
          break;
        case 'error':
          toast.error(message);
          break;
        case 'warning':
          toast.warning(message);
          break;
        case 'info':
        default:
          toast.info(message);
          break;
      }
    }
  }, [message, type]);

  return (
    <ReactToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
       style={{ zIndex: 9999, marginTop: '60px' }}
    />
  );
};

export default ToastContainer;
