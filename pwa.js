/* ============ ORION FX — PWA INSTALL & SERVICE WORKER ============
   Shared by all public-facing pages (index.html + everything in /pages/).
   Not loaded on admin.html — the admin panel is desktop/laptop only.
   swPath / manifestPath are set per-page via a small inline snippet before this file loads. */
(function () {
  const swPath = window.ORION_SW_PATH || 'sw.js';

  // Register service worker (only works over HTTPS or on localhost — not on file://)
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(swPath).catch(() => {
        // Silently ignore — offline support is a bonus, not a requirement.
      });
    });
  }

  let deferredPrompt = null;
  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

  function setButtonState(state) {
    document.querySelectorAll('.mobile-app-btn').forEach((btn) => {
      const label = btn.querySelector('span[data-en]');
      if (!label) return;
      if (state === 'installed') {
        label.setAttribute('data-en', 'App Installed');
        label.setAttribute('data-ar', 'تم تثبيت التطبيق');
      } else {
        label.setAttribute('data-en', 'Mobile App');
        label.setAttribute('data-ar', 'تطبيق الجوال');
      }
      const isAr = document.documentElement.lang === 'ar';
      label.textContent = isAr ? label.getAttribute('data-ar') : label.getAttribute('data-en');
    });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    setButtonState('installed');
  });

  if (isStandalone()) setButtonState('installed');

  function handleMobileAppClick() {
    const isAr = document.documentElement.lang === 'ar';

    if (isStandalone()) {
      alert(isAr ? 'التطبيق مثبّت بالفعل على جهازك.' : "You're already using the installed app.");
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(() => {
        deferredPrompt = null;
      });
      return;
    }

    if (isIOS()) {
      alert(
        isAr
          ? 'لتثبيت التطبيق على آيفون: افتح الموقع في متصفح Safari، ثم اضغط على زر المشاركة، ثم اختر "إضافة إلى الشاشة الرئيسية".'
          : 'To install on iPhone: open this site in Safari, tap the Share button, then choose "Add to Home Screen".'
      );
      return;
    }

    alert(
      isAr
        ? 'يمكنك تثبيت هذا الموقع كتطبيق من قائمة المتصفح (عادة عبر أيقونة التثبيت في شريط العنوان أو قائمة المتصفح).'
        : 'You can install this site as an app from your browser menu — look for an install icon in the address bar, or "Add to Home Screen" / "Install App" in the browser menu.'
    );
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.mobile-app-btn');
    if (btn) handleMobileAppClick();
  });
})();
