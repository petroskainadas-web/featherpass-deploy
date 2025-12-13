import { useEffect, useRef, useState } from 'react';

interface ParallaxBackdropProps {
  backgroundImage: string;
  overlayOpacity?: number;
  gradientOverlay?: string;
  minHeightMultiplier?: number;
  imageAspectRatio?: number;
  className?: string;
}

export const ParallaxBackdrop = ({
  backgroundImage,
  overlayOpacity = 0.7,
  gradientOverlay = 'var(--gradient-hero)',
  minHeightMultiplier = 1.5,
  imageAspectRatio = 16 / 9,
  className = '',
}: ParallaxBackdropProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imagePosition, setImagePosition] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [calculatedHeight, setCalculatedHeight] = useState<number>();
  const rafRef = useRef<number>();

  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    // Intersection Observer for performance
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resolveWidth = () => {
      const widthCandidates = [
        container.clientWidth,
        container.parentElement?.clientWidth,
        document.documentElement.clientWidth,
      ].filter((value): value is number => typeof value === 'number' && value > 0);

      return widthCandidates.length > 0 ? Math.max(...widthCandidates) : window.innerWidth;
    };

    const updateHeight = () => {
      const width = resolveWidth();
      const safeAspect = imageAspectRatio > 0 ? imageAspectRatio : 1;
      const aspectHeight = width / safeAspect;
      const viewportFloor = window.innerHeight * minHeightMultiplier;
      const computedHeight = Math.max(aspectHeight, viewportFloor);
      setCalculatedHeight(computedHeight);
    };

    const observerTarget = container.parentElement ?? container;
    const heightObserver = new ResizeObserver(updateHeight);
    heightObserver.observe(observerTarget);
    updateHeight();

    window.addEventListener('resize', updateHeight);

    return () => {
      heightObserver.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [imageAspectRatio, minHeightMultiplier]);

  useEffect(() => {
    if (prefersReducedMotion || !isVisible) return;

    const container = containerRef.current;
    if (!container) return;

    let ticking = false;

    const updateImagePosition = () => {
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const elementTop = rect.top + window.scrollY;
      const elementBottom = elementTop + rect.height;
      const midpoint = window.scrollY + viewportHeight / 2;
      const travelDistance = Math.max(elementBottom - elementTop, 1);

      const rawProgress = (midpoint - elementTop) / travelDistance;
      const clampedProgress = Math.min(1, Math.max(0, rawProgress));

      const phaseHold = 0.3;
      const startPhaseEnd = 0.35;
      const endPhaseStart = Math.min(0.7, startPhaseEnd + phaseHold);

      let position: number;

      if (clampedProgress <= startPhaseEnd) {
        const progressToCenter = clampedProgress / startPhaseEnd;
        position = progressToCenter * 50;
      } else if (clampedProgress <= endPhaseStart) {
        position = 50;
      } else {
        const remainingRange = 1 - endPhaseStart;
        const downwardProgress = remainingRange > 0 ? (clampedProgress - endPhaseStart) / remainingRange : 1;
        position = 50 + downwardProgress * 50;
      }

      setImagePosition(position);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        rafRef.current = requestAnimationFrame(updateImagePosition);
        ticking = true;
      }
    };

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateImagePosition, 150);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    resizeObserver.observe(container);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    updateImagePosition();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      resizeObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [prefersReducedMotion, isVisible]);

  // Calculate minimum height
  const fallbackMinHeight = `${minHeightMultiplier * 100}vh`;
  const resolvedMinHeight = calculatedHeight ? `${calculatedHeight}px` : fallbackMinHeight;

  return (
    <div
      ref={containerRef}
      className={`relative z-0 w-full overflow-hidden ${className}`}
      style={{
        minHeight: resolvedMinHeight,
        willChange: prefersReducedMotion ? 'auto' : 'transform',
      }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-no-repeat bg-cover transition-[background-position] duration-150 ease-out"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundPosition: prefersReducedMotion
            ? 'center center'
            : `center ${imagePosition}%`,
          willChange: prefersReducedMotion ? 'auto' : 'background-position',
        }}
      />

      {/* Gradient Overlay */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{ opacity: overlayOpacity }}
        >
          <div
            className="absolute inset-0 mix-blend-overlay"
            style={{ backgroundImage: gradientOverlay }}
          />
        </div>
      </div>
    </div>
  );
};
