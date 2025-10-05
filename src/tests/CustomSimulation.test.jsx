jest.mock('../supabase/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockReturnThis(),
    })),
    auth: { signIn: jest.fn(), signOut: jest.fn(), user: null },
  },
}));

jest.mock('../contexts/AuthContext');

import React from 'react';
import { SidebarProvider } from '../contexts/SidebarContext';
import { render, screen } from '@testing-library/react';
import CustomSimulation from '../pages/CustomSimulation';
import * as AuthContext from '../contexts/AuthContext';
import { MemoryRouter } from 'react-router-dom';


describe('CustomSimulation Page', () => {
  beforeEach(() => {
    AuthContext.useAuth.mockClear();
  });

  test('renders login screen if user is not authenticated', () => {
    AuthContext.useAuth.mockReturnValue({
        user: null,
        getDisplayName: () => '',
        isAuthenticated: () => false,
    });

    render(
        <MemoryRouter>
        <SidebarProvider>
            <CustomSimulation />
        </SidebarProvider>
        </MemoryRouter>
    );

    // Match the actual login button text
    expect(screen.getByText(/login to continue/i)).toBeInTheDocument();
    });


  test('renders main content if user is authenticated', () => {
    AuthContext.useAuth.mockReturnValue({
        user: { name: 'John' },
        getDisplayName: () => 'John',
        isAuthenticated: () => true,
    });

    render(
        <MemoryRouter>
        <SidebarProvider>
            <CustomSimulation />
        </SidebarProvider>
        </MemoryRouter>
    );

    // Instead of "feature controls", assert text that appears in the DOM
    expect(screen.getByText(/welcome, john/i)).toBeInTheDocument();
    expect(screen.getByText(/custom simulation/i)).toBeInTheDocument();
    });

});
