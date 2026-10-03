export function LoadingState({ label = 'در حال بارگذاری…' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center gap-3 py-16 text-stone-600">
      <span aria-hidden className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-teal-800" />
      <span>{label}</span>
    </div>
  );
}
