import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';

const SideBar = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();

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
      name: 'Model Explainability',
      path: '/model-explainability',
      requiresAuth: false,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
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
    },
     {
    name: 'Sentiment Dashboard',
    path: '/sentiment-dashboard',
    requiresAuth: true, 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19a8 8 0 100-16 8 8 0 000 16zm-3-8h6m-3-3v6" />
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
    <>
      <div className={`bg-white shadow-lg h-full fixed left-0 top-16 bottom-0 z-40 transition-all duration-500 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-5 bg-white shadow-md rounded-full p-1.5 hover:bg-gray-50 transition-colors duration-200 z-50"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg 
            className={`w-4 h-4 text-gray-600 transition-transform duration-500 ${
              isCollapsed ? 'rotate-180' : ''
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
        </button>

        <nav className="mt-8">
          {/* Navigation title with smooth transition */}
          <div className="px-4">
            <h2 className={`text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4 transition-all duration-500 ${
              isCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'
            }`}>
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
                      className={`flex items-center ${isCollapsed ? 'px-4 justify-center' : 'px-6'} py-3 text-sm font-medium transition-all duration-500 ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      title={isCollapsed ? item.name : ''}
                    >
                      <span className={`${isCollapsed ? '' : 'mr-3'} ${isActive ? 'text-blue-700' : 'text-gray-400'} transition-all duration-500`}>
                        {item.icon}
                      </span>
                      <span className={`transition-all duration-500 ${
                        isCollapsed ? 'opacity-0 invisible w-0' : 'opacity-100 visible w-auto'
                      }`}>
                        {item.name}
                      </span>
                    </Link>
                  ) : (
                    <div
                      className={`flex items-center ${isCollapsed ? 'px-4 justify-center' : 'px-6'} py-3 text-sm font-medium cursor-not-allowed text-gray-400 transition-all duration-500`}
                      onClick={(e) => handleItemClick(e, item)}
                      title={isCollapsed ? `${item.name} - Please login to access` : ''}
                    >
                      <span className={`${isCollapsed ? '' : 'mr-3'} text-gray-300 transition-all duration-500`}>
                        {item.icon}
                      </span>
                      <span className={`transition-all duration-500 ${
                        isCollapsed ? 'opacity-0 invisible w-0' : 'opacity-100 visible w-auto'
                      }`}>
                        <span className="text-gray-400">{item.name}</span>
                        {/* Tooltip */}
                        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50">
                          Please login to use {item.name}
                          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-800"></div>
                        </div>
                      </span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default SideBar;