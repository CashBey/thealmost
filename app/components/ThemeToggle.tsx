'use client';

import { useEffect, useState } from 'react';

function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('odd-fun-theme') : null;
    const shouldBeDark = saved ? saved === 'dark' : getSystemPrefersDark();
    document.documentElement.classList.toggle('dark', shouldBeDark);
    setIsDark(shouldBeDark);
  }, []);

  const toggle = () => {
    const next = !isDark;
    document.documentElement.classList.toggle('dark', next);
    window.localStorage.setItem('odd-fun-theme', next ? 'dark' : 'light');
    setIsDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={[
        'fixed right-4 top-4 z-50',
        'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs',
        'bg-white/80 text-neutral-800 backdrop-blur',
        'hover:bg-white transition',
        'dark:bg-black/60 dark:text-neutral-100 dark:border-white/10 dark:hover:bg-black/70',
        'shadow-sm',
      ].join(' ')}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center">
        {isDark ? (
          // moon
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3c.06 0 .12 0 .18 0A7 7 0 0 0 21 12.79Z" />
          </svg>
        ) : (
          // sun
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        )}
      </span>
      <span className="select-none">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
}
