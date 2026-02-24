import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getRoleName } from '../../utils/roleUtils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', roles: [0, 1, 2] }, // 0: BA, 1: Client, 2: Developer
    { path: '/clients', label: 'Clients', roles: [0] }, // 0: BA, 2: Developer
    { path: '/developers', label: 'Developers', roles: [0, 1] }, // 0: BA, 1: Client
    { path: '/projects', label: 'Projects', roles: [0, 1, 2] }, // All roles
    { path: '/add-hour-log', label: 'Add Hour Log', roles: [0, 1, 2] }, // All roles
    { path: '/reports', label: 'Reports', roles: [0, 1, 2] }, // All roles
    // { path: '/settings', label: 'Settings', roles: [0, 1, 2] }, // All roles
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    const shouldShow = user && item.roles.includes(user.role);
    return shouldShow;
  });
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-green-700 text-white shadow-lg border-b border-green-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/ba_logo.svg" 
                alt="HoursLog Logo" 
                className="h-10 w-auto"
              />
              <div className="flex flex-col">
                <h1 className="text-xl font-bold">Hours Logging System</h1>
                <p className="text-xs text-green-200">Track your work efficiently</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium">Welcome, {user?.name}</span>
                <span className="text-xs bg-green-600 px-2 py-1 rounded-full font-semibold">
                  {user?.role !== undefined ? getRoleName(user.role) : 'Guest'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-green-800 hover:bg-green-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-xl border-r border-gray-200 min-h-screen">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Navigation</h2>
          </div>
          <nav className="p-4">
            {filteredMenuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full text-left px-4 py-3 mb-2 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 ${
                  isActive(item.path)
                    ? 'bg-green-100 text-green-700 border-l-4 border-green-700 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-green-700 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-3">
                    {item.path === '/dashboard' && '📊'}
                    {item.path === '/clients' && '👥'}
                    {item.path === '/developers' && '👨‍💻'}
                    {item.path === '/projects' && '📁'}
                    {item.path === '/add-hour-log' && '⏰'}
                    {item.path === '/hours' && '⏰'}
                    {item.path === '/reports' && '📈'}
                    {item.path === '/settings' && '⚙️'}
                  </span>
                  {item.label}
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
