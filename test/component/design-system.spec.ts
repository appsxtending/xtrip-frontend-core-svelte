import { render, screen, fireEvent, cleanup } from '@testing-library/svelte';
import { afterEach, expect, it, vi } from 'vitest';
import Trace from '../../src/components/pricing-stage-trace/pricing-stage-trace.svelte';
import Button from '../../src/components/button/button.svelte';
import Grid from '../../src/components/data-grid/data-grid.svelte';
import Price from '../../src/components/price-breakdown/price-breakdown.svelte';
import Field from '../../src/components/form-field/form-field.svelte';
import Remote from '../../src/components/remote-state/remote-state.svelte';
import ImportReview from '../../src/components/file-import-review/file-import-review.svelte';
import DriftStory from '../../src/workbench/price-drift-diff.stories.svelte';
import TabsStory from '../../src/workbench/tabs.stories.svelte';
import NotificationStory from '../../src/workbench/notification-center.stories.svelte';
import { themePreset } from '@xtrip/design-tokens';
import { uiCopy } from '@xtrip/i18n';
afterEach(cleanup);
it('blocks repeated actions during pending state', async () => {
  const onclick = vi.fn();
  render(Button, { label: 'Save', pending: true, onclick });
  const button = screen.getByRole('button', { name: 'Save' });
  expect(button).toBeDisabled();
  await fireEvent.click(button);
  expect(onclick).not.toHaveBeenCalled();
});
it('associates validation details with the field', () => {
  render(Field, { label: 'Email', error: 'Check email', required: true });
  const field = screen.getByLabelText('Email *');
  expect(field).toHaveAttribute('aria-invalid', 'true');
  expect(field).toHaveAccessibleDescription('Check email');
});
it('filters, sorts, selects and paginates supplied records', async () => {
  render(Grid, {
    label: 'Records',
    columns: [{ key: 'name', label: 'Name' }],
    rows: [
      { id: '1', name: 'Zulu' },
      { id: '2', name: 'Alpha' },
      { id: '3', name: 'Beta' },
    ],
    pageSize: 2,
  });
  await fireEvent.click(screen.getByRole('button', { name: /Name/ }));
  expect(screen.getAllByRole('row')[1]).toHaveTextContent('Alpha');
  await fireEvent.click(screen.getByRole('checkbox', { name: 'Select Alpha' }));
  expect(screen.getByText('Selected rows: 1')).toHaveAttribute('role', 'status');
  await fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(screen.getByText('Zulu')).toBeVisible();
  await fireEvent.input(screen.getByRole('searchbox'), { target: { value: 'nothing' } });
  expect(screen.getByText('No matching results')).toBeVisible();
});
it('preserves exact signed decimal strings beyond floating point precision', () => {
  render(Price, {
    lines: [
      { id: 'a', label: 'Room', amount: '9007199254740993.01' },
      { id: 'b', label: 'Reversal', amount: '-0.01' },
    ],
    total: '9007199254740993.00',
    currency: 'USD',
    signature: 'signed-reference',
  });
  expect(screen.getByText('9007199254740993.01 USD')).toBeVisible();
  expect(screen.getByText('-0.01 USD')).toBeVisible();
  expect(screen.getByText('9007199254740993.00 USD')).toBeVisible();
});
it('requires explicit price-drift acceptance before callback', async () => {
  render(DriftStory);
  const button = screen.getByRole('button', { name: 'Apply' });
  expect(button).toBeDisabled();
  await fireEvent.click(screen.getByRole('checkbox'));
  expect(button).toBeEnabled();
  await fireEvent.click(button);
  expect(screen.getByText('Apply: 1')).toBeVisible();
});
it('switches tab panels through supplied presentation state', async () => {
  render(TabsStory);
  await fireEvent.click(screen.getByRole('tab', { name: 'Details' }));
  expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('tabpanel')).toHaveTextContent('Illustrative data');
});
it('removes the unread action after a caller accepts the event', async () => {
  render(NotificationStory);
  await fireEvent.click(screen.getByRole('button', { name: 'Mark read' }));
  expect(screen.queryByRole('button', { name: 'Mark read' })).toBeNull();
});
it('does not authorize imports without a completed validation result', async () => {
  render(ImportReview, { validated: false });
  expect(screen.getByRole('checkbox')).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
});
for (const state of [
  'loading',
  'empty',
  'filtered-empty',
  'refreshing',
  'stale',
  'retryable',
  'terminal',
  'forbidden',
  'not-found',
] as const)
  it(`announces ${state} without inventing remote data`, () => {
    render(Remote, { state, locale: 'ar' });
    expect(screen.getByRole('status')).toHaveTextContent(uiCopy('ar')[state]);
  });
it('restricts brand input to audited presets', () => {
  expect(themePreset('indigo')).toBe('indigo');
  expect(themePreset('url(javascript:bad)')).toBe('forest');
});

it('preserves caller-supplied pricing stage order and exposes suppression details', async () => {
  render(Trace, {
    stages: [
      {
        stage: 4,
        code: 'SUPPLIED_FIRST',
        description: 'Authorized stage detail',
        suppressed: true,
      },
      { stage: 2, code: 'SUPPLIED_SECOND', description: 'Next supplied detail' },
    ],
  });
  const items = screen.getAllByRole('listitem');
  expect(items[0]).toHaveTextContent('SUPPLIED_FIRST');
  expect(items[1]).toHaveTextContent('SUPPLIED_SECOND');
  expect(items[0]).toHaveTextContent(uiCopy('en').warning);
  await fireEvent.click(items[0].querySelector('summary')!);
  expect(items[0].querySelector('details')).toHaveAttribute('open');
});
