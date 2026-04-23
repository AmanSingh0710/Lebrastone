import React, { Suspense, useEffect, useRef, useState } from "react";

const LazySection = ({ children, minHeight = 280, rootMargin = "250px 0px" }) => {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) return;

    const node = containerRef.current;
    if (!node) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return (
    <div ref={containerRef}>
      {isVisible ? (
        <Suspense
          fallback={<div style={{ minHeight }} className="w-full bg-transparent" />}
        >
          {children}
        </Suspense>
      ) : (
        <div style={{ minHeight }} className="w-full bg-transparent" aria-hidden="true" />
      )}
    </div>
  );
};

export default LazySection;
