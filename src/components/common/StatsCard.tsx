import React from 'react';

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  change, 
  positive = true, 
  icon,
  color = 'blue' 
}) => {
  const gradientClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600'
  };

  const bgGradientClasses = {
    blue: 'from-blue-50 to-blue-100',
    green: 'from-green-50 to-green-100',
    yellow: 'from-yellow-50 to-yellow-100',
    red: 'from-red-50 to-red-100',
    purple: 'from-purple-50 to-purple-100'
  };

  const shadowClasses = {
    blue: 'hover:shadow-blue-200',
    green: 'hover:shadow-green-200',
    yellow: 'hover:shadow-yellow-200',
    red: 'hover:shadow-red-200',
    purple: 'hover:shadow-purple-200'
  };

  return (
    <div className={`relative bg-white rounded-xl shadow-lg hover:shadow-2xl ${shadowClasses[color]} transition-all duration-300 overflow-hidden group`}>
      {/* Gradient background decoration */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bgGradientClasses[color]} rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity duration-300`}></div>
      
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2 mb-3">{value}</p>
            {change && (
              <div className="flex items-center space-x-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  positive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {positive ? '↑' : '↓'} {change}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradientClasses[color]} shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
              <div className="text-white">
                {icon}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className={`h-1 bg-gradient-to-r ${gradientClasses[color]}`}></div>
    </div>
  );
};

export default StatsCard;
