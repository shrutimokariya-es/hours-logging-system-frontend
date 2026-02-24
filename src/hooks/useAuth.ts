import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setCredentials, setLogoutData, setAuthInitialized } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import { LoginCredentials, RegisterData } from '../services/authService';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  const loginUser = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.token);
      localStorage.setItem('accessToken', response.token);
      dispatch(setCredentials({
        token: response.token,
        accessToken: response.token,
        user: response.user
      }));
      return response;
    } catch (error) {
      throw error;
    }
  };

  const registerUser = async (userData: RegisterData) => {
    try {
      const response = await authService.register(userData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('accessToken', response.token);
      dispatch(setCredentials({
        token: response.token,
        accessToken: response.token,
        user: response.user
      }));
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
    } catch (error) {
      console.log('Logout API error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      dispatch(setLogoutData());
    }
  };

  const restoreUserState = async () => {
    try {
      const token = localStorage.getItem('token');
      const accessToken = localStorage.getItem('accessToken');
      if (!token) {
        dispatch(setAuthInitialized());
        return;
      }
      
      const user = await authService.getCurrentUser();
      dispatch(setCredentials({
        token,
        accessToken,
        user
      }));
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      dispatch(setAuthInitialized());
    }
  };

  return {
    // State
    ...auth,
    
    // Actions
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    restoreUser: restoreUserState,
  };
};
