// src/tests/SentimentDashboard.test.jsx
jest.mock("../supabase/supabase", () => ({
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

jest.mock("../contexts/AuthContext");

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { SidebarProvider } from "../contexts/SidebarContext";
import SentimentDashboard from "../pages/SentimentDashboard";
import * as AuthContext from "../contexts/AuthContext";

// ✅ Mock ResizeObserver so Recharts doesn't break in JSDOM
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// Mock fetch and Auth before each test
beforeEach(() => {
  jest.spyOn(global, "fetch");
  AuthContext.useAuth.mockReturnValue({
    user: { name: "TestUser" },
    getDisplayName: () => "TestUser",
    isAuthenticated: () => true,
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("SentimentDashboard Page", () => {
  test("renders loading screen initially", () => {
    global.fetch.mockImplementation(() => new Promise(() => {})); // never resolves

    render(
      <MemoryRouter>
        <SidebarProvider>
          <SentimentDashboard />
        </SidebarProvider>
      </MemoryRouter>
    );

    expect(
      screen.getByText(/loading sentiment analysis/i)
    ).toBeInTheDocument();
  });

  test("renders error screen if fetch fails", async () => {
    // 🔹 Silence console.error for this test
    jest.spyOn(console, "error").mockImplementation(() => {});

    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    render(
      <MemoryRouter>
        <SidebarProvider>
          <SentimentDashboard />
        </SidebarProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText(/error loading data/i)).toBeInTheDocument();
    expect(screen.getByText(/network error/i)).toBeInTheDocument();

    console.error.mockRestore(); // restore after test
  });
});
