/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import DetectedTable from '../../../src/frontend/components/DetectedTable';

describe('DetectedTable owner loading placeholder', () => {
  const baseItem = {
    id: '1',
    title: 'Hello',
    spaceKey: 'SP',
    impactScore: 5,
    lastUpdated: '2020-01-01T00:00:00.000Z',
    status: 'detected',
    flags: {},
  };

  it('shows Loading... when owner not yet loaded and in ownerLoadingIds', () => {
    render(
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
        ownerLoadingIds={new Set(['1'])}
        visibleColumns={{ title: true, space: true, owner: true, impact: false, updated: false, status: false, actions: false }}
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
