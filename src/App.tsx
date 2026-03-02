import { Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store/store';
import { setupAxios } from './utils/axios';
import ProtectedRoute from './components/common/ProtectedRoute';
import AuthProvider from './components/auth/AuthProvider';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';
import Developers from './pages/Developers';
import Projects from './pages/ProjectsWithTasks';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import MyHourLogs from './pages/MyHourLogs';
import ToastContainer from './components/common/ToastContainer';
import './index.css';

// Setup axios interceptors
setupAxios(store);

function App() {
  return (
   
        <>
          <AuthProvider>
            <div className="App">
              <ToastContainer />
             
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
                  path="/clients/:id"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ClientDetails />
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
                  path="/projects"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Projects />
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
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Analytics />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-hour-logs"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <MyHourLogs />
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
