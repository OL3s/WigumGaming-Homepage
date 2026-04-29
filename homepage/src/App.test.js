import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders homepage navigation and game links', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'SingleplayerRoguelite' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'MultiplayerArena' })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /view game page/i })).toHaveLength(2);
  expect(screen.getAllByRole('link', { name: /about us/i })).toHaveLength(2);
});

test('renders a game page from its route', () => {
  render(
    <MemoryRouter initialEntries={['/games/multiplayer-arena']}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByRole('heading', { name: 'MultiplayerArena' })).toBeInTheDocument();
  expect(screen.getByText(/competitive battleground/i)).toBeInTheDocument();
});

test('renders games overview route', () => {
  render(
    <MemoryRouter initialEntries={['/games']}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByRole('heading', { name: /current projects/i })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /view game page/i })).toHaveLength(2);
});
