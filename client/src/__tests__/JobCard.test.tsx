import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import JobCard from '../components/JobCard';

describe('JobCard', () => {
  const mockJob = {
    title: 'Senior Software Engineer',
    description: 'We are looking for a talented software engineer...',
    skills: ['React', 'TypeScript', 'Node.js'],
    company: 'Tech Corp',
    location: 'Remote'
  };

  it('renders job title correctly', () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
  });

  it('renders job description', () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText(/We are looking for a talented software engineer/)).toBeInTheDocument();
  });

  it('renders all skills as badges', () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    const { container } = render(<JobCard job={mockJob} />);
    const cardElement = container.querySelector('.bg-white');
    expect(cardElement).toBeInTheDocument();
  });
});
