import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store/store';
import { setupAxios } from './utils/axios';
import ProtectedRoute from './components/common/ProtectedRoute';
import AuthProvider from './components/auth/AuthProvider';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Developers from './pages/Developers';
import AddHourLog from './pages/AddHourLog';
import Reports from './pages/Reports';
import './index.css';

// Setup axios interceptors
setupAxios(store);

function App() {
  return (
   
        <>
          <AuthProvider>
            <div className="App">
             
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/clients"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Clients />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/developers"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Developers />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-hour-log"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <AddHourLog />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Reports />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </AuthProvider>
        </>
     
    
  );
}

export default App;
