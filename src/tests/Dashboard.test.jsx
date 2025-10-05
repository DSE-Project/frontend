// __tests__/Dashboard.test.jsx
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';

// ----------------------
// Mock Supabase to avoid import.meta.env errors
// ----------------------
jest.mock('../supabase/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
      insert: jest.fn().mockResolvedValue({ data: [], error: null }),
      update: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));

// ----------------------
// Mock child components to simplify tests
// ----------------------
jest.mock('../components/Header', () => () => <div>Header</div>);
jest.mock('../components/SideBar', () => () => <div>SideBar</div>);
jest.mock('../components/DashBoardComponents/ModelPrediction', () => ({ monthsAhead }) => (
  <div>ModelPrediction {monthsAhead} months</div>
));
jest.mock('../components/DashBoardComponents/TopDrivers', () => ({ monthsAhead }) => (
  <div>TopDrivers {monthsAhead} months</div>
));
jest.mock('../components/DashBoardComponents/MacroIndicatorsSnapshot', () => () => (
  <div>MacroIndicatorsSnapshot</div>
));
jest.mock('../components/EconomicIndicators/EconomicIndicatorsMixed', () => () => (
  <div>EconomicIndicatorsMixed</div>
));

// ----------------------
// Mock the hooks from contexts
// ----------------------
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'John' },
    initializing: false,
    isLoadingUserData: () => false,
    getWelcomeMessage: () => ', John',
  }),
}));

jest.mock('../contexts/SidebarContext', () => ({
  useSidebar: () => ({
    isCollapsed: false,
    toggleSidebar: jest.fn(),
  }),
}));

// ----------------------
// Tests
// ----------------------
describe('Dashboard Component', () => {
  it('renders main dashboard elements', () => {
    render(<Dashboard />);

    // Header and Sidebar
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('SideBar')).toBeInTheDocument();

    // Welcome message
    expect(screen.getByText(/Welcome, John!/i)).toBeInTheDocument();

    // ModelPrediction components
    expect(screen.getByText('ModelPrediction 1 months')).toBeInTheDocument();
    expect(screen.getByText('ModelPrediction 3 months')).toBeInTheDocument();
    expect(screen.getByText('ModelPrediction 6 months')).toBeInTheDocument();

    // MacroIndicatorsSnapshot
    expect(screen.getByText('MacroIndicatorsSnapshot')).toBeInTheDocument();

    // EconomicIndicatorsMixed
    expect(screen.getByText('EconomicIndicatorsMixed')).toBeInTheDocument();
  });
});
