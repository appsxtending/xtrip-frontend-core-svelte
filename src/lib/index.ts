/** SSR-safe public foundation contract. Business clients and server modules are not exported. */
export const foundationVersion = '0.1.0';
export const presentationLocales = ['en', 'ar', 'th', 'en-XA'] as const;
export type PresentationLocale = (typeof presentationLocales)[number];
export type PresentationTheme = 'light' | 'dark';
export const foundationCopy = {
  en: {
    title: 'A shared foundation. Every journey.',
    eyebrow: 'THE XTRIP WORKBENCH',
    intro: 'One considered starting point for the experiences we build.',
    preview: 'Make it yours',
    description: 'Explore the foundation in your language and preferred appearance.',
    language: 'Language',
    appearance: 'Appearance',
    light: 'Light',
    dark: 'Dark',
    apply: 'Apply appearance',
    saved: 'Appearance preview applied.',
    invalid: 'Choose a supported appearance.',
    foundation: 'Foundation',
    products: 'Four experiences. One standard.',
    next: 'What comes next',
    nextBody:
      'Shared components, connected journeys and the details that make every interaction feel familiar.',
    skip: 'Skip to content',
    status: 'Foundation preview',
  },
  ar: {
    title: 'أساس مشترك. لكل رحلة.',
    eyebrow: 'مساحة عمل إكس تريب',
    intro: 'نقطة انطلاق مدروسة للتجارب التي نبنيها.',
    preview: 'اجعلها تناسبك',
    description: 'استكشف الأساس بلغتك والمظهر الذي تفضله.',
    language: 'اللغة',
    appearance: 'المظهر',
    light: 'فاتح',
    dark: 'داكن',
    apply: 'تطبيق المظهر',
    saved: 'تم تطبيق معاينة المظهر.',
    invalid: 'اختر مظهراً مدعوماً.',
    foundation: 'الأساس',
    products: 'أربع تجارب. معيار واحد.',
    next: 'الخطوة التالية',
    nextBody: 'مكونات مشتركة ورحلات مترابطة وتفاصيل تجعل كل تفاعل مألوفاً.',
    skip: 'انتقل إلى المحتوى',
    status: 'معاينة الأساس',
  },
  th: {
    title: 'รากฐานร่วมกัน เพื่อทุกการเดินทาง',
    eyebrow: 'พื้นที่ทำงาน XTRIP',
    intro: 'จุดเริ่มต้นที่ใส่ใจสำหรับทุกประสบการณ์ที่เราสร้าง',
    preview: 'ปรับให้เป็นคุณ',
    description: 'สำรวจรากฐานในภาษาและรูปแบบที่คุณต้องการ',
    language: 'ภาษา',
    appearance: 'รูปแบบ',
    light: 'สว่าง',
    dark: 'มืด',
    apply: 'ใช้รูปแบบ',
    saved: 'ใช้ตัวอย่างรูปแบบแล้ว',
    invalid: 'เลือกรูปแบบที่รองรับ',
    foundation: 'รากฐาน',
    products: 'สี่ประสบการณ์ หนึ่งมาตรฐาน',
    next: 'ก้าวต่อไป',
    nextBody: 'องค์ประกอบร่วมกัน การเดินทางที่เชื่อมต่อ และรายละเอียดที่ทำให้ทุกการใช้งานคุ้นเคย',
    skip: 'ข้ามไปยังเนื้อหา',
    status: 'ตัวอย่างรากฐาน',
  },
} as const;
export function presentationCopy(
  locale: PresentationLocale,
): Record<keyof typeof foundationCopy.en, string> {
  if (locale === 'en-XA')
    return Object.fromEntries(
      Object.entries(foundationCopy.en).map(([key, value]) => [key, `[ ${value} · ${value} ]`]),
    ) as Record<keyof typeof foundationCopy.en, string>;
  return foundationCopy[locale];
}
