import { useState, useEffect } from 'react';

export const ViewportSize = {
  Mobile: 'mobile',
  Tablet: 'tablet',
  Desktop: 'desktop',
} as const;

export type ViewportSize = typeof ViewportSize[keyof typeof ViewportSize];

interface ViewportConfig {
  size: ViewportSize;
  width: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const BREAKPOINTS = {
  tablet: 768,
  desktop: 1024,
} as const;

export const useViewport = (): ViewportConfig => {
  const [width, setWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getViewportSize = (width: number): ViewportSize => {
    if (width < BREAKPOINTS.tablet) {
        return ViewportSize.Mobile;
    }
    if (width < BREAKPOINTS.desktop) {
        return ViewportSize.Tablet;
    }
    return ViewportSize.Desktop;
  };

  const size = getViewportSize(width);

  return {
    size,
    width,
    isMobile: size === ViewportSize.Mobile,
    isTablet: size === ViewportSize.Tablet,
    isDesktop: size === ViewportSize.Desktop,
  };
};
