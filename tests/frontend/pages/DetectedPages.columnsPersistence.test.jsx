/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import DetectedPages from '../../../src/frontend/pages/DetectedPages';

// Mock the data hook to avoid network and provide stable props
jest.mock('../../../src/frontend/hooks/useDetectedPages', () => {
  const mockSet = () => {};
  return {
    useDetectedPages: () => ({
      items: [{
        id: '1',
        title: 'Hello',
        spaceKey: 'SP',
        impactScore: 5,
        lastUpdated: '2020-01-01T00:00:00.000Z',
        status: 'detected',
        flags: {},
      }],
      total: 1,
      page: 1,
      setPage: mockSet,
      pageSize: 10,
      search: '',
      setSearch: mockSet,
      minImpact: 0,
      setMinImpact: mockSet,
      status: 'any',
      setStatus: mockSet,
      flags: {},
      setFlags: mockSet,
      sortBy: 'updated',
      sortDir: 'desc',
      loading: false,
      load: async () => {},
      selected: new Set(),
      toggleAll: mockSet,
      toggleOne: mockSet,
      action: null,
      setAction: mockSet,
      dryRun: null,
      setDryRun: mockSet,
      doDryRun: mockSet,
      applyAction: mockSet,
      error: null,
      exportData: null,
      setExportData: mockSet,
      openExport: mockSet,
      downloadFromModal: mockSet,
      onSort: mockSet,
      message: null,
      exporting: null,
    }),
  };
});

const allTrue = { title: true, space: true, owner: true, impact: true, updated: true, status: true, actions: true };

describe('DetectedPages column visibility persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes from localStorage and persists changes', async () => {
    // Start with only updated visible
    localStorage.setItem('cg_detected_columns', JSON.stringify({
      title: false, space: false, owner: false, impact: false, updated: true, status: false, actions: false,
    }));

    render(<DetectedPages />);

    // Title header should be hidden initially in the table
    const table = screen.getByTestId('dynamic-table');
    expect(within(table).queryByRole('columnheader', { name: 'Title' })).not.toBeInTheDocument();

    // Open Columns and Select all
    fireEvent.click(screen.getByRole('button', { name: /columns/i }));
    fireEvent.click(screen.getByRole('button', { name: /select all/i }));

    // Now Title header should appear in the table
    expect(within(table).getByRole('columnheader', { name: 'Title' })).toBeInTheDocument();

    // localStorage should be updated to all true
    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('cg_detected_columns'));
      expect(saved).toEqual(allTrue);
    });
  });
});
