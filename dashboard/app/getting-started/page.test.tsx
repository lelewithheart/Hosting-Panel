import { render, screen } from '@testing-library/react';
import GettingStartedPage from './page';

describe('GettingStartedPage', () => {
  test('renders the title', () => {
    render(<GettingStartedPage />);
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
  });
});