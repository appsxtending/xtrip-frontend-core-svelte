export const themes = ['light', 'dark'] as const;
export const densities = ['comfortable', 'compact'] as const;
export const brands = ['forest', 'indigo'] as const;
export type Theme = (typeof themes)[number];
export type Density = (typeof densities)[number];
export type Brand = (typeof brands)[number];
/** Only audited palette presets are applied by the foundation; arbitrary CSS is never accepted. */
export function themePreset(input: unknown): Brand {
  return input === 'indigo' ? 'indigo' : 'forest';
}
export const tokenVersion = '0.1.0';
