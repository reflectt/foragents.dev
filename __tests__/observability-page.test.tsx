/** @jest-environment jsdom */

import React from 'react';
import { render, screen } from '@testing-library/react';

type LinkProps = {
  href: string;
  children?: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

jest.mock('next/link', () => {
  const LinkMock = ({ href, children, ...props }: LinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  LinkMock.displayName = 'Link';
  return LinkMock;
});

jest.mock('@/components/mobile-nav', () => ({
  MobileNav: () => <nav data-testid="mobile-nav" />,
}));

jest.mock('@/components/footer', () => ({
  Footer: () => <footer data-testid="footer" />,
}));

import ObservabilityPage from '@/app/observability/page';

describe('Observability page', () => {
  test('renders observability page with heading', () => {
    render(<ObservabilityPage />);

    // Check for main heading (more specific)
    expect(screen.getByRole('heading', { name: /Agent.*Observability/i, level: 1 })).toBeInTheDocument();
  });

  test('renders category filters', () => {
    render(<ObservabilityPage />);

    // Check for category filters - use getAllBy since there are multiple
    const allButtons = screen.getAllByRole('button', { name: /all/i });
    expect(allButtons.length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /^Logging$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Tracing$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Metrics$/i })).toBeInTheDocument();
  });

  test('renders integration matrix', () => {
    render(<ObservabilityPage />);

    // Check for integration matrix section
    expect(screen.getByText(/Integration Matrix/i)).toBeInTheDocument();
    // Check for table presence
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('renders observability tools', () => {
    render(<ObservabilityPage />);

    // Check for some well-known tools - use getAllBy since they appear multiple times
    const otelElements = screen.getAllByText(/OpenTelemetry/);
    expect(otelElements.length).toBeGreaterThan(0);
    const promElements = screen.getAllByText(/Prometheus/);
    expect(promElements.length).toBeGreaterThan(0);
  });
});
