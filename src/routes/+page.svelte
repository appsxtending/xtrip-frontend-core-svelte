<script lang="ts">
  import { presentationCopy, type PresentationLocale, type PresentationTheme } from '#lib';
  type PageData = { locale: PresentationLocale; theme: PresentationTheme; applied: boolean };
  let { data, form = null }: { data: PageData; form?: { invalid?: boolean } | null } = $props();
  let copy = $derived(presentationCopy(data.locale));
  let expanded = $state(false);
  const products = [
    {
      n: '01',
      name: 'Tenant workspace',
      text: 'Manage your business, from catalog to operations.',
      ar: 'مساحة عمل الشركة',
      arText: 'أدر أعمالك من الكتالوج إلى العمليات.',
      th: 'พื้นที่ทำงานผู้ประกอบการ',
    },
    {
      n: '02',
      name: 'Agent portal',
      text: 'Discover, plan and book with confidence.',
      ar: 'بوابة الوكلاء',
      arText: 'اكتشف وخطط واحجز بثقة.',
      th: 'พอร์ทัลตัวแทน',
    },
    {
      n: '03',
      name: 'Platform administration',
      text: 'A clear view of the entire ecosystem.',
      ar: 'إدارة المنصة',
      arText: 'رؤية واضحة لجميع أجزاء المنظومة.',
      th: 'การดูแลแพลตฟอร์ม',
    },
    {
      n: '04',
      name: 'Traveler storefront',
      text: 'Inspiring experiences, beautifully within reach.',
      ar: 'واجهة المسافر',
      arText: 'تجارب ملهمة في متناول يدك.',
      th: 'หน้าร้านสำหรับนักเดินทาง',
    },
  ];
</script>

<svelte:head
  ><title>XTrip · {copy.foundation}</title><meta name="description" content={copy.intro} /><meta
    name="robots"
    content="noindex,nofollow"
  /></svelte:head
>
<a class="skip" href="#main">{copy.skip}</a>
<header class="masthead">
  <a data-sveltekit-reload class="brand" href="/" aria-label="XTrip home" dir="ltr"
    ><span class="brand-symbol" aria-hidden="true">x</span>xtrip<span class="brand-dot">.</span></a
  ><span class="edition">{copy.eyebrow}</span><span class="status"
    ><span aria-hidden="true">●</span> {copy.status}</span
  >
</header>
<main class="text-ink" id="main" tabindex="-1">
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-copy">
      <p class="eyebrow">01 / {copy.foundation}</p>
      <h1 id="hero-title">{copy.title}</h1>
      <p class="intro">{copy.intro}</p>
      <a class="text-link" href="#preview">{copy.preview}<span aria-hidden="true">↗</span></a>
    </div>
    <div class="journey-art" aria-hidden="true">
      <div class="art-orbit orbit-one"></div>
      <div class="art-orbit orbit-two"></div>
      <div class="art-orbit orbit-three"></div>
      <div class="art-center">x<span>✦</span></div>
      <span class="art-note">BUILT TO CONNECT</span><span class="art-coordinate">X / 01</span>
    </div>
  </section>
  <section class="experience-section" aria-labelledby="products-title">
    <div class="section-heading">
      <h2 id="products-title">{copy.products}</h2>
      <span class="section-index" aria-hidden="true">01 — 04</span>
    </div>
    <div class="product-grid">
      {#each products as product (product.n)}<article class="product">
          <span class="product-number">{product.n}</span>
          <h3>
            {data.locale === 'ar' ? product.ar : data.locale === 'th' ? product.th : product.name}
          </h3>
          <p lang={data.locale === 'ar' ? 'ar' : 'en'} dir={data.locale === 'ar' ? 'rtl' : 'ltr'}>
            {data.locale === 'ar' ? product.arText : product.text}
          </p>
          <span class="product-state"
            >{data.locale === 'ar' ? 'مخطط' : data.locale === 'th' ? 'วางแผนไว้' : 'Planned'}</span
          >
        </article>{/each}
    </div>
  </section>
  <section id="preview" class="preview" aria-labelledby="preview-title">
    <div>
      <p class="eyebrow">02 / {copy.foundation}</p>
      <h2 id="preview-title">{copy.preview}</h2>
      <p class="preview-description">{copy.description}</p>
    </div>
    <div class="preview-controls">
      <nav aria-label={copy.language}>
        <span class="control-label">{copy.language}</span>
        <div class="locale-list">
          {#each [{ id: 'en', label: 'English' }, { id: 'ar', label: 'العربية' }, { id: 'th', label: 'ไทย' }, { id: 'en-XA', label: 'Extended' }] as locale (locale.id)}<a
              data-sveltekit-reload
              href={`/?locale=${locale.id}&theme=${data.theme}#preview`}
              lang={locale.id === 'en-XA' ? 'en' : locale.id}
              aria-current={data.locale === locale.id ? 'page' : undefined}>{locale.label}</a
            >{/each}
        </div>
      </nav>
      <form method="POST">
        <label class="control-label" for="theme">{copy.appearance}</label>
        <div class="form-row">
          <select id="theme" name="theme" value={data.theme}
            ><option value="light">{copy.light}</option><option value="dark">{copy.dark}</option
            ></select
          ><button class="primary" type="submit"
            >{copy.apply}<span aria-hidden="true">→</span></button
          >
        </div>
        {#if form?.invalid}<p role="alert">{copy.invalid}</p>{/if}{#if data.applied}<p
            class="confirmation"
            role="status"
          >
            ✓ {copy.saved}
          </p>{/if}
      </form>
    </div>
  </section>
  <section class="next">
    <button
      class="disclosure"
      type="button"
      aria-expanded={expanded}
      aria-controls="next-detail"
      onclick={() => (expanded = !expanded)}
      ><span>{copy.next}</span><span aria-hidden="true">{expanded ? '−' : '+'}</span></button
    >
    <div id="next-detail" hidden={!expanded}><p>{copy.nextBody}</p></div>
  </section>
</main>
<footer>
  <span class="footer-brand" dir="ltr">xtrip.</span>
  <p lang={data.locale === 'ar' ? 'ar' : 'en'} dir={data.locale === 'ar' ? 'rtl' : 'ltr'}>
    {data.locale === 'ar'
      ? 'أسس مدروسة. تجارب مترابطة.'
      : 'Thoughtful foundations. Connected experiences.'}
  </p>
  <span dir="auto">{copy.foundation} 0.1</span>
</footer>
