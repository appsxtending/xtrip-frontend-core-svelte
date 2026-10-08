<script lang="ts">
  import Component from '../components/pricing-stage-trace/pricing-stage-trace.svelte';
  import { type PresentationLocale } from '@xtrip/i18n';
  import RemoteState from '../components/remote-state/remote-state.svelte';
  let {
    locale = 'en',
    state: previewState = 'loaded',
  }: {
    locale?: PresentationLocale;
    state?:
      | 'loading'
      | 'loaded'
      | 'empty'
      | 'filtered-empty'
      | 'refreshing'
      | 'stale'
      | 'retryable'
      | 'terminal'
      | 'forbidden'
      | 'not-found';
    drawerOpen?: boolean;
    openHref?: string;
    closeHref?: string;
  } = $props();

  const stageFixtures = [
    { stage: 1, code: 'ELIGIBILITY_OCCUPANCY', description: 'ELIGIBILITY_OCCUPANCY' },
    { stage: 2, code: 'PAX_AND_UNITS', description: 'PAX_AND_UNITS' },
    { stage: 3, code: 'BASE_RATE', description: 'BASE_RATE' },
    { stage: 4, code: 'OCCUPANCY_PRICING', description: 'OCCUPANCY_PRICING' },
    { stage: 5, code: 'STAY_PAY_PACKAGE', description: 'STAY_PAY_PACKAGE' },
    { stage: 6, code: 'PRODUCT_PROMOTIONS', description: 'PRODUCT_PROMOTIONS' },
    { stage: 7, code: 'CHARGES_AND_SERVICES', description: 'CHARGES_AND_SERVICES' },
    { stage: 8, code: 'AGGREGATE_ADJUSTMENTS_NET', description: 'AGGREGATE_ADJUSTMENTS_NET' },
    { stage: 9, code: 'MARKUP_COMMISSION', description: 'MARKUP_COMMISSION' },
    { stage: 10, code: 'MARKET_NATIONALITY', description: 'MARKET_NATIONALITY' },
    { stage: 11, code: 'FX', description: 'FX' },
    { stage: 12, code: 'TAX_TOTAL_SIGNATURE', description: 'TAX_TOTAL_SIGNATURE' },
  ];
</script>

<RemoteState {locale} state={previewState}
  ><div class="ui-stack"><Component {locale} stages={stageFixtures} /></div></RemoteState
>
