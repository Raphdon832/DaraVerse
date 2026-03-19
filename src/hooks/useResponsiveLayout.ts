import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

import { spacing } from "../theme/tokens";

const TABLET_MIN_WIDTH = 768;
const DESKTOP_MIN_WIDTH = 1024;
const WIDE_DESKTOP_MIN_WIDTH = 1440;

export type ResponsiveLayout = {
  width: number;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeScreen: boolean;
  horizontalPadding: number;
  contentMaxWidth: number;
  formMaxWidth: number;
};

export function useResponsiveLayout(): ResponsiveLayout {
  const { width } = useWindowDimensions();

  return useMemo(() => {
    const isDesktop = width >= DESKTOP_MIN_WIDTH;
    const isTablet = width >= TABLET_MIN_WIDTH && !isDesktop;
    const isLargeScreen = width >= TABLET_MIN_WIDTH;

    const horizontalPadding = isDesktop
      ? spacing.xxl
      : isTablet
        ? spacing.xl
        : spacing.md;

    const contentMaxWidth = width >= WIDE_DESKTOP_MIN_WIDTH ? 1320 : 1120;

    return {
      width,
      isTablet,
      isDesktop,
      isLargeScreen,
      horizontalPadding,
      contentMaxWidth,
      formMaxWidth: 560,
    };
  }, [width]);
}
