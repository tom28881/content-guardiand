/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import PageHeader from '../../../src/frontend/components/common/PageHeader';

describe('PageHeader Component', () => {
  it('should render the title', () => {
    render(<PageHeader title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should render action buttons when provided', () => {
    const actions = <button>Click Me</button>;
    render(<PageHeader title="Test Title" actions={actions} />);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('should not render actions when not provided', () => {
    render(<PageHeader title="Test Title" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
