import { useEffect, useRef } from "react";

const DEFAULT_SELECTOR = ".reveal, .reveal-left, .reveal-right";

export function useScrollReveal(threshold = 0.12) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}

export function useScrollRevealAll(selector = DEFAULT_SELECTOR, threshold = 0.12, deps = []) {
  useEffect(() => {
    // No IntersectionObserver support → reveal everything immediately
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      document.querySelectorAll(selector).forEach((el) => el.classList.add("visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -5% 0px" }
    );

    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      if (!el.classList.contains("visible")) observer.observe(el);
    });

    // Safety fallback: any element still hidden after 2s gets revealed.
    // Prevents permanently-invisible content if the observer misses an element
    // (e.g. lazy-mounted content, transforms applied by parent, etc.).
    const fallback = window.setTimeout(() => {
      document.querySelectorAll(selector).forEach((el) => {
        if (!el.classList.contains("visible")) el.classList.add("visible");
      });
    }, 2000);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector, threshold, ...deps]);
}
