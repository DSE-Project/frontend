import { useState, useEffect } from 'react';

/**
 * Responsive utility functions for consistent mobile design across the app
 */

// Standard breakpoints used throughout the app
export const BREAKPOINTS = {
  xs: '475px',   // Extra small devices
  sm: '640px',   // Small devices (Tailwind sm)
  md: '768px',   // Medium devices (Tailwind md) - Mobile/Tablet threshold
  lg: '1024px',  // Large devices (Tailwind lg)
  xl: '1280px',  // Extra large devices (Tailwind xl)
  '2xl': '1536px' // 2x Extra large devices (Tailwind 2xl)
};

// Check if screen is mobile size
export const isMobileScreen = () => {
  return window.innerWidth < 768; // md breakpoint
};

// Check if screen is tablet size
export const isTabletScreen = () => {
  return window.innerWidth >= 768 && window.innerWidth < 1024;
};

// Check if screen is desktop size
export const isDesktopScreen = () => {
  return window.innerWidth >= 1024;
};

// Get current screen size category
export const getScreenSize = () => {
  const width = window.innerWidth;
  if (width < 475) return 'xs';
  if (width < 640) return 'sm';
  if (width < 768) return 'md';
  if (width < 1024) return 'lg';
  if (width < 1280) return 'xl';
  return '2xl';
};

// Common responsive class patterns
export const responsiveClasses = {
  // Layout containers
  container: 'container mx-auto px-4 sm:px-6 lg:px-8',
  
  // Main content area (with sidebar consideration)
  mainContent: (isCollapsed, isMobile) => 
    `transition-all duration-300 p-4 sm:p-6 lg:p-8 ${
      isMobile ? 'ml-0' : isCollapsed ? 'ml-16' : 'ml-64'
    }`,
  
  // Mobile menu button
  mobileMenuButton: 'mb-4 md:hidden bg-blue-600 text-white p-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors',
  
  // Grid layouts
  responsiveGrid: {
    oneToTwo: 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6',
    oneToThree: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
    twoToFour: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6',
  },
  
  // Text sizes
  text: {
    heading1: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
    heading2: 'text-xl sm:text-2xl lg:text-3xl font-bold',
    heading3: 'text-lg sm:text-xl lg:text-2xl font-semibold',
    body: 'text-sm sm:text-base',
    small: 'text-xs sm:text-sm'
  },
  
  // Spacing
  spacing: {
    section: 'mt-6 sm:mt-8',
    element: 'mb-4 sm:mb-6'
  },
  
  // Buttons
  button: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base'
  },
  
  // Cards and containers
  card: 'bg-white rounded-lg shadow-lg p-4 sm:p-6',
  modalCard: 'bg-white rounded-lg shadow-lg p-6 sm:p-8'
};

// Hook for responsive behavior
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState(getScreenSize());
  const [isMobile, setIsMobile] = useState(isMobileScreen());
  
  useEffect(() => {
    const handleResize = () => {
      setScreenSize(getScreenSize());
      setIsMobile(isMobileScreen());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    screenSize,
    isMobile,
    isTablet: isTabletScreen(),
    isDesktop: isDesktopScreen()
  };
};

// Mobile menu hamburger icon SVG
export const HamburgerIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

// Close icon SVG
export const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);