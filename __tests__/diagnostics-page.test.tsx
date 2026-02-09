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

import DiagnosticsPage from '@/app/diagnostics/page';

describe('Diagnostics page', () => {
  test('renders diagnostics page with heading', () => {
    render(<DiagnosticsPage />);

    // Check for main heading (more specific)
    expect(screen.getByRole('heading', { name: /Agent.*Diagnostics/i })).toBeInTheDocument();
  });

  test('renders configuration input section', () => {
    render(<DiagnosticsPage />);

    // Check for input textarea
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/agent.json/i)).toBeInTheDocument();
  });

  test('renders run diagnostics button', () => {
    render(<DiagnosticsPage />);

    // Check for button
    expect(screen.getByRole('button', { name: /run diagnostics/i })).toBeInTheDocument();
  });
});
