import { createElement } from 'react';
import { AXIS_ICON, CLAY_ICONS } from './clay-icons.generated';

export function AxisIcon({ name, compact = false }: { name: string; compact?: boolean }) {
  const icon = CLAY_ICONS[AXIS_ICON[name]];
  if (!icon) return null;
  return (
    <span
      aria-hidden
      className={compact
        ? 'flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-800'
        : 'mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-800 sm:mb-0'}
    >
      <svg viewBox={icon.viewBox} xmlns="http://www.w3.org/2000/svg" fill="currentColor" className={compact ? 'h-4 w-4' : 'h-6 w-6'} focusable="false">
        {icon.els.map(([tag, attrs], i) => createElement(tag, { key: i, ...attrs }))}
      </svg>
    </span>
  );
}
