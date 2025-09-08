import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SideBar = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/',
      requiresAuth: false,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      )
    },
    {
      name: 'Custom Simulation',
      path: '/simulation',
      requiresAuth: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      name: 'Report Generation',
      path: '/reports',
      requiresAuth: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

  const handleItemClick = (e, item) => {
    if (item.requiresAuth && !isAuthenticated()) {
      e.preventDefault();
    }
  };

  return (
    <div className="bg-white shadow-lg h-full w-64 fixed left-0 top-16 bottom-0 z-40">
      <nav className="mt-8">
        <div className="px-4">
          <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">
            Navigation
          </h2>
        </div>
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isDisabled = item.requiresAuth && !isAuthenticated();
            const isAccessible = !item.requiresAuth || isAuthenticated();

            return (
              <li key={item.path} className="relative group">
                {isAccessible ? (
                  <Link
                    to={item.path}
                    className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className={`mr-3 ${isActive ? 'text-blue-700' : 'text-gray-400'}`}>
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                ) : (
                  <div
                    className="flex items-center px-6 py-3 text-sm font-medium cursor-not-allowed text-gray-400"
                    onClick={(e) => handleItemClick(e, item)}
                  >
                    <span className="mr-3 text-gray-300">
                      {item.icon}
                    </span>
                    <span className="text-gray-400">{item.name}</span>
                    
                    {/* Tooltip */}
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                      Please login to use {item.name}
                      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-800"></div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default SideBar;