import { render, screen, fireEvent } from '@testing-library/svelte';
import { expect, it } from 'vitest';
import Page from '../../src/routes/+page.svelte';
it('reveals and collapses the next-step description with accessible state', async () => {
  render(Page, { data: { locale: 'en', theme: 'light', applied: false } });
  const button = screen.getByRole('button', { name: 'What comes next' });
  expect(button).toHaveAttribute('aria-expanded', 'false');
  await fireEvent.click(button);
  expect(button).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText(/Shared components, connected journeys/)).toBeVisible();
  await fireEvent.click(button);
  expect(screen.getByText(/Shared components, connected journeys/)).not.toBeVisible();
});
