import type { PresentationLocale } from './index.js';
const sessionEnglish = {
  signIn: 'Sign in',
  signOut: 'Sign out',
  session: 'Session integration',
  demo: 'Core integration workbench · authorized test profiles only',
  email: 'Email',
  password: 'Password',
  tenant: 'Tenant ID',
  invalid: 'Unable to sign in or verify. Check your credentials and try again.',
  code: 'Verification code',
  verify: 'Verify',
  refresh: 'Refresh session',
  reconcile: 'Check for updates',
  freshness: 'Last successful check',
  loaded: 'Up to date',
  refreshing: 'Checking for updates',
  stale: 'Data may be out of date',
  paused: 'Updates paused',
  stopped: 'Automatic updates finished',
  forbidden: 'Access unavailable. Sign in again.',
  authentication: 'Please sign in again.',
  conflict: 'This record changed. Reload before trying again.',
  validation: 'Check your input and try again.',
  'not-found': 'This page is unavailable.',
  retryable: 'Temporarily unavailable. Try again later.',
  unexpected: 'Unable to complete the request.',
};
export function sessionCopy(locale: string): Record<keyof typeof sessionEnglish, string> {
  if (locale === 'ar')
    return {
      signIn: 'تسجيل الدخول',
      signOut: 'تسجيل الخروج',
      session: 'جلسة الاختبار',
      demo: 'مساحة اختبار التكامل',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      tenant: 'معرف المؤسسة',
      invalid: 'تعذر تسجيل الدخول. تحقق من البيانات وحاول مرة أخرى.',
      code: 'رمز التحقق',
      verify: 'تحقق',
      refresh: 'تحديث الجلسة',
      reconcile: 'البحث عن تحديثات',
      freshness: 'آخر تحقق ناجح',
      loaded: 'محدث',
      refreshing: 'جار التحديث',
      stale: 'قد تكون البيانات قديمة',
      paused: 'التحديثات متوقفة',
      stopped: 'انتهت التحديثات',
      forbidden: 'الوصول غير متاح',
      authentication: 'يرجى تسجيل الدخول',
      conflict: 'تم تغيير السجل',
      validation: 'تحقق من البيانات',
      'not-found': 'الصفحة غير متاحة',
      retryable: 'غير متاح مؤقتا',
      unexpected: 'تعذر إتمام الطلب',
    };
  if (locale === 'th')
    return {
      signIn: 'เข้าสู่ระบบ',
      signOut: 'ออกจากระบบ',
      session: 'เซสชัน',
      demo: 'พื้นที่ทดสอบการเชื่อมต่อสำหรับบัญชีที่ได้รับอนุญาตเท่านั้น',
      invalid: 'เข้าสู่ระบบหรือยืนยันไม่สำเร็จ โปรดตรวจสอบข้อมูลแล้วลองอีกครั้ง',
      code: 'รหัสยืนยัน',
      verify: 'ยืนยัน',
      freshness: 'ตรวจสอบสำเร็จล่าสุด',
      loaded: 'ข้อมูลล่าสุด',
      refreshing: 'กำลังตรวจสอบข้อมูล',
      stale: 'ข้อมูลอาจไม่เป็นปัจจุบัน',
      paused: 'หยุดการอัปเดตชั่วคราว',
      stopped: 'สิ้นสุดการอัปเดตอัตโนมัติ',
      forbidden: 'ไม่สามารถเข้าถึงได้ โปรดเข้าสู่ระบบอีกครั้ง',
      authentication: 'โปรดเข้าสู่ระบบอีกครั้ง',
      conflict: 'ข้อมูลมีการเปลี่ยนแปลง โปรดโหลดใหม่',
      validation: 'ตรวจสอบข้อมูลแล้วลองอีกครั้ง',
      'not-found': 'ไม่พบหน้าที่ต้องการ',
      retryable: 'ไม่พร้อมใช้งานชั่วคราว โปรดลองภายหลัง',
      unexpected: 'ไม่สามารถดำเนินการได้',
      email: 'อีเมล',
      password: 'รหัสผ่าน',
      tenant: 'รหัสองค์กร',
      refresh: 'รีเฟรชเซสชัน',
      reconcile: 'ตรวจสอบการอัปเดต',
    };
  if (locale === 'en-XA')
    return Object.fromEntries(
      Object.entries(sessionEnglish).map(([k, v]) => [k, '[' + v + ' · ' + v + ']']),
    ) as typeof sessionEnglish;
  return sessionEnglish;
}

export function formatFreshness(timestamp: number, locale: PresentationLocale): string {
  return (
    new Intl.DateTimeFormat(locale === 'en-XA' ? 'en' : locale, {
      dateStyle: 'medium',
      timeStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(timestamp)) + ' UTC'
  );
}
