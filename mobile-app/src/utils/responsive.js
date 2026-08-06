/**
 * responsive.js
 * Fluid sizing utilities for phones, notch devices, landscape, and tablets.
 */
import { Dimensions, PixelRatio, Platform } from 'react-native';

// ─── Live dimensions (updates on orientation change) ────────────────────────
const getDims = () => Dimensions.get('window');

// Base reference: iPhone 11 (375 × 812)
const BASE_WIDTH  = 375;
const BASE_HEIGHT = 812;

/** Returns current window dimensions */
export const getWindowDims = () => getDims();

/** Current screen width */
export const SCREEN_WIDTH = getDims().width;

/** Current screen height */
export const SCREEN_HEIGHT = getDims().height;

/** True when the device is in landscape orientation */
export const isLandscape = () => {
  const { width, height } = getDims();
  return width > height;
};

/**
 * True when running on a tablet.
 * Tablet detection is based on screen width >= 768 pts.
 */
export const isTablet = () => getDims().width >= 768;

/** True for devices smaller than iPhone SE */
export const isSmallDevice = () => getDims().width < 375;

/**
 * Normalize a size value relative to screen width.
 * @param {number} size - Design-spec size in dp (based on 375px baseline)
 */
export const normalize = (size, based = 'width') => {
  const { width, height } = getDims();
  const scale = based === 'height' ? height / BASE_HEIGHT : width / BASE_WIDTH;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Responsive width — percentage of screen width.
 * @param {number} percent - 0 to 100
 */
export const widthPct = (percent) => (percent * getDims().width) / 100;

/**
 * Responsive height — percentage of screen height.
 * @param {number} percent - 0 to 100
 */
export const heightPct = (percent) => (percent * getDims().height) / 100;

/**
 * Clamps a width to a maximum value (useful for tablets).
 * Centers the content via left/right margin.
 * Returns a style object: { width, alignSelf: 'center' }
 * @param {number} maxWidth - Maximum width in dp (default 600)
 */
export const clampWidth = (maxWidth = 600) => {
  const { width } = getDims();
  return {
    width: Math.min(width, maxWidth),
    alignSelf: 'center' ,
  };
};

/**
 * Returns horizontal padding adjusted for tablets and landscape.
 * Phone portrait: 16–24px | Tablet or landscape: 48–64px
 */
export const getHorizontalPadding = () => {
  if (isTablet()) return 64;
  if (isLandscape()) return 48;
  return 20;
};

/**
 * Standard content max-width for tablet layouts.
 * Use this as the width of inner content containers on wide screens.
 */
export const CONTENT_MAX_WIDTH = 680;
