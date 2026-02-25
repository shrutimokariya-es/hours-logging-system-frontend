import React from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import { loginSchema } from '../../validation/authValidation';
import { authService } from '../../services/authService';
import { FormInput, Button } from '../common';
import { useForm } from '../../hooks/useForm';
// import { useForm } from "react-hook-form";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setErrors
  } = useForm({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: loginSchema,
    onSubmit: async (formData) => {
      try {
        const response = await authService.login(formData);
        
        dispatch(setCredentials({
          token: response.token,
          accessToken: response.token,
          user: response.user
        }));
        
        if (response.user) {
          navigate('/dashboard');
        }
      } catch (error: any) {
        console.error('Login error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
       
        if (error.response?.data?.message) {
          setErrors({ general: errorMessage });
        }
        throw error; // Re-throw to let useForm handle isSubmitting state
      }
    }
  });

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

          {/* General Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6" onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}>
            {/* Email Field */}
            <FormInput
              label="Email"
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              required
              value={values.email}
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
              value={values.password}
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
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
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
  // const {
  //   register,
  //   handleSubmit,
  //   formState: { errors },
  // } = useForm();

  // const onSubmit = (data:any) => {
  //   console.log("Form Data:", data);
  // };

  // return (
  //   <div className="min-h-screen flex items-center justify-center bg-gray-100">
  //     <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
  //       <h1 className="text-2xl font-bold text-center mb-6 text-gray-700">
  //         Login
  //       </h1>

  //       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
  //         {/* Email */}
  //         <div>
  //           <input
  //             type="email"
  //             placeholder="Email"
  //             className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
  //             {...register("email", {
  //               required: "Email is required",
  //               pattern: {
  //                 value: /^\S+@\S+$/i,
  //                 message: "Invalid email address",
  //               },
  //             })}
  //           />
  //           {errors.email && (
  //             <p className="text-red-500 text-sm mt-1">
  //               {errors.email.message as any}
  //             </p>
  //           )}
  //         </div>

  //         {/* Password */}
  //         <div>
  //           <input
  //             type="password"
  //             placeholder="Password"
  //             className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
  //             {...register("password", {
  //               required: "Password is required",
  //               minLength: {
  //                 value: 6,
  //                 message: "Minimum 6 characters required",
  //               },
  //             })}
  //           />
  //           {errors.password && (
  //             <p className="text-red-500 text-sm mt-1">
  //               {errors.password.message as any}
  //             </p>
  //           )}
  //         </div>

  //         {/* Button */}
  //         <button
  //           type="submit"
  //           className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
  //         >
  //           Login
  //         </button>
  //       </form>
  //     </div>
  //   </div>
  // );
};

export default Login;
