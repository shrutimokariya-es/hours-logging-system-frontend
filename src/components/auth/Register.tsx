import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials } from '../../store/slices/authSlice';
import { authService } from '../../services/authService';
import { registerSchema, RegisterFormData, extractValidationErrors } from '../../validation';
import { Button, FormInput } from '../common';

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});

  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof RegisterFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = async (): Promise<boolean> => {
    try {
      await registerSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error) {
      const validationErrors = extractValidationErrors(error as any);
      setErrors(validationErrors);
      return false;
    }
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
      const response = await authService.register(formData);
      
      // Store credentials in Redux
      dispatch(setCredentials({
        token: response.token,
        accessToken: response.token
      }));
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Register Form */}
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Please enter your details to sign up</p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <FormInput
              label="Full Name"
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              error={errors.name}
              fullWidth
            />

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
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              error={errors.password}
              fullWidth
            />

            {/* Confirm Password Field */}
            <FormInput
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              error={errors.confirmPassword}
              fullWidth
            />

            {/* Sign Up Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoading}
              loading={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Account'}
            </Button>
          </form>

         

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in
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

export default Register;
