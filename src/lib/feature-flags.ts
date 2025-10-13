// Feature flag utility for toggling Zig modules
export const FEATURE_FLAGS = {
  ZIG3_STUDIO: process.env.ENABLE_ZIG3_STUDIO === 'true',
  ZIG4_STRIPE: process.env.ENABLE_ZIG4_STRIPE === 'true',
  ZIG5_SOCIAL: process.env.ENABLE_ZIG5_SOCIAL === 'true',
  ZIG6_BRANDING: process.env.ENABLE_ZIG6_BRANDING === 'true',
} as const;

export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature];
}

export function getEnabledFeatures(): string[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => enabled)
    .map(([feature, _]) => feature);
}