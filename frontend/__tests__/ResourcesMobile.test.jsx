// __tests__/ResourcesMobile.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import ResourcesMobile from '../src/pages/ResourcesMobile.jsx';

// Mock fetch
beforeAll(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve([
        { _id: '1', type: 'song', title: 'Test Song', url: 'https://res.cloudinary.com/demo/audio.mp3' },
        { _id: '2', type: 'ebook', title: 'Test Ebook', url: 'https://res.cloudinary.com/demo/ebook.pdf' }
      ])
    })
  );
});

afterAll(() => {
  global.fetch.mockRestore();
});

test('renders resource cards and fetches resources', async () => {
  render(<ResourcesMobile />);
  await waitFor(() => expect(screen.getByText('Songs')).toBeInTheDocument());
  expect(screen.getByText('Ebooks')).toBeInTheDocument();
  expect(screen.getByText('Test Song')).toBeInTheDocument();
  expect(screen.getByText('Test Ebook')).toBeInTheDocument();
});
