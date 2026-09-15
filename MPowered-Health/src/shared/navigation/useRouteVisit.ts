/** Identifies the current visit so temporary form data resets at the right time. */
import { useGlobalSearchParams, usePathname } from 'expo-router';
import { useState } from 'react';

/** Identifies the current visit so temporary form data resets at the right time. */
export function useRouteVisit(prefix: string) {
  const route = useGlobalSearchParams<Record<string, string>>();
  const pathname = usePathname();
  const identity = `${route.fresh ?? ''}:${route.resume ?? ''}`;
  const [visit, setVisit] = useState(() => ({ identity, params: route }));
  const active = pathname === prefix || pathname.startsWith(`${prefix}/`);
  // Adjust only when a new visit enters this feature. Step changes and inactive tabs
  // must not reinitialize the provider from an unrelated route's search parameters.
  if (active && visit.identity !== identity) {
    const next = { identity, params: route };
    setVisit(next);
    return next;
  }
  return visit;
}
