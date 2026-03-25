/** Simple class-name joiner (no external deps). Filters falsy values. */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
