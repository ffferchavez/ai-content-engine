"use client";

import { useEffect, useState } from "react";

/**
 * Match a media query in the browser. Initial value is always `false` on server and on the
 * first client render so markup matches SSR; then we sync to `matchMedia` (avoids hydration
 * mismatches from `getServerSnapshot` vs `getSnapshot` disagreeing on desktop).
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);

  return matches;
}
