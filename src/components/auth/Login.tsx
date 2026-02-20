import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import { loginSchema } from '../../validation/authValidation';
import { handleFormValidation } from '../../utils/validation';
import { authService } from '../../services/authService';
import { FormInput, Button } from '../common';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): Promise<boolean> => {
    return handleFormValidation(loginSchema, formData, setErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    setIsLoading(true);
    try {
      // Call authService directly since we're using axios interceptors
      const response = await authService.login(formData);
    console.log("Login response:", response);
      // Store credentials in Redux
      await dispatch(setCredentials({
        token: response.token,
        accessToken: response.token,
        user:response.user
      }));
      if (response.user) {
      navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">HoursLog</span>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
            <p className="text-gray-600">Please enter your details to sign in</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <FormInput
              label="Email"
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              error={errors.email}
              fullWidth
            />

            {/* Password Field */}
            <FormInput
              label="Password"
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              error={errors.password}
              fullWidth
            />

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoading}
              loading={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Background Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
             style={{ backgroundImage: 'url(/Gemini_Generated_Image_tpmm6ptpmm6ptpmm.png)' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-primary-800/40"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
