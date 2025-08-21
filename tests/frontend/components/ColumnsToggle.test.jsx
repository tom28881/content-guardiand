/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ColumnsToggle from '../../../src/frontend/components/controls/ColumnsToggle';

const allTrue = { title: true, space: true, owner: true, impact: true, updated: true, status: true, actions: true };
const allFalse = { title: false, space: false, owner: false, impact: false, updated: false, status: false, actions: false };

describe('ColumnsToggle', () => {
  it('opens popover and triggers Select all / Clear all', () => {
    const onChange = jest.fn();

    render(<ColumnsToggle value={allTrue} onChange={onChange} />);

    // open the toggle panel
    fireEvent.click(screen.getByRole('button', { name: /columns/i }));

    // Clear all
    fireEvent.click(screen.getByRole('button', { name: /clear all/i }));
    expect(onChange).toHaveBeenCalled();
    const clearArg = onChange.mock.calls.pop()[0];
    expect(clearArg).toEqual(allFalse);

    // Select all
    fireEvent.click(screen.getByRole('button', { name: /select all/i }));
    const selectArg = onChange.mock.calls.pop()[0];
    expect(selectArg).toEqual(allTrue);

    // Panel shows all column labels
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Recommended Actions')).toBeInTheDocument();
  });
});
