/**
 * X-style filled SVG icons — custom components matching X's visual design.
 */

interface IconProps {
  size?: number;
  className?: string;
}

export function IconHome({ size = 24, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
      <path d="M12 1.696L.622 8.807l1.06 1.696L3 9.679V19.5C3 20.881 4.119 22 5.5 22h4a1 1 0 001-1v-4h3v4a1 1 0 001 1h4c1.381 0 2.5-1.119 2.5-2.5V9.679l1.318.824 1.06-1.696L12 1.696zM19 19.5c0 .276-.224.5-.5.5H15v-4a1 1 0 00-1-1h-4a1 1 0 00-1 1v4H5.5c-.276 0-.5-.224-.5-.5V8.429l7-4.375 7 4.375V19.5z" />
    </svg>
  );
}

export function IconSearch({ size = 24, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
      <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.814 5.272l4.771 4.772-1.414 1.414-4.772-4.772A8.456 8.456 0 0110.25 18.75c-4.694 0-8.5-3.806-8.5-8.5z" />
    </svg>
  );
}

export function IconBookmark({ size = 24, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
      <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5V19.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z" />
    </svg>
  );
}

export function IconList({ size = 24, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
      <path d="M3 4.5C3 3.12 4.12 2 5.5 2h13C19.88 2 21 3.12 21 4.5v15c0 1.38-1.12 2.5-2.5 2.5h-13C4.12 22 3 20.88 3 19.5v-15zM5.5 4c-.28 0-.5.22-.5.5v15c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-15c0-.28-.22-.5-.5-.5h-13zM16 10H8V8h8v2zm-8 2h8v2H8v-2z" />
    </svg>
  );
}

export function IconCalendar({ size = 24, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
      <path d="M8 2v2H5.5C4.12 4 3 5.12 3 6.5v14C3 21.88 4.12 23 5.5 23h13c1.38 0 2.5-1.12 2.5-2.5v-14C21 5.12 19.88 4 18.5 4H16V2h-2v2H10V2H8zm-2.5 4H8v1h2V6h4v1h2V6h2.5c.28 0 .5.22.5.5V9H5V6.5C5 6.22 5.22 6 5.5 6zM5 11h14v9.5c0 .28-.22.5-.5.5h-13c-.28 0-.5-.22-.5-.5V11zm3 3v2h2v-2H8zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2z" />
    </svg>
  );
}

export function IconMessage({ size = 24, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
      <path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5V17c0 1.381-1.119 2.5-2.5 2.5H9.049l-4.055 3.04A.75.75 0 014 22.5v-3H4.5c-.276 0-.5-.224-.5-.5V5.5zm2.5-.5c-.276 0-.5.224-.5.5V18h1.5a.75.75 0 01.75.75v1.946l3.056-2.292a.75.75 0 01.45-.154H19.5c.276 0 .5-.224.5-.5V5.5c0-.276-.224-.5-.5-.5h-15z" />
    </svg>
  );
}

export function IconAnalytics({ size = 24, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
      <path d="M14 5v14H8V5h6zm-8 1H2.5A2.5 2.5 0 000 8.5v7A2.5 2.5 0 002.5 18H6V6zm10 0v12h3.5a2.5 2.5 0 002.5-2.5v-7A2.5 2.5 0 0019.5 6H16z" />
    </svg>
  );
}

export function IconX({ size = 24, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
