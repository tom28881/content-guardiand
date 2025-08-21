/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import DetectedTable from '../../../src/frontend/components/DetectedTable';

describe('DetectedTable visibleColumns', () => {
  const baseItem = {
    id: '1',
    title: 'Hello',
    spaceKey: 'SP',
    impactScore: 5,
    lastUpdated: '2020-01-01T00:00:00.000Z',
    status: 'detected',
    flags: {},
  };

  const renderTable = (visibleColumns) => {
    return render(
      <DetectedTable
        items={[baseItem]}
        loading={false}
        selected={new Set()}
        onToggleAll={() => {}}
        onToggleOne={() => {}}
        sortBy="updated"
        sortDir="desc"
        onSort={() => {}}
        owners={{}}
        rowLoadingIds={new Set()}
        visibleColumns={visibleColumns}
      />
    );
  };

  it('hides disabled columns and keeps selection column', () => {
    const visible = { title: true, space: false, owner: false, impact: false, updated: true, status: false, actions: false };
    renderTable(visible);

    // Headers present
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /last updated/i })).toBeInTheDocument();

    // Headers hidden
    expect(screen.queryByText('Space')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /impact/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Status')).not.toBeInTheDocument();
    expect(screen.queryByText('Recommended Actions')).not.toBeInTheDocument();

    // Row action buttons are hidden with actions column off
    expect(screen.queryByRole('button', { name: /archive/i })).not.toBeInTheDocument();

    // Selection checkbox column remains (header + 1 row = 2 checkboxes)
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(2);
  });
});
