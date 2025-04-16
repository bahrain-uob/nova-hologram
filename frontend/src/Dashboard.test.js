import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from './Dashboard';

// Mock the fetch function
global.fetch = jest.fn();

describe('Dashboard Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('shows loading state initially', () => {
    render(<Dashboard />);
    // Look for Skeleton components instead of "Loading..." text
    const skeletons = document.querySelectorAll('.h-12');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays data when API call is successful', async () => {
    const mockCases = [
      {
        id: "1",
        title: "Test Case",
        description: "Test description",
        status: "OPEN",
        complaintLevel: "HIGH",
        submissionDate: new Date().toISOString(),
        resolved: false
      }
    ];

    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCases),
      })
    );

    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
      expect(screen.getByText('Total Cases')).toBeInTheDocument();
      // Verify Card components are rendered
      const cards = document.querySelectorAll('[class*="Card"]');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  it('falls back to sample data when API call fails', async () => {
    // Mock a failed API call
    fetch.mockImplementationOnce(() =>
      Promise.reject(new Error('API Error'))
    );

    render(<Dashboard />);
    
    await waitFor(() => {
      // Should still show dashboard with sample data
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
      expect(screen.getByText('Total Cases')).toBeInTheDocument();
      // Should show 5 cases (from sample data)
      expect(screen.getByText('5')).toBeInTheDocument();
      // Verify Card components are rendered
      const cards = document.querySelectorAll('[class*="Card"]');
      expect(cards.length).toBeGreaterThan(0);
    });
  });
});
