'use client';

import { adminCardClass } from '@/components/buy/buy-admin-layout';
import { useTheme } from 'next-themes';

export function AdminComingSoon({
  title,
  summary,
  later,
}: {
  title: string;
  summary: string;
  later: string[];
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">Not live yet</p>
        <h1 className={`mt-1 text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
        <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{summary}</p>
      </div>
      <div className={adminCardClass(isDark)}>
        <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>When this ships, operators will</p>
        <ul className={`mt-3 list-disc space-y-2 pl-5 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {later.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
