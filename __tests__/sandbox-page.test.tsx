/** @jest-environment jsdom */

import React from 'react';
import { render, screen } from '@testing-library/react';
import SandboxPage from '@/app/playground/sandbox/page';

// Mock the data imports
jest.mock('@/data/skills.json', () => [
  {
    id: '1',
    slug: 'test-skill',
    name: 'Test Skill',
    description: 'A test skill for testing',
    author: 'Test Author',
    install_cmd: 'test install command',
    repo_url: 'https://test.com',
    tags: ['test'],
  },
]);

jest.mock('@/data/sandbox-runs.json', () => [
  {
    id: 'run-1',
    skillId: '1',
    skillName: 'Test Skill',
    timestamp: '2026-02-09T01:30:15Z',
    status: 'success',
    model: 'claude-sonnet-4-5',
    temperature: 0.7,
    timeout: 30,
    output: 'Test output',
  },
]);

describe('SandboxPage', () => {
  it('renders the sandbox page without crashing', () => {
    render(<SandboxPage />);
    
    // Check for main heading
    expect(screen.getByText('Agent Skill Sandbox')).toBeInTheDocument();
  });

  it('renders the skill selector', () => {
    render(<SandboxPage />);
    
    // Check for skill selector section
    expect(screen.getByText('Select Skill')).toBeInTheDocument();
  });

  it('renders the execution output section', () => {
    render(<SandboxPage />);
    
    // Check for execution output section
    expect(screen.getByText('Execution Output')).toBeInTheDocument();
  });

  it('renders the configuration panel', () => {
    render(<SandboxPage />);
    
    // Check for configuration section
    expect(screen.getByText('Configuration')).toBeInTheDocument();
  });

  it('renders the execution history section', () => {
    render(<SandboxPage />);
    
    // Check for execution history section
    expect(screen.getByText('Execution History')).toBeInTheDocument();
  });

  it('renders the run button', () => {
    render(<SandboxPage />);
    
    // Check for run button
    const runButtons = screen.getAllByText('Run');
    expect(runButtons.length).toBeGreaterThan(0);
  });

  it('renders configuration options', () => {
    render(<SandboxPage />);
    
    // Check for configuration labels
    expect(screen.getByText('Model')).toBeInTheDocument();
    expect(screen.getByText(/Temperature:/)).toBeInTheDocument();
    expect(screen.getByText(/Timeout:/)).toBeInTheDocument();
  });
});
